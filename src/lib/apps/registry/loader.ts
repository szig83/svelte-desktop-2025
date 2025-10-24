/**
 * Alkalmazás betöltő rendszer
 * Fejlett alkalmazás betöltési és cache kezelési funkciók
 */

import type { SvelteComponent } from 'svelte';
import type { AppMetadata, AppModule } from './index.js';

export interface LoaderOptions {
	cache: boolean;
	timeout: number;
	retries: number;
	validateComponent: boolean;
}

export interface LoadResult {
	success: boolean;
	component?: SvelteComponent;
	metadata?: AppMetadata;
	loadTime: number;
	fromCache: boolean;
	error?: Error;
}

export interface CacheEntry {
	component: SvelteComponent;
	metadata?: AppMetadata;
	loadedAt: number;
	accessCount: number;
	lastAccessed: number;
}

/**
 * Alkalmazás betöltő osztály
 */
export class AppLoader {
	private cache = new Map<string, CacheEntry>();
	private loadingPromises = new Map<string, Promise<LoadResult>>();
	private defaultOptions: LoaderOptions = {
		cache: true,
		timeout: 10000, // 10 másodperc
		retries: 3,
		validateComponent: true
	};

	/**
	 * Alkalmazás betöltése.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @returns Betöltési eredmény
	 */
	async loadApp(appId: string, options: Partial<LoaderOptions> = {}): Promise<LoadResult> {
		const opts = { ...this.defaultOptions, ...options };
		const startTime = Date.now();

		// Ellenőrizzük a cache-t
		if (opts.cache && this.cache.has(appId)) {
			const cacheEntry = this.cache.get(appId)!;
			cacheEntry.accessCount++;
			cacheEntry.lastAccessed = Date.now();

			return {
				success: true,
				component: cacheEntry.component,
				metadata: cacheEntry.metadata,
				loadTime: Date.now() - startTime,
				fromCache: true
			};
		}

		// Ellenőrizzük, hogy már folyamatban van-e a betöltés
		if (this.loadingPromises.has(appId)) {
			return this.loadingPromises.get(appId)!;
		}

		// Indítsuk el a betöltést
		const loadPromise = this.performLoad(appId, opts, startTime);
		this.loadingPromises.set(appId, loadPromise);

		try {
			const result = await loadPromise;
			return result;
		} finally {
			this.loadingPromises.delete(appId);
		}
	}

	/**
	 * Tényleges betöltés végrehajtása.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @param startTime - Betöltés kezdési ideje
	 * @returns Betöltési eredmény
	 */
	private async performLoad(
		appId: string,
		options: LoaderOptions,
		startTime: number
	): Promise<LoadResult> {
		let lastError: Error | undefined;

		for (let attempt = 1; attempt <= options.retries; attempt++) {
			try {
				const result = await this.attemptLoad(appId, options, startTime);

				// Cache-eljük az eredményt, ha sikeres
				if (result.success && result.component && options.cache) {
					this.cache.set(appId, {
						component: result.component,
						metadata: result.metadata,
						loadedAt: Date.now(),
						accessCount: 1,
						lastAccessed: Date.now()
					});
				}

				return result;
			} catch (error) {
				lastError = error as Error;

				// Ha nem az utolsó próbálkozás, várjunk egy kicsit
				if (attempt < options.retries) {
					await this.delay(1000 * attempt); // Exponenciális backoff
				}
			}
		}

		return {
			success: false,
			loadTime: Date.now() - startTime,
			fromCache: false,
			error: lastError || new Error('Ismeretlen hiba a betöltés során')
		};
	}

	/**
	 * Egy betöltési kísérlet.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @param startTime - Betöltés kezdési ideje
	 * @returns Betöltési eredmény
	 */
	private async attemptLoad(
		appId: string,
		options: LoaderOptions,
		startTime: number
	): Promise<LoadResult> {
		// Timeout kezelés
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Betöltési timeout')), options.timeout);
		});

		const loadPromise = this.doLoad(appId, options);

		const result = await Promise.race([loadPromise, timeoutPromise]);
		return {
			...result,
			loadTime: Date.now() - startTime,
			fromCache: false
		};
	}

	/**
	 * Tényleges betöltési logika.
	 * @param appId - Az alkalmazás azonosítója
	 * @param options - Betöltési opciók
	 * @returns Betöltési eredmény (idő és cache információk nélkül)
	 */
	private async doLoad(
		appId: string,
		options: LoaderOptions
	): Promise<Omit<LoadResult, 'loadTime' | 'fromCache'>> {
		try {
			// Próbáljuk betölteni az alkalmazás modult
			const appModule: AppModule = await import(`../${appId}/index.svelte`);

			if (!appModule.default) {
				throw new Error('Az alkalmazás modul nem tartalmaz default exportot');
			}

			// Komponens validálás
			if (options.validateComponent && !this.validateComponent(appModule.default)) {
				throw new Error('Érvénytelen alkalmazás komponens');
			}

			// Próbáljuk betölteni a metaadatokat
			let metadata: AppMetadata | undefined;
			try {
				const metadataModule = await import(`../${appId}/metadata.ts`);
				metadata = metadataModule.metadata;
			} catch {
				// Metaadatok opcionálisak
			}

			return {
				success: true,
				component: appModule.default,
				metadata
			};
		} catch (error) {
			throw new Error(`Hiba az alkalmazás betöltése során: ${appId} - ${error}`);
		}
	}

	/**
	 * Komponens validálása.
	 * @param component - A validálandó komponens
	 * @returns True, ha érvényes komponens
	 */
	private validateComponent(component: unknown): boolean {
		// Alapvető Svelte komponens ellenőrzés
		return typeof component === 'function' || (typeof component === 'object' && component !== null);
	}

	/**
	 * Késleltetés segédfunkció.
	 * @param ms - Késleltetés milliszekundumban
	 * @returns Promise, amely a megadott idő után teljesül
	 */
	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Cache tisztítása.
	 * @param appId - Opcionális alkalmazás azonosító (ha nincs megadva, az összes törlődik)
	 */
	clearCache(appId?: string): void {
		if (appId) {
			this.cache.delete(appId);
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Cache statisztikák.
	 * @returns Cache statisztikai adatok
	 */
	getCacheStats(): {
		size: number;
		entries: Array<{
			appId: string;
			loadedAt: number;
			accessCount: number;
			lastAccessed: number;
		}>;
	} {
		const entries: Array<{
			appId: string;
			loadedAt: number;
			accessCount: number;
			lastAccessed: number;
		}> = [];

		this.cache.forEach((entry, appId) => {
			entries.push({
				appId,
				loadedAt: entry.loadedAt,
				accessCount: entry.accessCount,
				lastAccessed: entry.lastAccessed
			});
		});

		return {
			size: this.cache.size,
			entries
		};
	}

	/**
	 * Cache karbantartás (régi bejegyzések eltávolítása).
	 * @param maxAge - Maximális életkor milliszekundumban (alapértelmezett: 30 perc)
	 */
	maintainCache(maxAge: number = 30 * 60 * 1000): void {
		// 30 perc alapértelmezett
		const now = Date.now();
		const toDelete: string[] = [];

		this.cache.forEach((entry, appId) => {
			if (now - entry.lastAccessed > maxAge) {
				toDelete.push(appId);
			}
		});

		toDelete.forEach((appId) => this.cache.delete(appId));
	}

	/**
	 * Alkalmazás előzetes betöltése.
	 * @param appId - Az alkalmazás azonosítója
	 * @returns True, ha a betöltés sikeres volt
	 */
	async preloadApp(appId: string): Promise<boolean> {
		try {
			const result = await this.loadApp(appId, { cache: true });
			return result.success;
		} catch {
			return false;
		}
	}

	/**
	 * Több alkalmazás előzetes betöltése.
	 * @param appIds - Az alkalmazások azonosítóinak listája
	 * @returns Objektum az alkalmazás azonosítókkal és betöltési eredményekkel
	 */
	async preloadApps(appIds: string[]): Promise<Record<string, boolean>> {
		const results: Record<string, boolean> = {};

		const promises = appIds.map(async (appId) => {
			results[appId] = await this.preloadApp(appId);
		});

		await Promise.all(promises);
		return results;
	}
}

// Globális betöltő példány
export const appLoader = new AppLoader();
