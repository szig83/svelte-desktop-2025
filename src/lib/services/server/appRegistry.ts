/**
 * Server-side App Registry Service (Test-friendly version)
 * Provides app metadata loading for SSR and API endpoints without SvelteKit dependencies
 */

import { type AppMetadata } from '$lib/types/window';
import {
	AppRegistryManager,
	convertToWindowMetadataArray,
	convertToWindowMetadata
} from '$lib/apps/registry/core';
import type { AppRegistryService } from '$lib/apps/registry/types';

/**
 * Server-side App Registry Service Implementation.
 * Works in both SvelteKit and test environments.
 */
export class ServerAppRegistryService implements AppRegistryService {
	private registryManager: AppRegistryManager;
	private initialized = false;

	// Performance optimizations
	private appsCache: AppMetadata[] | null = null;
	private cacheTimestamp: number = 0;
	private cacheTimeout = 10 * 60 * 1000; // 10 minutes cache for server
	private initializationPromise: Promise<void> | null = null;

	constructor() {
		this.registryManager = new AppRegistryManager();
	}

	/**
	 * Get all apps with server-side initialization.
	 * @returns Promise resolving to array of app metadata
	 */
	async getApps(): Promise<AppMetadata[]> {
		// Check cache first
		if (this.isCacheValid()) {
			return this.appsCache!;
		}

		await this.ensureInitialized();

		const registryApps = this.registryManager.getAllApps();
		const apps = convertToWindowMetadataArray(registryApps);

		// Update cache
		this.updateCache(apps);
		return apps;
	}

	/**
	 * Get app by name with server-side initialization.
	 * @param appName - The name of the app to retrieve
	 * @returns Promise resolving to app metadata or undefined if not found
	 */
	async getAppByName(appName: string): Promise<AppMetadata | undefined> {
		await this.ensureInitialized();

		const registryApp = this.registryManager.getAppByName(appName);
		return registryApp ? convertToWindowMetadata(registryApp) : undefined;
	}

	/**
	 * Get apps by category.
	 * @param category - The category to filter by
	 * @returns Promise resolving to array of app metadata
	 */
	async getAppsByCategory(category: string): Promise<AppMetadata[]> {
		const allApps = await this.getApps();
		return allApps.filter((app) => app.category === category);
	}

	/**
	 * Search apps by query.
	 * @param searchQuery - The search query string
	 * @returns Promise resolving to array of matching app metadata
	 */
	async searchApps(searchQuery: string): Promise<AppMetadata[]> {
		const allApps = await this.getApps();

		const lowerQuery = searchQuery.toLowerCase();
		return allApps.filter((app) => {
			return (
				app.title.toLowerCase().includes(lowerQuery) ||
				app.appName.toLowerCase().includes(lowerQuery) ||
				(app.category && app.category.toLowerCase().includes(lowerQuery))
			);
		});
	}

	/**
	 * Get registry statistics.
	 * @returns Promise resolving to registry statistics
	 */
	async getRegistryStats(): Promise<{
		totalApps: number;
		categories: Record<string, number>;
	}> {
		await this.ensureInitialized();
		return this.registryManager.getRegistryStats();
	}

	/**
	 * Ensure registry is initialized for server-side operations.
	 * @returns Promise that resolves when initialization is complete
	 */
	private async ensureInitialized(): Promise<void> {
		if (this.initialized) {
			return;
		}

		// Use shared initialization promise to avoid multiple concurrent initializations
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		this.initializationPromise = this.performInitialization();

		try {
			await this.initializationPromise;
		} finally {
			this.initializationPromise = null;
		}
	}

	/**
	 * Perform the actual initialization.
	 * @returns Promise that resolves when initialization is complete
	 */
	private async performInitialization(): Promise<void> {
		try {
			await this.registryManager.initialize();
			this.initialized = true;
		} catch (error) {
			console.error('Server-side registry initialization failed:', error);
			throw new Error('Failed to initialize server-side app registry');
		}
	}

	/**
	 * Reset the registry state (useful for testing).
	 */
	reset(): void {
		this.registryManager.clear();
		this.initialized = false;
		this.clearCache();
		this.initializationPromise = null;
	}

	/**
	 * Check if registry is initialized.
	 * @returns True if initialized, false otherwise
	 */
	isInitialized(): boolean {
		return this.initialized;
	}

	/**
	 * Check if cache is valid.
	 * @returns True if cache is valid, false otherwise
	 */
	private isCacheValid(): boolean {
		return this.appsCache !== null && Date.now() - this.cacheTimestamp < this.cacheTimeout;
	}

	/**
	 * Update the apps cache.
	 * @param apps - The apps to cache
	 */
	private updateCache(apps: AppMetadata[]): void {
		this.appsCache = apps;
		this.cacheTimestamp = Date.now();
	}

	/**
	 * Clear the cache.
	 */
	private clearCache(): void {
		this.appsCache = null;
		this.cacheTimestamp = 0;
	}
}

// Global server registry instance
let serverRegistryInstance: ServerAppRegistryService | null = null;

/**
 * Get the global server registry instance.
 * @returns The server registry service instance
 */
export function getServerAppRegistry(): ServerAppRegistryService {
	if (!serverRegistryInstance) {
		serverRegistryInstance = new ServerAppRegistryService();
	}
	return serverRegistryInstance;
}

/**
 * Get all apps (direct function for both SvelteKit and test environments).
 * @returns Promise resolving to array of app metadata
 */
export async function getApps(): Promise<AppMetadata[]> {
	const registry = getServerAppRegistry();
	return await registry.getApps();
}

/**
 * Get app by name (direct function for both SvelteKit and test environments).
 * @param appName - The name of the app to retrieve
 * @returns Promise resolving to app metadata or undefined
 */
export async function getAppByName(appName: string): Promise<AppMetadata | undefined> {
	const registry = getServerAppRegistry();
	return await registry.getAppByName(appName);
}

/**
 * Get apps by category (direct function for both SvelteKit and test environments).
 * @param category - The category to filter by
 * @returns Promise resolving to array of app metadata
 */
export async function getAppsByCategory(category: string): Promise<AppMetadata[]> {
	const registry = getServerAppRegistry();
	return await registry.getAppsByCategory(category);
}

/**
 * Search apps (direct function for both SvelteKit and test environments).
 * @param searchQuery - The search query string
 * @returns Promise resolving to array of matching app metadata
 */
export async function searchApps(searchQuery: string): Promise<AppMetadata[]> {
	const registry = getServerAppRegistry();
	return await registry.searchApps(searchQuery);
}

/**
 * Get registry statistics (direct function for both SvelteKit and test environments).
 * @returns Promise resolving to registry statistics
 */
export async function getRegistryStats(): Promise<{
	totalApps: number;
	categories: Record<string, number>;
}> {
	const registry = getServerAppRegistry();
	return await registry.getRegistryStats();
}

/**
 * Initialize server-side registry (for use in hooks or startup).
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeServerRegistry(): Promise<void> {
	const registry = getServerAppRegistry();
	await registry.getApps(); // This will trigger initialization
	console.log('Server-side app registry initialized');
}

/**
 * Reset server-side registry (useful for testing).
 */
export function resetServerRegistry(): void {
	if (serverRegistryInstance) {
		serverRegistryInstance.reset();
	}
	serverRegistryInstance = null;
}
