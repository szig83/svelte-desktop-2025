<script lang="ts">
	import { LayoutGrid } from 'lucide-svelte';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import StartMenu from './StartMenu.svelte';
	const windowManager = getWindowManager();
	let showStartMenu = $state(false);
	/**
	 * Toggle start menu visibility
	 */
	function toggleStartMenu() {
		showStartMenu = !showStartMenu;
	}
</script>

<StartMenu show={showStartMenu} />
<!-- Taskbar a minimalizált ablakok számára -->
<div id="taskbar">
	<button class="btn-startmenu" onclick={toggleStartMenu}><LayoutGrid /></button>
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

<style>
	#taskbar {
		display: flex;
		gap: 8px;
		z-index: var(--taskbar-z-index);
		backdrop-filter: blur(10px);
		background: rgba(40, 40, 40, 0.95);
		height: var(--taskbar-height);
	}
	.btn-startmenu {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s;
		cursor: pointer;
		background-color: var(--startmenu-bg);
		padding: 16px;
		color: rgb(185, 184, 184);

		&:hover {
			background-color: rgba(0, 0, 0, 0.3);
		}
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
