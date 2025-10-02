<script lang="ts">
	import { Rocket } from 'lucide-svelte';
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
<div id="taskbar" class="dark">
	<div class="taskbar-left">
		<button class="btn-startmenu btn-click-effect" onclick={toggleStartMenu}
			><Rocket size={20} /></button
		>
		{#each windowManager.windows as window}
			<button
				class="taskbar-item"
				class:active={window.isActive}
				class:minimized={window.isMinimized}
				onclick={() => {
					if (window.isMinimized) {
						// Ha minimalizált, visszaállítjuk és aktiváljuk
						windowManager.minimizeWindow(window.id);
					} else if (window.isActive) {
						// Ha aktív, minimalizáljuk
						windowManager.minimizeWindow(window.id);
					} else {
						// Ha inaktív (de nem minimalizált), aktiváljuk
						windowManager.activateWindow(window.id);
					}
				}}
			>
				<div class="taskbar-item-icon">
					<UniversalIcon icon={window.icon ?? 'FileX'} size={24} />
				</div>
				<div class="taskbar-item-title">
					<span>{window.title}</span>
				</div>
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
		background: var(--color-panel-bg);
		height: var(--taskbar-height);

		.taskbar-left {
			display: flex;
			flex-grow: 1;
			justify-content: start;
			align-items: center;
			gap: 5px;
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
		margin-left: 5px;
		border-radius: 4px;
		aspect-ratio: 1;
		height: calc(var(--taskbar-height) - 5px);
		color: rgb(185, 184, 184);

		&:hover {
			background-color: var(--color-accent);
			color: var(--color-accent-text);
		}
	}

	.taskbar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		transition: all 0.2s;
		cursor: pointer;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 0 10px;

		height: calc(var(--taskbar-height) - 5px);

		.taskbar-item-icon {
			display: flex;
			align-items: center;
			filter: grayscale(1);
			transition: filter 0.2s ease-in-out;
			height: 100%;
		}
		.taskbar-item-title {
			display: flex;
			align-items: center;
			max-width: 100px;
			height: 100%;
			color: rgb(178, 178, 178);
			font-size: 0.85rem;

			& > span {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.taskbar-item:hover {
		background-color: rgb(255 255 255 / 7%) !important;
		.taskbar-item-icon {
			filter: grayscale(0);
		}
	}

	.taskbar-item.active {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

		background-color: rgb(255 255 255 / 5%);
		.taskbar-item-icon {
			filter: grayscale(0);
		}
	}

	.taskbar-item.minimized {
		opacity: 0.6;
	}
</style>
