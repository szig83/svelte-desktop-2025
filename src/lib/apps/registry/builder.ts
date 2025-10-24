/**
 * Alkalmazás építő rendszer
 * Új alkalmazások létrehozásához és meglévők módosításához
 */

import type { AppMetadata } from './index.js';
import type { AppStructureConfig } from '../shared/template.js';
import { generateAppStructure } from '../shared/template.js';
import { appRegistry } from './index.js';

export interface AppBuildOptions {
	structure: Partial<AppStructureConfig>;
	metadata: Partial<AppMetadata>;
	autoRegister: boolean;
	createFiles: boolean;
}

export interface AppBuildResult {
	success: boolean;
	appId: string;
	files: Record<string, string>;
	directories: string[];
	errors: string[];
}

/**
 * Alkalmazás építő osztály
 */
export class AppBuilder {
	/**
	 * Új alkalmazás létrehozása
	 */
	static async createApp(
		appId: string,
		appName: string,
		description?: string,
		options: Partial<AppBuildOptions> = {}
	): Promise<AppBuildResult> {
		const buildOptions: AppBuildOptions = {
			structure: {
				includeStores: false,
				includeTypes: false,
				includeUtils: false,
				includeComponents: false,
				includeTests: false
			},
			metadata: {},
			autoRegister: true,
			createFiles: false,
			...options
		};

		const errors: string[] = [];

		try {
			// Validáljuk az alkalmazás ID-t
			if (!this.validateAppId(appId)) {
				errors.push('Érvénytelen alkalmazás ID formátum');
			}

			// Ellenőrizzük, hogy már létezik-e
			if (appRegistry.hasApp(appId)) {
				errors.push('Az alkalmazás már létezik');
			}

			if (errors.length > 0) {
				return {
					success: false,
					appId,
					files: {},
					directories: [],
					errors
				};
			}

			// Generáljuk az alkalmazás struktúrát
			const structure = generateAppStructure(appId, appName, description, buildOptions.structure);

			// Hozzunk létre metaadatokat
			const metadata: AppMetadata = {
				id: appId,
				name: appName,
				description: description || `${appName} alkalmazás`,
				version: '1.0.0',
				icon: `/icons/${appId}.svg`,
				category: 'other',
				permissions: [],
				multiInstance: false,
				defaultSize: { width: 800, height: 600 },
				minSize: { width: 400, height: 300 },
				...buildOptions.metadata
			};

			// Regisztráljuk az alkalmazást, ha szükséges
			if (buildOptions.autoRegister) {
				appRegistry.registerApp(metadata);
			}

			return {
				success: true,
				appId,
				files: structure.files,
				directories: structure.directories,
				errors: []
			};
		} catch (error) {
			errors.push(`Hiba az alkalmazás létrehozása során: ${error}`);
			return {
				success: false,
				appId,
				files: {},
				directories: [],
				errors
			};
		}
	}

	/**
	 * Alkalmazás ID validálása
	 */
	private static validateAppId(appId: string): boolean {
		// Csak kisbetűk, számok, kötőjelek és aláhúzások
		return /^[a-z0-9-_]+$/.test(appId) && appId.length > 0 && appId.length <= 50;
	}

	/**
	 * Alkalmazás struktúra validálása
	 */
	static validateAppStructure(appId: string): {
		valid: boolean;
		issues: string[];
		suggestions: string[];
	} {
		const issues: string[] = [];
		const suggestions: string[] = [];

		// Ellenőrizzük, hogy regisztrálva van-e
		if (!appRegistry.hasApp(appId)) {
			issues.push('Az alkalmazás nincs regisztrálva');
			suggestions.push('Regisztrálja az alkalmazást az appRegistry.registerApp() használatával');
		}

		// További validációs logika itt...

		return {
			valid: issues.length === 0,
			issues,
			suggestions
		};
	}

	/**
	 * Alkalmazás metaadatok frissítése
	 */
	static updateAppMetadata(appId: string, updates: Partial<AppMetadata>): boolean {
		const currentMetadata = appRegistry.getAppMetadata(appId);
		if (!currentMetadata) {
			return false;
		}

		const updatedMetadata: AppMetadata = {
			...currentMetadata,
			...updates
		};

		try {
			appRegistry.registerApp(updatedMetadata, { overwrite: true });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Alkalmazás klónozása
	 */
	static async cloneApp(
		sourceAppId: string,
		newAppId: string,
		newAppName: string,
		modifications: Partial<AppMetadata> = {}
	): Promise<AppBuildResult> {
		const sourceMetadata = appRegistry.getAppMetadata(sourceAppId);
		if (!sourceMetadata) {
			return {
				success: false,
				appId: newAppId,
				files: {},
				directories: [],
				errors: ['Forrás alkalmazás nem található']
			};
		}

		const clonedMetadata: Partial<AppMetadata> = {
			...sourceMetadata,
			id: newAppId,
			name: newAppName,
			...modifications
		};

		return this.createApp(newAppId, newAppName, clonedMetadata.description, {
			metadata: clonedMetadata,
			autoRegister: true
		});
	}
}
