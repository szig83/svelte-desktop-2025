// Theme exports
export {
	createThemeManager,
	setThemeManager,
	getThemeManager
} from './stores/themeStore.svelte';

export type { ThemeMode, ColorScheme, ThemeSettings as ThemeSettingsType } from './types/theme';

// Theme components
export { default as ThemeSettings } from './components/ThemeSettings.svelte';
export { default as ThemeToggle } from './components/ThemeToggle.svelte';
export { default as ColorSchemePicker } from './components/ColorSchemePicker.svelte';

// Window exports
export { createWindowManager, setWindowManager, getWindowManager } from './stores/windowStore.svelte';

export type { WindowState } from './stores/windowStore.svelte';
