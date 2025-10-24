/**
 * Alkalmazás regiszter rendszer
 * Központi helye az alkalmazások regisztrációjának és kezelésének
 */

import type { SvelteComponent } from 'svelte';

export interface WindowSize {
	width: number;
	height: number;
}

export interface Permission {
	resource: string;
	action: string;
}

import type { AppCategory } from '../../constants.js';

export type { AppCategory };

export interface AppMetadata {
	id: string;
	name: string;
	description: string;
	version: string;
	icon: string;
	category: AppCategory;
	permissions: Permission[];
	multiInstance: boolean;
	defaultSize: WindowSize;
	minSize: WindowSize;
	maxSize?: WindowSize;
	author?: string;
	homepage?: string;
	keywords?: string[];
	dependencies?: string[];
	helpId?: number;
}

export interface AppModule {
	default: SvelteComponent;
	metadata?: AppMetadata;
}

export interface AppStructure {
	mainComponent: SvelteComponent;
	metadata: AppMetadata;
	stores?: Record<string, unknown>;
	types?: Record<string, unknown>;
	utils?: Record<string, (...args: unknown[]) => unknown>;
}

export interface AppRegistrationOptions {
	autoLoad?: boolean;
	validateStructure?: boolean;
	overwrite?: boolean;
}

export interface AppLoadOptions {
	forceReload?: boolean;
	validatePermissions?: boolean;
}

export type AppRegistrationEvent = 'registered' | 'unregistered' | 'loaded' | 'error';

export interface AppRegistrationEventData {
	appId: string;
	metadata?: AppMetadata;
	error?: Error;
}

/**
 * Alkalmazás regiszter osztály
 * Kezeli az alkalmazások regisztrációját és betöltését
 */
export class AppRegistry {
	private apps = new Map<string, AppMetadata>();
	private loadedApps = new Map<string, SvelteComponent>();
	private eventListeners = new Map<
		AppRegistrationEvent,
		Set<(data: AppRegistrationEventData) => void>
	>();

	constructor() {
		this.initializeEventSystem();
	}

	/**
	 * Event rendszer inicializálása
	 */
	private initializeEventSystem(): void {
		const events: AppRegistrationEvent[] = ['registered', 'unregistered', 'loaded', 'error'];
		events.forEach((event) => {
			this.eventListeners.set(event, new Set());
		});
	}

	/**
	 * Event listener hozzáadása
	 * @param event
	 * @param callback
	 */
	addEventListener(
		event: AppRegistrationEvent,
		callback: (data: AppRegistrationEventData) => void
	): void {
		const listeners = this.eventListeners.get(event);
		if (listeners) {
			listeners.add(callback);
		}
	}

	/**
	 * Event listener eltávolítása
	 * @param event
	 * @param callback
	 */
	removeEventListener(
		event: AppRegistrationEvent,
		callback: (data: AppRegistrationEventData) => void
	): void {
		const listeners = this.eventListeners.get(event);
		if (listeners) {
			listeners.delete(callback);
		}
	}

	/**
	 * Event kiváltása
	 * @param event
	 * @param data
	 */
	private emitEvent(event: AppRegistrationEvent, data: AppRegistrationEventData): void {
		const listeners = this.eventListeners.get(event);
		if (listeners) {
			listeners.forEach((callback) => {
				try {
					callback(data);
				} catch (error) {
					console.error(`Hiba az event callback végrehajtása során:`, error);
				}
			});
		}
	}

	/**
	 * Alkalmazás regisztrálása
	 * @param metadata
	 * @param options
	 */
	registerApp(metadata: AppMetadata, options: AppRegistrationOptions = {}): void {
		const { overwrite = false, validateStructure = true } = options;

		// Ellenőrizzük, hogy az alkalmazás már regisztrálva van-e
		if (this.apps.has(metadata.id) && !overwrite) {
			throw new Error(`Alkalmazás már regisztrálva van: ${metadata.id}`);
		}

		// Struktúra validálás
		if (validateStructure && !this.validateAppMetadata(metadata)) {
			throw new Error(`Érvénytelen alkalmazás metaadatok: ${metadata.id}`);
		}

		this.apps.set(metadata.id, metadata);
		this.emitEvent('registered', { appId: metadata.id, metadata });
	}

	/**
	 * Alkalmazás regisztráció törlése
	 * @param id
	 */
	unregisterApp(id: string): boolean {
		const existed = this.apps.delete(id);
		if (existed) {
			// Betöltött alkalmazás is törlése
			this.loadedApps.delete(id);
			this.emitEvent('unregistered', { appId: id });
		}
		return existed;
	}

	/**
	 * Alkalmazás betöltése
	 * @param id
	 * @param options
	 */
	async loadApp(id: string, options: AppLoadOptions = {}): Promise<SvelteComponent> {
		const { forceReload = false } = options;

		// Ha már be van töltve és nem kényszerítjük az újratöltést
		if (this.loadedApps.has(id) && !forceReload) {
			return this.loadedApps.get(id)!;
		}

		const metadata = this.apps.get(id);
		if (!metadata) {
			const error = new Error(`Alkalmazás nem található: ${id}`);
			this.emitEvent('error', { appId: id, error });
			throw error;
		}

		try {
			// Dinamikus import az alkalmazás betöltéséhez
			const appModule = await import(`../${id}/index.svelte`);
			const component = appModule.default;

			if (!component) {
				throw new Error(`Alkalmazás komponens nem található: ${id}`);
			}

			this.loadedApps.set(id, component);
			this.emitEvent('loaded', { appId: id, metadata });
			return component;
		} catch (error) {
			const appError = new Error(`Hiba az alkalmazás betöltése során: ${id} - ${error}`);
			this.emitEvent('error', { appId: id, error: appError });
			throw appError;
		}
	}

	/**
	 * Alkalmazás metaadatok validálása
	 * @param metadata
	 */
	private validateAppMetadata(metadata: AppMetadata): boolean {
		const requiredFields = ['id', 'name', 'version', 'category'];

		for (const field of requiredFields) {
			if (!metadata[field as keyof AppMetadata]) {
				return false;
			}
		}

		// ID formátum ellenőrzése
		if (!/^[a-z0-9-_]+$/.test(metadata.id)) {
			return false;
		}

		// Verzió formátum ellenőrzése (egyszerű)
		if (!/^\d+\.\d+\.\d+/.test(metadata.version)) {
			return false;
		}

		// Ablak méretek ellenőrzése
		if (metadata.defaultSize.width <= 0 || metadata.defaultSize.height <= 0) {
			return false;
		}

		if (metadata.minSize.width <= 0 || metadata.minSize.height <= 0) {
			return false;
		}

		return true;
	}

	/**
	 * Alkalmazások lekérése kategória szerint
	 * @param category
	 */
	getAppsByCategory(category: AppCategory): AppMetadata[] {
		return Array.from(this.apps.values()).filter((app) => app.category === category);
	}

	/**
	 * Alkalmazások keresése kulcsszavak alapján
	 * @param query
	 */
	searchApps(query: string): AppMetadata[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.apps.values()).filter((app) => {
			return (
				app.name.toLowerCase().includes(lowerQuery) ||
				app.description.toLowerCase().includes(lowerQuery) ||
				app.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
			);
		});
	}

	/**
	 * Összes alkalmazás lekérése
	 */
	getAllApps(): AppMetadata[] {
		return Array.from(this.apps.values());
	}

	/**
	 * Alkalmazás metaadatok lekérése
	 * @param id
	 */
	getAppMetadata(id: string): AppMetadata | undefined {
		return this.apps.get(id);
	}

	/**
	 * Alkalmazás létezésének ellenőrzése
	 * @param id
	 */
	hasApp(id: string): boolean {
		return this.apps.has(id);
	}

	/**
	 * Betöltött alkalmazás ellenőrzése
	 * @param id
	 */
	isAppLoaded(id: string): boolean {
		return this.loadedApps.has(id);
	}

	/**
	 * Alkalmazások számának lekérése
	 */
	getAppCount(): number {
		return this.apps.size;
	}

	/**
	 * Betöltött alkalmazások számának lekérése
	 */
	getLoadedAppCount(): number {
		return this.loadedApps.size;
	}

	/**
	 * Registry állapotának lekérése
	 */
	getRegistryStats(): {
		totalApps: number;
		loadedApps: number;
		categories: Record<AppCategory, number>;
	} {
		const categories = {} as Record<AppCategory, number>;

		this.apps.forEach((app) => {
			categories[app.category] = (categories[app.category] || 0) + 1;
		});

		return {
			totalApps: this.apps.size,
			loadedApps: this.loadedApps.size,
			categories
		};
	}

	/**
	 * Registry tisztítása
	 */
	clear(): void {
		this.apps.clear();
		this.loadedApps.clear();
	}
}

/**
 * Alkalmazás auto-discovery rendszer
 */
export class AppDiscovery {
	private registry: AppRegistry;

	constructor(registry: AppRegistry) {
		this.registry = registry;
	}

	/**
	 * Alkalmazások automatikus felderítése és regisztrálása
	 */
	async discoverAndRegisterApps(): Promise<void> {
		const appIds = await this.discoverApps();

		for (const appId of appIds) {
			try {
				await this.registerDiscoveredApp(appId);
			} catch (error) {
				console.warn(`Nem sikerült regisztrálni az alkalmazást: ${appId}`, error);
			}
		}
	}

	/**
	 * Alkalmazások felderítése
	 */
	private async discoverApps(): Promise<string[]> {
		// Ez egy egyszerűsített implementáció
		// Valós környezetben ez dinamikusan fedezné fel az alkalmazásokat
		const knownApps = ['app1', 'app2', 'help', 'settings', 'users'];
		return knownApps;
	}

	/**
	 * Felderített alkalmazás regisztrálása
	 * @param appId
	 */
	private async registerDiscoveredApp(appId: string): Promise<void> {
		try {
			// Próbáljuk betölteni a metaadatokat
			const metadataModule = await this.loadAppMetadata(appId);

			if (metadataModule && metadataModule.metadata) {
				this.registry.registerApp(metadataModule.metadata, { overwrite: true });
			} else {
				// Ha nincs metaadat fájl, hozzunk létre alapértelmezett metaadatokat
				const defaultMetadata = this.createDefaultMetadata(appId);
				this.registry.registerApp(defaultMetadata, { overwrite: true });
			}
		} catch (error) {
			throw new Error(`Hiba az alkalmazás regisztrálása során: ${appId} - ${error}`);
		}
	}

	/**
	 * Alkalmazás metaadatok betöltése
	 * @param appId
	 */
	private async loadAppMetadata(appId: string): Promise<{ metadata: AppMetadata } | null> {
		try {
			// Próbáljuk betölteni a metadata.ts fájlt
			const metadataModule = await import(`../${appId}/metadata.ts`);
			return metadataModule;
		} catch {
			// Ha nincs metadata.ts fájl, próbáljuk az index.svelte-ből
			try {
				const appModule = await import(`../${appId}/index.svelte`);
				if (appModule.metadata) {
					return { metadata: appModule.metadata };
				}
			} catch {
				// Nincs metaadat
			}
		}
		return null;
	}

	/**
	 * Alapértelmezett metaadatok létrehozása
	 * @param appId
	 */
	private createDefaultMetadata(appId: string): AppMetadata {
		return {
			id: appId,
			name: this.capitalizeAppName(appId),
			description: `${this.capitalizeAppName(appId)} alkalmazás`,
			version: '1.0.0',
			icon: `/icons/${appId}.svg`,
			category: 'other',
			permissions: [],
			multiInstance: false,
			defaultSize: { width: 800, height: 600 },
			minSize: { width: 400, height: 300 }
		};
	}

	/**
	 * Alkalmazás név formázása
	 * @param appId
	 */
	private capitalizeAppName(appId: string): string {
		return appId
			.split(/[-_]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
}
// Globális alkalmazás regiszter példány
export const appRegistry = new AppRegistry();

// Alkalmazás felderítő rendszer
export const appDiscovery = new AppDiscovery(appRegistry);

// Export core registry functionality
export { AppRegistryManager } from './core.js';
export type { AppRegistryCore, AppRegistryService } from './core.js';

/**
 * Registry inicializálása
 * Automatikusan felderíti és regisztrálja az alkalmazásokat
 */
export async function initializeAppRegistry(): Promise<void> {
	try {
		await appDiscovery.discoverAndRegisterApps();
		console.log('Alkalmazás registry sikeresen inicializálva');
	} catch (error) {
		console.error('Hiba az alkalmazás registry inicializálása során:', error);
	}
}
