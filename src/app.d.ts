// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			settings: {
				windowPreview: boolean;
				screenshotThumbnailHeight: number;
				preferPerformance: boolean;
				background: {
					type: 'color' | 'image' | 'video';
					value: string;
				};
				theme: ThemeSettings;
			};
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
