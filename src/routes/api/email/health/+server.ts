import { json } from '@sveltejs/kit';
import { getEmailServiceHealth, getEnvironmentSpecificConfig } from '$lib/server/email';
import type { RequestHandler } from './$types';

/**
 * GET /api/email/health
 * Returns email service health status and configuration information
 */
export const GET: RequestHandler = async () => {
	try {
		const health = getEmailServiceHealth();
		const envConfig = getEnvironmentSpecificConfig();

		return json({
			...health,
			environment: envConfig.environment,
			recommendations: envConfig.recommendations,
			warnings: envConfig.warnings,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return json(
			{
				status: 'error',
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
