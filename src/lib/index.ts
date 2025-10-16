/**
 * Jelenleg nincs használva, arra lenne jó, hogy egyszerűsített importokat hozzak létre és központosítva legyenek a különböző exportok.
 */

// Theme exports
export { createThemeManager, setThemeManager, getThemeManager } from './stores/themeStore.svelte';

export type { ThemeMode, ThemeSettings as ThemeSettingsType } from './types/theme';

// Theme components
export { default as ThemeToggle } from './components/ThemeSwitcher.svelte';
export { default as ColorSchemePicker } from './components/ColorSchemePicker.svelte';

// Window exports
export {
	createWindowManager,
	setWindowManager,
	getWindowManager
} from './stores/windowStore.svelte';

export type { WindowState } from './stores/windowStore.svelte';
