<script lang="ts">
	import { Rocket } from 'lucide-svelte';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import UniversalIcon from '../UniversalIcon.svelte';
	import StartMenu from './StartMenu.svelte';
	import Clock from '../Clock.svelte';
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	import * as Popover from '$lib/components/ui/popover';
	const themeManager = getThemeManager();
	const windowManager = getWindowManager();
	let showStartMenu = $state(false);
	/**
	 * Toggle start menu visibility
	 */
	function toggleStartMenu() {
		showStartMenu = !showStartMenu;
	}
</script>

<!-- Taskbar a minimalizált ablakok számára -->
<div class="taskbar">
	<div class="taskbar-left">
		<Popover.Root>
			<Popover.Trigger class="btn-startmenu h-full"><Rocket size={24} /></Popover.Trigger>
			<Popover.Content class="mx-4 my-2 w-96"><StartMenu /></Popover.Content>
		</Popover.Root>

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
					<UniversalIcon icon={window.icon ?? ''} size={32} appName={window.appName} />
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
	.taskbar {
		display: flex;
		justify-content: space-between;
		z-index: var(--taskbar-z-index);
		backdrop-filter: blur(10px);
		border-radius: 0;
		background-color: var(--color-taskbar-background);
		width: 100%;
		color: var(--color-taskbar-foreground);

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

	:global(.btn-startmenu) {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s;
		cursor: pointer;
		background-color: var(--color-primary-alpha-20);
		aspect-ratio: 1;
		&:hover {
			background-color: var(--color-primary);
		}
	}

	.taskbar-item {
		display: flex;
		align-items: center;
		gap: 10px;
		transition: all 0.2s;
		cursor: pointer;
		border: 1px solid transparent;
		border-radius: 0;
		background-color: var(--taskbar-item-bg-color);
		padding: 0 10px;

		height: calc(var(--taskbar-height) - var(--startmenu-margin) - 5px);

		.taskbar-item-icon {
			display: flex;
			align-items: center;

			transition: filter 0.2s ease-in-out;
			height: 100%;
		}
		.taskbar-item-title {
			display: flex;
			align-items: center;
			max-width: 200px;
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
	}

	.taskbar-item.active {
		box-shadow:
			var(--shadow-sm),
			0px 15px 20px -15px rgba(from var(--primary-400) r g b / 0.8);
		background-color: var(--taskbar-item-bg-color_active);
	}

	.taskbar-item.minimized {
		opacity: 0.7;
		background-color: transparent;

		.taskbar-item-icon {
			filter: grayscale(1);
		}
	}
</style>
