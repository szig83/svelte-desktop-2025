/**
 * Core App Registry Service.
 * Shared logic and interfaces for both client-side and server-side app registry operations.
 */

import type { AppMetadata as RegistryAppMetadata } from './index.js';
import type { AppMetadata as WindowAppMetadata } from '$lib/types/window.js';
import type { AppCategory } from '$lib/constants.js';

// Re-export types for convenience
export type { RegistryAppMetadata, AppCategory };

// Shared interfaces for consistent API across client and server.
export interface AppRegistryService {
	getApps(): Promise<WindowAppMetadata[]>;
	getAppByName(appName: string): Promise<WindowAppMetadata | undefined>;
	isLoading?(): boolean;
}

// Registry state interface.
export interface RegistryState {
	initialized: boolean;
	loading: boolean;
	apps: Map<string, RegistryAppMetadata>;
	error?: string;
}

// Core registry interface.
export interface AppRegistryCore {
	getAllApps(): RegistryAppMetadata[];
	getAppByName(appName: string): RegistryAppMetadata | undefined;
	isInitialized(): boolean;
	initialize(): Promise<void>;
	getRegistryStats(): {
		totalApps: number;
		categories: Record<AppCategory, number>;
	};
}

/**
 * Core App Registry Manager.
 * Contains shared logic for app registration and retrieval.
 */
export class AppRegistryManager implements AppRegistryCore {
	private state: RegistryState = {
		initialized: false,
		loading: false,
		apps: new Map(),
		error: undefined
	};

	/**
	 * Initialize the registry by loading app metadata.
	 */
	async initialize(): Promise<void> {
		if (this.state.initialized) {
			return;
		}

		this.state.loading = true;
		this.state.error = undefined;

		try {
			await this.loadAppsFromMetadata();
			this.state.initialized = true;
		} catch (error) {
			this.state.error = error instanceof Error ? error.message : 'Unknown initialization error';
			throw error;
		} finally {
			this.state.loading = false;
		}
	}

	/**
	 * Load apps from their metadata files.
	 */
	private async loadAppsFromMetadata(): Promise<void> {
		// Known app IDs - in a real implementation this could be discovered dynamically
		const appIds = ['app1', 'app2', 'help', 'settings', 'users'];

		for (const appId of appIds) {
			try {
				const metadataModule = await import(`../${appId}/metadata.ts`);
				const metadata = metadataModule.metadata;

				if (!metadata) {
					console.warn(`No metadata found for app: ${appId}`);
					continue;
				}

				// Validate and register the app
				if (this.validateAppMetadata(metadata)) {
					this.state.apps.set(appId, metadata);
				} else {
					console.warn(`Invalid metadata for app: ${appId}`);
				}
			} catch (error) {
				console.warn(`Failed to load metadata for app: ${appId}`, error);
			}
		}
	}

	/**
	 * Validate app metadata structure.
	 * @param metadata - The app metadata to validate
	 * @returns True if metadata is valid, false otherwise
	 */
	private validateAppMetadata(metadata: RegistryAppMetadata): boolean {
		const requiredFields = ['id', 'name', 'version', 'category'];

		for (const field of requiredFields) {
			if (!metadata[field as keyof RegistryAppMetadata]) {
				return false;
			}
		}

		// ID format validation
		if (!/^[a-z0-9-_]+$/.test(metadata.id)) {
			return false;
		}

		// Version format validation (simple)
		if (!/^\d+\.\d+\.\d+/.test(metadata.version)) {
			return false;
		}

		// Window size validation
		if (metadata.defaultSize.width <= 0 || metadata.defaultSize.height <= 0) {
			return false;
		}

		if (metadata.minSize.width <= 0 || metadata.minSize.height <= 0) {
			return false;
		}

		return true;
	}

	/**
	 * Get all registered apps.
	 * @returns Array of all registered app metadata
	 */
	getAllApps(): RegistryAppMetadata[] {
		return Array.from(this.state.apps.values());
	}

	/**
	 * Get app by name/ID.
	 * @param appName - The app name or ID to search for
	 * @returns App metadata if found, undefined otherwise
	 */
	getAppByName(appName: string): RegistryAppMetadata | undefined {
		return this.state.apps.get(appName);
	}

	/**
	 * Check if registry is initialized.
	 * @returns True if registry is initialized, false otherwise
	 */
	isInitialized(): boolean {
		return this.state.initialized;
	}

	/**
	 * Check if registry is currently loading.
	 * @returns True if registry is loading, false otherwise
	 */
	isLoading(): boolean {
		return this.state.loading;
	}

	/**
	 * Get any initialization error.
	 * @returns Error message if any, undefined otherwise
	 */
	getError(): string | undefined {
		return this.state.error;
	}

	/**
	 * Get registry statistics.
	 * @returns Object containing total apps count and category breakdown
	 */
	getRegistryStats(): {
		totalApps: number;
		categories: Record<AppCategory, number>;
	} {
		const categories = {} as Record<AppCategory, number>;

		this.state.apps.forEach((app) => {
			categories[app.category] = (categories[app.category] || 0) + 1;
		});

		return {
			totalApps: this.state.apps.size,
			categories
		};
	}

	/**
	 * Get apps by category.
	 * @param category - The category to filter by
	 * @returns Array of apps in the specified category
	 */
	getAppsByCategory(category: AppCategory): RegistryAppMetadata[] {
		return Array.from(this.state.apps.values()).filter((app) => app.category === category);
	}

	/**
	 * Search apps by query.
	 * @param query - The search query string
	 * @returns Array of apps matching the search query
	 */
	searchApps(query: string): RegistryAppMetadata[] {
		const lowerQuery = query.toLowerCase();
		return Array.from(this.state.apps.values()).filter((app) => {
			return (
				app.name.toLowerCase().includes(lowerQuery) ||
				app.description.toLowerCase().includes(lowerQuery) ||
				app.keywords?.some((keyword) => keyword.toLowerCase().includes(lowerQuery))
			);
		});
	}

	/**
	 * Clear the registry state.
	 */
	clear(): void {
		this.state.apps.clear();
		this.state.initialized = false;
		this.state.loading = false;
		this.state.error = undefined;
	}
}

/**
 * Convert registry metadata to window manager format.
 * @param registryMetadata - The registry metadata to convert
 * @returns Window manager compatible metadata
 */
export function convertToWindowMetadata(registryMetadata: RegistryAppMetadata): WindowAppMetadata {
	return {
		title: registryMetadata.name,
		appName: registryMetadata.id,
		icon: registryMetadata.icon,
		minSize: registryMetadata.minSize,
		maxSize: registryMetadata.maxSize,
		defaultSize: registryMetadata.defaultSize,
		allowMultiple: registryMetadata.multiInstance,
		maximizable: true,
		resizable: true,
		minimizable: true,
		category: registryMetadata.category,
		helpId: registryMetadata.helpId,
		parameters: {}
	};
}

/**
 * Convert multiple registry metadata items to window manager format.
 * @param registryMetadata - Array of registry metadata to convert
 * @returns Array of window manager compatible metadata
 */
export function convertToWindowMetadataArray(
	registryMetadata: RegistryAppMetadata[]
): WindowAppMetadata[] {
	return registryMetadata.map(convertToWindowMetadata);
}
