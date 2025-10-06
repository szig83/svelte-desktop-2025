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

<div class="dark">
	<StartMenu bind:show={showStartMenu} />
	<!-- Taskbar a minimalizált ablakok számára -->
	<div id="taskbar">
		<div>
			<div class="taskbar-left">
				<button class="btn-startmenu btn-click-effect" onclick={toggleStartMenu}
					><Rocket size={22} /></button
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
							<UniversalIcon icon={window.icon ?? 'FileX'} size={32} />
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
	</div>
</div>

<style>
	#taskbar {
		z-index: var(--taskbar-z-index);

		padding: 0 var(--startmenu-margin) var(--startmenu-margin) var(--startmenu-margin);
		height: var(--taskbar-height);
	}

	#taskbar > div {
		display: flex;
		justify-content: space-between;
		backdrop-filter: blur(10px);
		border-radius: var(--border-radius);
		background: hsl(from var(--panel-bg-color) h s calc(l - 5));
		width: 100%;
		height: 100%;

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

		border-radius: var(--border-radius);
		aspect-ratio: 1;
		height: calc(var(--taskbar-height) - var(--startmenu-margin));
		color: var(--panel-text-color);

		&:hover {
			background-color: var(--accent-color);
			color: var(--accent-text-color);
		}
	}

	.taskbar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		transition: all 0.2s;
		cursor: pointer;
		border: 1px solid transparent;
		border-radius: var(--border-radius);
		padding: 0 10px;

		height: calc(var(--taskbar-height) - var(--startmenu-margin) - 5px);

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
			color: var(--taskbar-item-text-color);
			font-size: 0.85rem;

			& > span {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}

	.taskbar-item:hover {
		background-color: var(--taskbar-item-bg-color_hover) !important;
		.taskbar-item-icon {
			filter: grayscale(0);
		}
	}

	.taskbar-item.active {
		box-shadow:
			var(--shadow),
			inset -1px -8px 20px 6px rgba(from var(--accent-color) r g b / 0.4);
		/*border-bottom: 2px solid rgba(from var(--accent-color) r g b / 0.4);*/
		background-color: var(--taskbar-item-bg-color_active);

		.taskbar-item-icon {
			filter: grayscale(0);
		}
	}

	.taskbar-item.minimized {
		opacity: 0.4;
	}
</style>
