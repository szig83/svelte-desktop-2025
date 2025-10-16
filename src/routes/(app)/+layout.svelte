<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './app.css';
	import Desktop from '$lib/components/core/Desktop.svelte';
	import { Toaster } from '$lib/components/ui/sonner';
	import { browser } from '$app/environment';
	let { children } = $props();
</script>

{#if browser}
	<Toaster richColors position="top-right" expand={true} closeButton />
{/if}
<Desktop>
	{@render children()}
</Desktop>
