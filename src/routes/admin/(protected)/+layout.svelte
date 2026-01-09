<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../appAdmin.css';
	import './protected.css';
	import Desktop from '$lib/components/core/Desktop.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	import { setContext } from 'svelte';

	let { children, data } = $props();

	// Settings kontextus beállítása, hogy a gyerek komponensek elérjék
	// A svelte-ignore azért kell, mert a data változóra false pozitív warningot ad a svelte,
	// mert nem tudja, hogy az a localsból jön és csak oldalbetöltéskor frissül.
	// svelte-ignore state_referenced_locally
	setContext('settings', data.settings);
</script>

{#if browser}
	<Toaster richColors position="top-right" expand={true} closeButton />
{/if}
<Desktop>
	{@render children()}
</Desktop>
