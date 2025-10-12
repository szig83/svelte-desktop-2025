export type ThemeMode = 'light' | 'dark' | 'auto';

//export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface ThemeSettings {
	mode: ThemeMode;
	modeTaskbarStartMenu: ThemeMode;
	color: string;
	// További beállítások később bővíthetők
	fontSize?: 'small' | 'medium' | 'large';
	animations?: boolean;
}

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
	mode: 'light',
	modeTaskbarStartMenu: 'light',
	color: 'hsl(200, 35%, 35%)',
	fontSize: 'medium',
	animations: true
};
