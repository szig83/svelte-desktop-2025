/**
 * Alkalmazások fő exportja
 * Központi hely az alkalmazás rendszer eléréséhez
 */

// Registry system
export * from './registry/index.js';
export * from './registry/config.js';
export * from './registry/builder.js';
export * from './registry/loader.js';
export * from './registry/init.js';

// Shared resources
export * from './shared/index.js';

// Re-export the global instances
export { appRegistry, appDiscovery, initializeAppRegistry } from './registry/index.js';
export { appLoader } from './registry/loader.js';
export { initializeRegistry } from './registry/init.js';
