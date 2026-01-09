/**
 * Shared types for the app registry system.
 * These types are used across client-side and server-side implementations.
 */

// Re-export core types for convenience
export type {
	RegistryAppMetadata,
	AppCategory,
	AppRegistryService,
	AppRegistryCore,
	RegistryState
} from './core.js';

// Re-export window types
export type { AppMetadata as WindowAppMetadata } from '$lib/types/window.js';

// Re-export conversion utilities
export { convertToWindowMetadata, convertToWindowMetadataArray } from './core.js';
