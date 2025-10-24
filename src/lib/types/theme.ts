import type { ThemeMode, FontSize } from '../constants.js';
import { DEFAULTS } from '../constants.js';

export type { ThemeMode, FontSize };

export interface ThemeSettings {
	mode: ThemeMode;
	modeTaskbarStartMenu: ThemeMode;
	colorPrimaryHue: string;
	fontSize?: FontSize;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = DEFAULTS.THEME;
