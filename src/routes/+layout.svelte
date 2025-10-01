<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { createWindowManager, setWindowManager } from '$lib/stores/windowStore.svelte';
	import Window from '$lib/components/Window.svelte';

	const windowManager = createWindowManager();
	setWindowManager(windowManager);

	let { children } = $props();
</script>

<div class="app-container">
	{#if children}
		{@render children()}
	{/if}

	<!-- Taskbar a minimalizált ablakok számára -->
	{#if windowManager.windows.length > 0}
		<div class="taskbar">
			{#each windowManager.windows as window}
				<button
					class="taskbar-item"
					class:active={window.isActive}
					class:minimized={window.isMinimized}
					onclick={() => {
						if (window.isMinimized) {
							windowManager.minimizeWindow(window.id);
						}
						windowManager.activateWindow(window.id);
					}}
				>
					{window.title}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Ablakok renderelése -->
	{#each windowManager.windows as window (window.id)}
		<Window windowState={window} />
	{/each}
</div>

<style>
	.app-container {
		position: relative;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.taskbar {
		display: flex;
		position: fixed;
		right: 0;
		bottom: 0;
		left: 0;
		gap: 8px;
		z-index: 10000;
		backdrop-filter: blur(10px);
		background: rgba(40, 40, 40, 0.95);
		padding: 8px;
		height: 48px;
	}

	.taskbar-item {
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		border-radius: 6px;
		background: rgba(255, 255, 255, 0.1);
		padding: 0 16px;
		max-width: 200px;
		overflow: hidden;
		color: white;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.taskbar-item:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.taskbar-item.active {
		background: rgba(100, 150, 255, 0.5);
	}

	.taskbar-item.minimized {
		opacity: 0.6;
	}
</style>
