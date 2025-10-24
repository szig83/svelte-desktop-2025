/**
 * API endpoint for individual app operations
 * Demonstrates server-side usage for specific app retrieval
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAppByName } from '$lib/services/server';

/**
 * GET /api/apps/[appName] - Get specific app by name
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const { appName } = params;

		if (!appName) {
			return error(400, {
				message: 'App name is required'
			});
		}

		const app = await getAppByName(appName);

		if (!app) {
			return error(404, {
				message: `App '${appName}' not found`
			});
		}

		return json({
			success: true,
			data: app
		});
	} catch (err) {
		console.error(`Error in GET /api/apps/${params.appName}:`, err);
		return json(
			{
				success: false,
				error: 'Failed to retrieve app',
				message: err instanceof Error ? err.message : 'Unknown error'
			},
			{ status: 500 }
		);
	}
};
