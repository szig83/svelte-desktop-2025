<script lang="ts">
	import { createWindowManager, setWindowManager } from '$lib/stores/windowStore.svelte';
	import Window from '$lib/components/core/window/Window.svelte';
	import Taskbar from '$lib/components/core/Taskbar.svelte';

	const windowManager = createWindowManager();
	setWindowManager(windowManager);

	let { children } = $props();
</script>

<div id="desktop">
	<div id="workspace">
		{#if children}
			{@render children()}
		{/if}

		<!-- Ablakok renderelése -->
		{#each windowManager.windows as window (window.id)}
			<Window windowState={window} />
		{/each}
	</div>

	<Taskbar />
</div>

<style>
	#desktop {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: space-between;

		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	#workspace {
		position: relative;
		flex-grow: 1;
		overflow: hidden;
	}
</style>
