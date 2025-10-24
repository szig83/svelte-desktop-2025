/**
 * Alkalmazás registry inicializálási segédprogram
 * Automatikusan regisztrálja az ismert alkalmazásokat.
 */

import { appRegistry } from './index.js';

/**
 * Alkalmazások regisztrálása metaadat fájlokból.
 */
export async function registerAppsFromMetadata(): Promise<void> {
	// Az ismert alkalmazások listája
	const appIds = ['app1', 'app2', 'help', 'settings', 'users'];

	for (const appId of appIds) {
		try {
			// Betöltjük a metaadat fájlt
			const metadataModule = await import(`../${appId}/metadata.ts`);
			const metadata = metadataModule.metadata;

			if (!metadata) {
				console.warn(`Nem található metaadat az alkalmazáshoz: ${appId}`);
				continue;
			}

			appRegistry.registerApp(metadata, { overwrite: true });
			console.log(`Alkalmazás regisztrálva: ${metadata.name} (${appId})`);
		} catch (error) {
			console.warn(`Nem sikerült regisztrálni az alkalmazást: ${appId}`, error);
		}
	}
}

/**
 * Registry teljes inicializálása.
 */
export async function initializeRegistry(): Promise<void> {
	console.log('Alkalmazás registry inicializálása...');

	try {
		await registerAppsFromMetadata();

		const stats = appRegistry.getRegistryStats();
		console.log(`Registry inicializálva: ${stats.totalApps} alkalmazás regisztrálva`);
		console.log('Kategóriák:', stats.categories);
	} catch (error) {
		console.error('Hiba a registry inicializálása során:', error);
	}
}
