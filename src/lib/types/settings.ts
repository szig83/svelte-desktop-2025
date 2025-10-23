import type { ThemeSettings } from './theme';

export interface BackgroundSettings {
	type: 'video' | 'image' | 'color';
	value: string;
}

export interface UserSettings {
	windowPreview: boolean;
	screenshotThumbnailHeight: number;
	preferPerformance: boolean;
	background: BackgroundSettings;
	taskbarPosition: 'top' | 'bottom' | 'left' | 'right';
	theme: ThemeSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
	windowPreview: true,
	screenshotThumbnailHeight: 200,
	preferPerformance: false,
	background: {
		type: 'video',
		value: 'bg-video.mp4'
	},
	taskbarPosition: 'bottom',
	theme: {
		mode: 'dark',
		modeTaskbarStartMenu: 'dark',
		colorPrimaryHue: '225',
		fontSize: 'medium'
	}
};
