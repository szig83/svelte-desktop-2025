<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../appAdmin.css';
	import './protected.css';
	import Desktop from '$lib/components/core/Desktop.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';
	import { createThemeManager } from '$lib/stores';
	import { updateSettings } from '$lib/apps/settings/settings.remote';
	import '@fontsource-variable/quicksand';

	let { children, data } = $props();

	// Settings kontextus beállítása - use a getter to maintain reactivity
	const settingsContext = {
		get windowPreview() {
			return data.settings.windowPreview;
		},
		get screenshotThumbnailHeight() {
			return data.settings.screenshotThumbnailHeight;
		},
		get preferPerformance() {
			return data.settings.preferPerformance;
		},
		get background() {
			return data.settings.background;
		},
		get taskbarPosition() {
			return data.settings.taskbarPosition;
		},
		get theme() {
			return data.settings.theme;
		}
	};
	setContext('settings', settingsContext);

	// ThemeManager inicializálása a szerver beállításokkal
	// Csak kliens oldalon
	if (browser) {
		let themeManager = $state<ReturnType<typeof createThemeManager>>();

		// Inicializáljuk és frissítjük a ThemeManager-t
		$effect(() => {
			if (!themeManager) {
				themeManager = createThemeManager(data.settings.theme);

				// Beállítjuk a mentési callback-et, ami cookie-ba menti
				themeManager.setSaveCallback(async (themeSettings) => {
					await updateSettings({ theme: themeSettings });
				});
			} else {
				// Frissítjük a ThemeManager settings-ét közvetlenül, mentés nélkül
				const currentSettings = data.settings.theme;
				if (JSON.stringify(themeManager.settings) !== JSON.stringify(currentSettings)) {
					themeManager.settings = { ...currentSettings };
				}
			}
		});
	}
</script>

{#if browser}
	<Toaster richColors position="top-right" expand={true} closeButton />
{/if}
<Desktop>
	{@render children()}
</Desktop>

<style>
	:global(h1, h2, h3, h4, h5, h6, lablel) {
		font-family: 'Quicksand Variable', serif;
	}
</style>
