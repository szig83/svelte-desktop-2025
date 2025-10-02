// src/lib/stores/windowStore.svelte.ts
import { getContext, setContext } from 'svelte';
import { type AppMetadata } from '$lib/types/window';

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
	size: { width: number; height: number };
	component?: any; // A betöltött komponens példány
	isLoading?: boolean;
};

class WindowManager {
	windows = $state<WindowState[]>([]);
	private nextId = 1;
	private baseZIndex = 100;

	openWindow(appName: string, title: string, metadata: Partial<AppMetadata> = {}) {
		const existingWindow = this.windows.find((w) => w.appName === appName);

		if (existingWindow) {
			// Ha már nyitva van, akkor aktiváljuk és visszaállítjuk a minimalizálásból
			existingWindow.isMinimized = false;
			this.activateWindow(existingWindow.id);
			return existingWindow.id;
		}

		const id = `window-${this.nextId++}`;
		const newWindow: WindowState = {
			id,
			appName,
			icon: metadata.icon,
			title,
			isActive: true,
			isMinimized: false,
			isMaximized: false,
			zIndex: this.getNextZIndex(),
			position: this.getNextPosition(),
			size: metadata.defaultSize || { width: 600, height: 400 },
			component: null,
			isLoading: true
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
			window.isMaximized = !window.isMaximized;
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

export function createWindowManager() {
	return new WindowManager();
}

export function setWindowManager(manager: WindowManager) {
	setContext(WINDOW_MANAGER_KEY, manager);
}

export function getWindowManager(): WindowManager {
	return getContext(WINDOW_MANAGER_KEY);
}
