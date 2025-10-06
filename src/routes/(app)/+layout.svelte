<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './app.css';
	import Desktop from '$lib/components/core/Desktop.svelte';
	let { children } = $props();
</script>

<Desktop>
	{@render children()}
</Desktop>
