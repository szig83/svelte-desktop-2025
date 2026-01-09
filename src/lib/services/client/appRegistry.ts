/**
 * Client-side App Registry Service
 * Provides app metadata loading without server request context.
 */

import { type AppMetadata } from '$lib/types/window';
import {
	AppRegistryManager,
	convertToWindowMetadataArray,
	convertToWindowMetadata
} from '$lib/apps/registry/core';
import type { AppRegistryService } from '$lib/apps/registry/types';

/**
 * Error types for better error handling.
 */
export enum AppRegistryErrorType {
	INITIALIZATION_FAILED = 'initialization_failed',
	APP_NOT_FOUND = 'app_not_found',
	NETWORK_ERROR = 'network_error',
	INVALID_METADATA = 'invalid_metadata',
	UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Enhanced error class for app registry operations.
 */
export class AppRegistryError extends Error {
	constructor(
		public type: AppRegistryErrorType,
		message: string,
		public originalError?: Error,
		public recoverable: boolean = true
	) {
		super(message);
		this.name = 'AppRegistryError';
	}

	/**
	 * Get user-friendly error message.
	 * @returns User-friendly error message.
	 */
	getUserFriendlyMessage(): string {
		switch (this.type) {
			case AppRegistryErrorType.INITIALIZATION_FAILED:
				return 'Failed to load applications. Please try refreshing the page.';
			case AppRegistryErrorType.APP_NOT_FOUND:
				return 'The requested application could not be found.';
			case AppRegistryErrorType.NETWORK_ERROR:
				return 'Network error occurred while loading applications. Please check your connection.';
			case AppRegistryErrorType.INVALID_METADATA:
				return 'Application data is corrupted. Please contact support.';
			default:
				return 'An unexpected error occurred. Please try again.';
		}
	}

	/**
	 * Check if error is recoverable.
	 * @returns True if error is recoverable, false otherwise.
	 */
	isRecoverable(): boolean {
		return this.recoverable;
	}
}

/**
 * Client-side App Registry Service Interface.
 */
export interface ClientAppRegistry extends AppRegistryService {
	isLoading(): boolean;
	getError(): AppRegistryError | undefined;
	refresh(): Promise<void>;
	retry(): Promise<void>;
}

/**
 * Client-side App Registry Service Implementation.
 * Works without server request context for client-side components.
 */
export class ClientAppRegistryService implements ClientAppRegistry {
	private registryManager: AppRegistryManager;
	private loading = false;
	private error: AppRegistryError | undefined;
	private retryCount = 0;
	private maxRetries = 3;

	// Performance optimizations
	private appsCache: AppMetadata[] | null = null;
	private cacheTimestamp: number = 0;
	private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
	private initializationPromise: Promise<void> | null = null;
	private cleanupTimeout: NodeJS.Timeout | null = null;

	constructor() {
		this.registryManager = new AppRegistryManager();
		this.scheduleCleanup();
	}

	/**
	 * Get all apps with loading state management.
	 * @returns Promise resolving to array of app metadata.
	 */
	async getApps(): Promise<AppMetadata[]> {
		try {
			// Check cache first
			if (this.isCacheValid()) {
				return this.appsCache!;
			}

			await this.ensureInitialized();

			if (this.error) {
				throw this.error;
			}

			const registryApps = this.registryManager.getAllApps();

			// Fallback to empty array if no apps found
			if (registryApps.length === 0) {
				console.warn('No applications found in registry');
				this.updateCache([]);
				return [];
			}

			const apps = convertToWindowMetadataArray(registryApps);
			this.updateCache(apps);
			return apps;
		} catch (error) {
			if (error instanceof AppRegistryError) {
				throw error;
			}

			const registryError = new AppRegistryError(
				AppRegistryErrorType.UNKNOWN_ERROR,
				'Failed to get applications',
				error instanceof Error ? error : undefined
			);

			this.error = registryError;
			throw registryError;
		}
	}

	/**
	 * Get app by name with loading state management.
	 * @param appName - The name of the app to retrieve.
	 * @returns Promise resolving to app metadata or undefined if not found.
	 */
	async getAppByName(appName: string): Promise<AppMetadata | undefined> {
		try {
			await this.ensureInitialized();

			if (this.error) {
				throw this.error;
			}

			const registryApp = this.registryManager.getAppByName(appName);

			if (!registryApp) {
				const notFoundError = new AppRegistryError(
					AppRegistryErrorType.APP_NOT_FOUND,
					`Application '${appName}' not found`,
					undefined,
					false
				);
				throw notFoundError;
			}

			return convertToWindowMetadata(registryApp);
		} catch (error) {
			if (error instanceof AppRegistryError) {
				throw error;
			}

			const registryError = new AppRegistryError(
				AppRegistryErrorType.UNKNOWN_ERROR,
				`Failed to get application '${appName}'`,
				error instanceof Error ? error : undefined
			);

			throw registryError;
		}
	}

	/**
	 * Check if service is currently loading.
	 * @returns True if loading, false otherwise.
	 */
	isLoading(): boolean {
		return this.loading;
	}

	/**
	 * Get any initialization error.
	 * @returns Current error or undefined.
	 */
	getError(): AppRegistryError | undefined {
		return this.error;
	}

	/**
	 * Refresh the registry by re-initializing.
	 * @returns Promise that resolves when refresh is complete.
	 */
	async refresh(): Promise<void> {
		this.registryManager.clear();
		this.error = undefined;
		this.retryCount = 0;
		this.clearCache();
		this.scheduleCleanup();
		await this.ensureInitialized();
	}

	/**
	 * Retry the last failed operation.
	 * @returns Promise that resolves when retry is complete.
	 */
	async retry(): Promise<void> {
		if (this.retryCount >= this.maxRetries) {
			const maxRetriesError = new AppRegistryError(
				AppRegistryErrorType.INITIALIZATION_FAILED,
				'Maximum retry attempts exceeded',
				undefined,
				false
			);
			this.error = maxRetriesError;
			throw maxRetriesError;
		}

		this.retryCount++;
		this.error = undefined;
		this.clearCache();
		await this.ensureInitialized();
	}

	/**
	 * Ensure registry is initialized before operations.
	 * @returns Promise that resolves when initialization is complete.
	 */
	private async ensureInitialized(): Promise<void> {
		if (this.registryManager.isInitialized() && !this.error) {
			return;
		}

		// Use shared initialization promise to avoid multiple concurrent initializations
		if (this.initializationPromise) {
			return this.initializationPromise;
		}

		if (this.loading) {
			// Wait for current initialization to complete
			while (this.loading) {
				await new Promise((resolve) => setTimeout(resolve, 10));
			}
			return;
		}

		this.loading = true;
		this.error = undefined;

		this.initializationPromise = this.performInitialization();

		try {
			await this.initializationPromise;
		} finally {
			this.initializationPromise = null;
			this.loading = false;
		}
	}

	/**
	 * Perform the actual initialization.
	 * @returns Promise that resolves when initialization is complete.
	 */
	private async performInitialization(): Promise<void> {
		try {
			await this.registryManager.initialize();
			this.retryCount = 0; // Reset retry count on successful initialization
		} catch (error) {
			const errorType = this.determineErrorType(error);
			const registryError = new AppRegistryError(
				errorType,
				this.getErrorMessage(error, errorType),
				error instanceof Error ? error : undefined,
				errorType !== AppRegistryErrorType.INVALID_METADATA
			);

			this.error = registryError;
			throw registryError;
		}
	}

	/**
	 * Determine the type of error based on the original error.
	 * @param error - The original error.
	 * @returns The appropriate error type.
	 */
	private determineErrorType(error: unknown): AppRegistryErrorType {
		if (error instanceof Error) {
			const message = error.message.toLowerCase();

			if (message.includes('network') || message.includes('fetch')) {
				return AppRegistryErrorType.NETWORK_ERROR;
			}

			if (message.includes('invalid') || message.includes('metadata')) {
				return AppRegistryErrorType.INVALID_METADATA;
			}

			if (message.includes('initialization') || message.includes('initialize')) {
				return AppRegistryErrorType.INITIALIZATION_FAILED;
			}
		}

		return AppRegistryErrorType.UNKNOWN_ERROR;
	}

	/**
	 * Get appropriate error message based on error type.
	 * @param error - The original error.
	 * @param errorType - The determined error type.
	 * @returns Appropriate error message.
	 */
	private getErrorMessage(error: unknown, errorType: AppRegistryErrorType): string {
		const baseMessage = error instanceof Error ? error.message : 'Unknown error occurred';

		switch (errorType) {
			case AppRegistryErrorType.INITIALIZATION_FAILED:
				return `Registry initialization failed: ${baseMessage}`;
			case AppRegistryErrorType.NETWORK_ERROR:
				return `Network error during registry initialization: ${baseMessage}`;
			case AppRegistryErrorType.INVALID_METADATA:
				return `Invalid application metadata detected: ${baseMessage}`;
			default:
				return `Registry error: ${baseMessage}`;
		}
	}

	/**
	 * Check if cache is valid.
	 * @returns True if cache is valid, false otherwise.
	 */
	private isCacheValid(): boolean {
		return this.appsCache !== null && Date.now() - this.cacheTimestamp < this.cacheTimeout;
	}

	/**
	 * Update the apps cache.
	 * @param apps - The apps to cache.
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

	/**
	 * Schedule cleanup of resources.
	 */
	private scheduleCleanup(): void {
		// Clear any existing cleanup timeout
		if (this.cleanupTimeout) {
			clearTimeout(this.cleanupTimeout);
		}

		// Schedule cleanup after cache timeout + buffer
		this.cleanupTimeout = setTimeout(() => {
			this.cleanup();
		}, this.cacheTimeout + 60000); // 1 minute buffer
	}

	/**
	 * Cleanup resources and timers.
	 */
	private cleanup(): void {
		this.clearCache();

		if (this.cleanupTimeout) {
			clearTimeout(this.cleanupTimeout);
			this.cleanupTimeout = null;
		}

		// Reset initialization promise
		this.initializationPromise = null;
	}
}

// Global client registry instance
let clientRegistryInstance: ClientAppRegistryService | null = null;

/**
 * Get the global client registry instance.
 */
export function getClientAppRegistry(): ClientAppRegistryService {
	if (!clientRegistryInstance) {
		clientRegistryInstance = new ClientAppRegistryService();
	}
	return clientRegistryInstance;
}

/**
 * Legacy compatibility function for existing code.
 * Returns a promise-based interface that matches the old query pattern.
 * @returns Object with loading state, error state, and promise interface.
 */
export function getApps() {
	const registry = getClientAppRegistry();
	let currentApps: AppMetadata[] | null = null;
	let isInitialized = false;

	// Initialize and cache apps
	const initPromise = registry
		.getApps()
		.then((apps) => {
			currentApps = apps;
			isInitialized = true;
			return apps;
		})
		.catch((error) => {
			isInitialized = true;
			throw error;
		});

	return {
		get loading() {
			return registry.isLoading();
		},
		get error() {
			const error = registry.getError();
			return error || null;
		},
		get current() {
			return isInitialized ? currentApps : null;
		},
		// Promise interface for async access
		then: (
			onResolve: (apps: AppMetadata[]) => void,
			onReject?: (error: AppRegistryError) => void
		) => {
			return initPromise.then(onResolve, onReject);
		},
		// Additional methods for error recovery
		retry: () => registry.retry(),
		refresh: () => registry.refresh()
	};
}

/**
 * Legacy compatibility function for getting app by name.
 * @param appName - The name of the app to retrieve.
 * @returns Promise resolving to app metadata or undefined.
 */
export function getAppByName(appName: string) {
	const registry = getClientAppRegistry();
	return registry.getAppByName(appName);
}
