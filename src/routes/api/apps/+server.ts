/**
 * API endpoint for app registry operations
 * Demonstrates server-side usage of the app registry service
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getApps, getAppByName, searchApps, getRegistryStats } from '$lib/services/server';

/**
 * GET /api/apps - Get all apps or search apps
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const searchQuery = url.searchParams.get('search');
		const category = url.searchParams.get('category');
		const stats = url.searchParams.get('stats');

		// Return registry statistics
		if (stats === 'true') {
			const registryStats = await getRegistryStats();
			return json({
				success: true,
				data: registryStats
			});
		}

		// Search apps if query provided
		if (searchQuery) {
			const apps = await searchApps(searchQuery);
			return json({
				success: true,
				data: apps,
				count: apps.length
			});
		}

		// Get all apps (category filtering would be handled by getAppsByCategory if implemented)
		const apps = await getApps();
		let filteredApps = apps;

		// Client-side category filtering for now
		if (category) {
			filteredApps = apps.filter((app) => app.category === category);
		}

		return json({
			success: true,
			data: filteredApps,
			count: filteredApps.length
		});
	} catch (error) {
		console.error('Error in GET /api/apps:', error);
		return json(
			{
				success: false,
				error: 'Failed to retrieve apps',
				message: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
