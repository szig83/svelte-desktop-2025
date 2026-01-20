<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../appAdmin.css';
	import './protected.css';
	import Desktop from '$lib/components/core/Desktop.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';

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
</script>

{#if browser}
	<Toaster richColors position="top-right" expand={true} closeButton />
{/if}
<Desktop>
	{@render children()}
</Desktop>
