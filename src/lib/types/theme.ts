export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeSettings {
	mode: ThemeMode;
	modeTaskbarStartMenu: ThemeMode;
	colorPrimaryHue: string;
	// További beállítások később bővíthetők
	fontSize?: 'small' | 'medium' | 'large';
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
	mode: 'light',
	modeTaskbarStartMenu: 'light',
	colorPrimaryHue: '225',
	fontSize: 'medium'
};
