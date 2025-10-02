<script lang="ts">
	import { LayoutGrid } from 'lucide-svelte';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import UniversalIcon from '../UniversalIcon.svelte';
	import StartMenu from './StartMenu.svelte';
	import Clock from '../Clock.svelte';
	const windowManager = getWindowManager();
	let showStartMenu = $state(false);
	/**
	 * Toggle start menu visibility
	 */
	function toggleStartMenu() {
		showStartMenu = !showStartMenu;
	}
</script>

<StartMenu bind:show={showStartMenu} />
<!-- Taskbar a minimalizált ablakok számára -->
<div id="taskbar">
	<div class="taskbar-left">
		<button class="btn-startmenu btn-click-effect" onclick={toggleStartMenu}><LayoutGrid /></button>
		{#each windowManager.windows as window}
			{$inspect(window)}
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
				<div class="taskbar-item-icon">
					<UniversalIcon icon={window.icon ?? 'FileX'} size={24} />
				</div>
				{window.title}
			</button>
		{/each}
	</div>
	<div class="taskbar-right">
		<Clock />
	</div>
</div>

<style>
	#taskbar {
		display: flex;
		justify-content: space-between;

		z-index: var(--taskbar-z-index);
		backdrop-filter: blur(10px);
		background: rgba(40, 40, 40, 0.95);
		height: var(--taskbar-height);

		.taskbar-left {
			display: flex;
			flex-grow: 1;
			justify-content: start;
			align-items: center;
		}

		.taskbar-right {
			display: flex;
			justify-content: start;
			align-items: center;
			padding-right: 16px;
		}
	}
	.btn-startmenu {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s;
		cursor: pointer;
		background-color: var(--startmenu-bg);
		aspect-ratio: 1;
		height: 100%;
		color: rgb(185, 184, 184);

		&:hover {
			background-color: rgba(0, 0, 0, 0.3);
		}
	}

	.taskbar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		border-bottom: 3px solid transparent;
		border-left: 1px solid rgba(255, 255, 255, 0.1);
		background-color: rgba(0, 0, 0, 0.7);
		padding: 0 16px;
		max-width: 200px;
		height: 100%;
		overflow: hidden;
		color: rgb(178, 178, 178);
		font-size: 0.85rem;
		/*text-overflow: ellipsis;
		white-space: nowrap;*/

		.taskbar-item-icon {
			display: flex;
			align-items: center;
			filter: grayscale(1);
			transition: filter 0.2s ease-in-out;
			height: 100%;
		}
	}

	.taskbar-item:hover {
		background: rgba(255, 255, 255, 0.2);
		.taskbar-item-icon {
			filter: grayscale(0);
		}
	}

	.taskbar-item.active {
		border-bottom-color: rgba(82, 142, 167, 0.9);
		color: rgb(225, 225, 225);
		.taskbar-item-icon {
			filter: grayscale(0);
		}
	}

	.taskbar-item.minimized {
		opacity: 0.6;
	}
</style>
