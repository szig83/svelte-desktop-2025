import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.settings = {
		windowPreview: true,
		screenshotThumbnailHeight: 200,
		preferPerformance: true,
		background: {
			type: 'color',
			value: '#666666'
		},
		taskbarPosition: 'bottom',
		theme: {
			mode: 'light',
			modeTaskbarStartMenu: 'light',
			colorPrimaryHue: '225',
			fontSize: 'medium'
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
