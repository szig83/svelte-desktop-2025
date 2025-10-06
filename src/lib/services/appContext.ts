import { getContext } from 'svelte';
import { type AppParameters } from '$lib/types/window';
import { getWindowManager } from '$lib/stores/windowStore.svelte';

export const APP_CONTEXT_KEY = Symbol('appContext');

export interface AppContext {
	parameters: AppParameters;
	windowId: string;
	windowManager?: unknown; // WindowManager instance
}

/** Sets the app context (used internally by Window component). */
export function setAppContext(context: AppContext) {
	// This will be set by the Window component when rendering the app
	return context;
}

/** Gets the current app context. */
export function getAppContext(): AppContext {
	return getContext(APP_CONTEXT_KEY);
}

/** Gets the parameters passed to the current app. */
export function getAppParameters(): AppParameters {
	const context = getAppContext();
	return context?.parameters || {};
}

/** Gets the window ID of the current app. */
export function getWindowId(): string {
	const context = getAppContext();
	return context?.windowId || '';
}

/** Convenience function to get a specific parameter with optional default value. */
export function getParameter<T = unknown>(key: string, defaultValue: T): T;
export function getParameter<T = unknown>(key: string): T | undefined;
export function getParameter<T = unknown>(key: string, defaultValue?: T): T | undefined {
	const parameters = getAppParameters();
	return (parameters[key] as T) ?? defaultValue;
}

/** Updates the title of a specific window by ID. */
export function updateWindowTitleById(windowId: string, newTitle: string): void {
	const windowManager = getWindowManager();
	windowManager.updateWindowTitle(windowId, newTitle);
}

/** Updates the title of the current window (deprecated - use updateWindowTitleById). */
export function updateWindowTitle(newTitle: string): void {
	console.error('updateWindowTitle is deprecated due to context limitations. Use updateWindowTitleById instead.');
}
