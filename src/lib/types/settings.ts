import type { ThemeSettings } from './theme.js';
import type { BackgroundType, TaskbarPosition, TaskbarStyle } from '../constants.js';
import { APP_CONSTANTS, DEFAULTS } from '../constants.js';

export interface BackgroundSettings {
	type: BackgroundType;
	value: string;
}

export interface TaskbarSettings {
	position: TaskbarPosition;
	style: TaskbarStyle;
	itemVisibility: Record<string, boolean>;
}

export interface UserSettings {
	windowPreview: boolean;
	screenshotThumbnailHeight: number;
	preferPerformance: boolean;
	background: BackgroundSettings;
	theme: ThemeSettings;
	taskbar: TaskbarSettings;
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
	windowPreview: true,
	screenshotThumbnailHeight: APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT,
	preferPerformance: false,
	background: DEFAULTS.BACKGROUND,
	theme: DEFAULTS.THEME,
	taskbar: DEFAULTS.TASKBAR
};
