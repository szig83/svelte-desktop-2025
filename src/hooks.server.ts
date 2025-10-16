import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.settings = {
		windowPreview: true,
		screenshotThumbnailHeight: 100,
		preferPerformance: true,
		background: {
			type: 'video',
			value: 'bg-video.mp4'
		}
	};

	const response = await resolve(event);

	// Note that modifying response headers isn't always safe.
	// Response objects can have immutable headers
	// (e.g. Response.redirect() returned from an endpoint).
	// Modifying immutable headers throws a TypeError.
	// In that case, clone the response or avoid creating a
	// response object with immutable headers.
	//response.headers.set('x-custom-header', 'potato');

	return response;
};
