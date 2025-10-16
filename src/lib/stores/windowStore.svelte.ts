import { getContext, setContext } from 'svelte';
import { type AppMetadata, type AppParameters } from '$lib/types/window';
import type { Component } from 'svelte';
import type { WindowSize } from '$lib/types/window';

// Restore méret konstansok
export const RESTORE_SIZE_THRESHOLD = 0.99; // Ha az előző méret 95%-on belül van a maximálishoz
export const RESTORE_SIZE_RATIO = 0.8; // Akkor 70%-os méretre álljon vissza

export type WindowState = {
	id: string;
	icon: string | null | undefined;
	appName: string;
	title: string;
	isActive: boolean;
	isMinimized: boolean;
	isMaximized: boolean;
	zIndex: number;
	position: { x: number; y: number };
	size: WindowSize;
	minSize: WindowSize;
	maxSize: WindowSize;
	component?: Component; // A betöltött komponens példány
	isLoading?: boolean;
	parameters?: AppParameters; // Az appnak átadott paraméterek
	instanceId?: string; // Példány azonosító több példány esetén
	maximizable?: boolean;
	resizable?: boolean;
	helpId?: number;
	allowMultiple?: boolean;
	defaultSize?: WindowSize | { maximized?: boolean };
};

export class WindowManager {
	windows = $state<WindowState[]>([]);
	private nextId = 1;
	private baseZIndex = 100;

	openWindow(
		appName: string,
		title: string,
		metadata: Partial<AppMetadata> = {},
		parameters: AppParameters = {}
	) {
		// Ellenőrizzük, hogy az app támogatja-e a több példányt
		if (metadata.allowMultiple) {
			// Több példány esetén paraméterek alapján keresünk egyező ablakot
			const existingWindow = this.windows.find(
				(w) => w.appName === appName && this.parametersMatch(w.parameters || {}, parameters)
			);

			if (existingWindow) {
				// Ha már nyitva van ugyanazokkal a paraméterekkel, aktiváljuk
				existingWindow.isMinimized = false;
				this.activateWindow(existingWindow.id);
				return existingWindow.id;
			}
		} else {
			// Egy példány esetén csak az appName alapján keresünk
			const existingWindow = this.windows.find((w) => w.appName === appName);

			if (existingWindow) {
				// Ha már nyitva van, akkor aktiváljuk és visszaállítjuk a minimalizálásból
				existingWindow.isMinimized = false;
				this.activateWindow(existingWindow.id);
				return existingWindow.id;
			}
		}

		const id = `window-${this.nextId++}`;

		// Több példány esetén instanceId generálása, de cím marad eredeti
		let instanceId: string | undefined;
		if (metadata.allowMultiple && Object.keys(parameters).length > 0) {
			instanceId = this.generateInstanceId(parameters);
		}

		const defaultSize = metadata.defaultSize || { width: 600, height: 400 };

		const newWindow: WindowState = {
			id,
			appName,
			icon: metadata.icon,
			title, // Eredeti cím marad
			isActive: true,
			isMinimized: false,
			isMaximized: defaultSize.maximized || false,
			zIndex: this.getNextZIndex(),
			position: this.getNextPosition(),
			size: { width: defaultSize.width, height: defaultSize.height },
			minSize: metadata.minSize || { width: 300, height: 200 },
			maxSize: metadata.maxSize || { width: 5000, height: 5000 },
			component: undefined,
			isLoading: true,
			parameters,
			instanceId,
			maximizable: metadata.maximizable ?? true,
			resizable: metadata.resizable ?? true,
			helpId: metadata.helpId,
			allowMultiple: metadata.allowMultiple ?? false,
			defaultSize: metadata.defaultSize
		};

		// Deaktiváljuk az összes többi ablakot
		this.windows.forEach((w) => (w.isActive = false));

		this.windows.push(newWindow);

		// Aszinkron komponens betöltés
		this.loadComponent(id, appName);

		return id;
	}

	private async loadComponent(id: string, componentName: string) {
		try {
			const module = await import(`../apps/${componentName}/index.svelte`);
			const window = this.windows.find((w) => w.id === id);
			if (window) {
				window.component = module.default;
				window.isLoading = false;
				// Trigger reactivity
				this.windows = [...this.windows];
			}
		} catch (error) {
			console.error(`Nem sikerült betölteni: ${componentName}`, error);
			const window = this.windows.find((w) => w.id === id);
			if (window) {
				window.isLoading = false;
				// Trigger reactivity
				this.windows = [...this.windows];
			}
		}
	}

	closeWindow(id: string) {
		const index = this.windows.findIndex((w) => w.id === id);
		if (index !== -1) {
			this.windows.splice(index, 1);

			// Ha volt aktív ablak és bezártuk, aktiváljuk a legfelső másikat
			if (this.windows.length > 0) {
				const topWindow = this.windows.reduce((prev, current) =>
					current.zIndex > prev.zIndex ? current : prev
				);
				topWindow.isActive = true;
				// Trigger reactivity
				this.windows = [...this.windows];
			}
		}
	}

	activateWindow(id: string) {
		const window = this.windows.find((w) => w.id === id);

		// Ha az ablak már aktív, ne csináljunk semmit
		if (!window || window.isActive) {
			return;
		}

		// Deaktiváljuk az összes többi ablakot
		this.windows.forEach((w) => (w.isActive = false));

		// Aktiváljuk az aktuális ablakot
		window.isActive = true;
		window.zIndex = this.getNextZIndex();

		// Trigger reactivity
		this.windows = [...this.windows];
	}

	minimizeWindow(id: string) {
		const window = this.windows.find((w) => w.id === id);
		if (window) {
			window.isMinimized = !window.isMinimized;
			if (window.isMinimized) {
				// Minimalizálás: deaktiváljuk az ablakot
				window.isActive = false;
				// Trigger reactivity azonnal
				this.windows = [...this.windows];

				// Aktiváljuk a következő nem-minimalizált ablakot
				const nextWindow = this.windows
					.filter((w) => w.id !== id && !w.isMinimized)
					.reduce<WindowState | null>(
						(prev, current) => (!prev || current.zIndex > prev.zIndex ? current : prev),
						null
					);
				if (nextWindow) {
					this.activateWindow(nextWindow.id);
				}
			} else {
				// Visszaállítás: aktiváljuk az ablakot
				this.activateWindow(id);
			}
		}
	}

	maximizeWindow(id: string) {
		const window = this.windows.find((w) => w.id === id);
		if (window) {
			const wasMaximized = window.isMaximized;
			window.isMaximized = !window.isMaximized;

			// Ha restore történik (maximalizáltból vissza), ellenőrizzük a célméretet
			if (wasMaximized && !window.isMaximized) {
				// Workspace méret lekérése
				const workspace = document.getElementById('workspace');
				if (workspace) {
					const workspaceRect = workspace.getBoundingClientRect();
					const maxWidth = workspaceRect.width;
					const maxHeight = workspaceRect.height;

					// Ellenőrizzük, hogy a jelenlegi méret 95%-on belül van-e a maximálishoz
					const widthRatio = window.size.width / maxWidth;
					const heightRatio = window.size.height / maxHeight;

					if (widthRatio >= RESTORE_SIZE_THRESHOLD || heightRatio >= RESTORE_SIZE_THRESHOLD) {
						// Ha igen, állítsuk 70%-ra
						window.size.width = Math.round(maxWidth * RESTORE_SIZE_RATIO);
						window.size.height = Math.round(maxHeight * RESTORE_SIZE_RATIO);

						// Pozíció centrálása
						window.position.x = Math.round((maxWidth - window.size.width) / 2);
						window.position.y = Math.round((maxHeight - window.size.height) / 2);
					}
				}
			}

			// Trigger reactivity
			this.windows = [...this.windows];
		}
	}

	updatePosition(id: string, position: { x: number; y: number }) {
		const window = this.windows.find((w) => w.id === id);
		if (window) {
			window.position = position;
		}
	}

	updateSize(id: string, size: { width: number; height: number }) {
		const window = this.windows.find((w) => w.id === id);
		if (window) {
			window.size = size;
		}
	}

	deactivateAllWindows() {
		// Minden nem-minimalizált ablakot inaktívvá teszünk
		this.windows.forEach((w) => {
			if (!w.isMinimized) {
				w.isActive = false;
			}
		});
		// Trigger reactivity
		this.windows = [...this.windows];
	}

	getWindowParameters(id: string): AppParameters | undefined {
		const window = this.windows.find((w) => w.id === id);
		return window?.parameters;
	}

	getWindowById(id: string): WindowState | undefined {
		return this.windows.find((w) => w.id === id);
	}

	updateWindowTitle(id: string, newTitle: string) {
		const window = this.windows.find((w) => w.id === id);
		if (window) {
			window.title = newTitle;
			// Trigger reactivity
			this.windows = [...this.windows];
		}
	}

	private parametersMatch(params1: AppParameters, params2: AppParameters): boolean {
		// Mély összehasonlítás a paraméterek között
		return JSON.stringify(params1) === JSON.stringify(params2);
	}

	private generateInstanceId(parameters: AppParameters): string {
		// Rövid azonosító generálása a paraméterek alapján
		const keyValues = Object.entries(parameters)
			.filter(([, value]) => value !== undefined && value !== null)
			.map(([key, value]) => `${key}:${String(value)}`)
			.slice(0, 2) // Csak az első 2 paramétert használjuk
			.join(',');

		return keyValues || 'default';
	}

	private getNextZIndex(): number {
		if (this.windows.length === 0) return this.baseZIndex;
		const maxZ = Math.max(...this.windows.map((w) => w.zIndex));
		return maxZ + 1;
	}

	private getNextPosition(): { x: number; y: number } {
		const offset = (this.windows.length % 10) * 30;
		return { x: 100 + offset, y: 100 + offset };
	}
}

const WINDOW_MANAGER_KEY = Symbol('windowManager');

// Global singleton instance
let globalWindowManager: WindowManager | null = null;

/**
 * Creates a new window manager instance.
 * @returns {WindowManager} The window manager instance.
 */
export function createWindowManager() {
	if (!globalWindowManager) {
		globalWindowManager = new WindowManager();
	}
	return globalWindowManager;
}

/**
 * Set the window manager instance.
 * @param {WindowManager} manager Instance.
 */
export function setWindowManager(manager: WindowManager) {
	globalWindowManager = manager;
	setContext(WINDOW_MANAGER_KEY, manager);
}

/**
 * Gets the window manager instance.
 * @returns {WindowManager} The window manager instance.
 */
export function getWindowManager(): WindowManager {
	// Try context first (for components), then fallback to global
	try {
		return getContext(WINDOW_MANAGER_KEY);
	} catch {
		// If context fails (e.g., outside component), use global
		if (!globalWindowManager) {
			globalWindowManager = new WindowManager();
		}
		return globalWindowManager;
	}
}
