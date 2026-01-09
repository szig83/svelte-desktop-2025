<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import './protected.css';
	import '../appAdmin.css';
	import Desktop from '$lib/components/core/Desktop.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	// Settings kontextus beállítása, hogy a gyerek komponensek elérjék
	const settings = $derived(data.settings);
	setContext('settings', settings);
</script>

{#if browser}
	<Toaster richColors position="top-right" expand={true} closeButton />
{/if}
<Desktop>
	{@render children()}
</Desktop>
