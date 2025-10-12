import { getContext, setContext } from 'svelte';
import { type ThemeSettings, type ThemeMode, DEFAULT_THEME_SETTINGS } from '$lib/types/theme';

const THEME_STORAGE_KEY = 'desktop-theme-settings';

class ThemeManager {
	settings = $state<ThemeSettings>({ ...DEFAULT_THEME_SETTINGS });
	private mediaQuery: MediaQueryList | null = null;

	constructor() {
		// Betöltjük a mentett beállításokat
		this.loadSettings();

		// Auto mód esetén figyelünk a rendszer témára
		if (typeof window !== 'undefined') {
			this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
		}
	}

	/**
	 * Téma mód beállítása (light, dark, auto)
	 */
	setMode(mode: ThemeMode) {
		this.settings.mode = mode;
		this.saveSettings();
	}

	/**
	 * Téma mód beállítása (light, dark, auto)
	 */
	setModeTaskbarStartMenu(mode: ThemeMode) {
		this.settings.modeTaskbarStartMenu = mode;
		this.saveSettings();
	}

	/**
	 * Színséma beállítása
	 */
	setColor(color: string) {
		this.settings.color = color;
		this.saveSettings();
	}

	/**
	 * Betűméret beállítása
	 */
	setFontSize(size: 'small' | 'medium' | 'large') {
		this.settings.fontSize = size;
		this.saveSettings();
	}

	/**
	 * Animációk be/kikapcsolása
	 */
	setAnimations(enabled: boolean) {
		this.settings.animations = enabled;
		this.saveSettings();
	}

	/**
	 * Teljes beállítások frissítése
	 */
	updateSettings(newSettings: Partial<ThemeSettings>) {
		this.settings = { ...this.settings, ...newSettings };
		this.saveSettings();
	}

	effectiveModeBase(mode: 'mode' | 'modeTaskbarStartMenu'): 'light' | 'dark' {
		if (this.settings[mode] === 'auto') {
			if (typeof window !== 'undefined') {
				return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
			}
			return 'light';
		}
		return this.settings[mode] ?? 'light';
	}

	/**
	 * Aktuális effektív téma mód (auto esetén a rendszer beállítás alapján)
	 */
	get effectiveMode(): 'light' | 'dark' {
		return this.effectiveModeBase('mode');
	}

	/**
	 * Aktuális effektív téma mód (auto esetén a rendszer beállítás alapján)
	 */
	get effectiveModeTaskBarStartMenu(): 'light' | 'dark' {
		return this.effectiveModeBase('modeTaskbarStartMenu');
	}

	/**
	 * Sötét mód aktív-e
	 */
	get isDark(): boolean {
		return this.effectiveMode === 'dark';
	}

	/**
	 * Világos mód aktív-e
	 */
	get isLight(): boolean {
		return this.effectiveMode === 'light';
	}

	/**
	 * CSS osztályok generálása a layout számára
	 */
	get cssClasses(): string {
		const classes: string[] = [];

		// Téma mód
		classes.push(this.effectiveMode);

		// Betűméret
		if (this.settings.fontSize) {
			classes.push(`font-${this.settings.fontSize}`);
		}

		// Animációk
		if (this.settings.animations === false) {
			classes.push('no-animations');
		}

		return classes.join(' ');
	}

	get cssClassesTaskBarStartMenu(): string {
		const classes: string[] = [];

		// Téma mód
		classes.push(this.effectiveModeTaskBarStartMenu);

		// Betűméret
		if (this.settings.fontSize) {
			classes.push(`font-${this.settings.fontSize}`);
		}

		// Animációk
		if (this.settings.animations === false) {
			classes.push('no-animations');
		}

		return classes.join(' ');
	}

	/**
	 * CSS változók objektum generálása
	 */
	get cssVariables(): Record<string, string> {
		const vars: Record<string, string> = {};

		// Színséma alapú változók
		/*const schemeColors = this.getSchemeColors(this.settings.colorScheme);
		Object.entries(schemeColors).forEach(([key, value]) => {
			vars[`--color-${key}`] = value;
			vars[`--${key}-color`] = value;
		});*/
		vars['--primary-h'] = this.settings.color;

		// Betűméret változók
		if (this.settings.fontSize === 'small') {
			vars['--base-font-size'] = '14px';
		} else if (this.settings.fontSize === 'large') {
			vars['--base-font-size'] = '18px';
		} else {
			vars['--base-font-size'] = '16px';
		}

		return vars;
	}

	/**
	 * Beállítások mentése localStorage-ba
	 */
	private saveSettings() {
		if (typeof window !== 'undefined') {
			try {
				localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.settings));
			} catch (error) {
				console.error('Nem sikerült menteni a téma beállításokat:', error);
			}
		}
	}

	/**
	 * Beállítások betöltése localStorage-ból
	 */
	private loadSettings() {
		if (typeof window !== 'undefined') {
			try {
				const stored = localStorage.getItem(THEME_STORAGE_KEY);
				if (stored) {
					const parsed = JSON.parse(stored);
					this.settings = { ...DEFAULT_THEME_SETTINGS, ...parsed };
				}
			} catch (error) {
				console.error('Nem sikerült betölteni a téma beállításokat:', error);
			}
		}
	}

	/**
	 * Rendszer téma változás kezelése
	 */
	private handleSystemThemeChange() {
		if (this.settings.mode === 'auto') {
			// Trigger reactivity
			this.settings = { ...this.settings };
		}
	}

	/**
	 * Színséma színek lekérése
	 */
	/*private getSchemeColors(scheme: ColorScheme): Record<string, string> {
		const schemes: Record<ColorScheme, Record<string, string>> = {
			blue: {
				primary: '#3b82f6',
				'primary-hover': '#2563eb',
				'primary-light': '#dbeafe',
				accent: '#60a5fa'
			},
			green: {
				primary: '#10b981',
				'primary-hover': '#059669',
				'primary-light': '#d1fae5',
				accent: '#34d399'
			},
			purple: {
				primary: '#8b5cf6',
				'primary-hover': '#7c3aed',
				'primary-light': '#ede9fe',
				accent: '#a78bfa'
			},
			orange: {
				primary: '#f97316',
				'primary-hover': '#ea580c',
				'primary-light': '#ffedd5',
				accent: '#fb923c'
			},
			red: {
				primary: '#ef4444',
				'primary-hover': '#dc2626',
				'primary-light': '#fee2e2',
				accent: '#f87171'
			}
		};

		return schemes[scheme];
	}
*/
	/**
	 * Cleanup
	 */
	destroy() {
		if (this.mediaQuery) {
			this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange.bind(this));
		}
	}
}

const THEME_MANAGER_KEY = Symbol('themeManager');

// Global singleton instance
let globalThemeManager: ThemeManager | null = null;

/**
 * Creates a new theme manager instance.
 * @returns {ThemeManager} The theme manager instance.
 */
export function createThemeManager() {
	if (!globalThemeManager) {
		globalThemeManager = new ThemeManager();
	}
	return globalThemeManager;
}

/**
 * Set the theme manager instance in context.
 * @param {ThemeManager} manager Instance.
 */
export function setThemeManager(manager: ThemeManager) {
	globalThemeManager = manager;
	setContext(THEME_MANAGER_KEY, manager);
}

/**
 * Gets the theme manager instance from context or global.
 * @returns {ThemeManager} The theme manager instance.
 */
export function getThemeManager(): ThemeManager {
	// Try context first (for components), then fallback to global
	try {
		return getContext(THEME_MANAGER_KEY);
	} catch {
		// If context fails (e.g., outside component), use global
		if (!globalThemeManager) {
			globalThemeManager = new ThemeManager();
		}
		return globalThemeManager;
	}
}
