<script lang="ts">
	import { Rocket, Menu } from 'lucide-svelte';
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	import type { WindowManager } from '$lib/stores/windowStore.svelte';
	import UniversalIcon from '$lib/components/UniversalIcon.svelte';
	import StartMenu from './StartMenu.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	let { windowManager }: { windowManager: WindowManager } = $props();

	/**
	 * @TODO ahhoz fog kelleni, hogy a taskbar/startmenü-t külön lehessen dark módba kapcsolni.
	 */
	const themeManager = getThemeManager();

	let startMenuOpen = $state(false);
</script>

<div class="taskbar">
	<div class="taskbar-left">
		<Popover.Root bind:open={startMenuOpen}>
			<Popover.Trigger class="btn-startmenu btn-click-effect"><Menu size={24} /></Popover.Trigger>
			<Popover.Content class="z-[1000] mx-2 my-2 flex w-[var(--startmenu-width)] items-stretch"
				><StartMenu bind:open={startMenuOpen} /></Popover.Content
			>
		</Popover.Root>

		{#each windowManager.windows as window (window.id)}
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
					<UniversalIcon icon={window.icon ?? ''} size={24} appName={window.appName} />
				</div>
				<div class="taskbar-item-title">
					<span>{window.title}</span>
				</div>
			</button>
		{/each}
	</div>
	<div class="taskbar-right">
		<ThemeSwitcher />
		<Clock />
	</div>
</div>

<style>
	@reference "tailwindcss";
	@custom-variant dark (&:is(.dark *));

	.taskbar {
		display: flex;
		justify-content: space-between;
		order: 1;
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
			align-items: stretch;
			gap: 5px;
		}

		.taskbar-right {
			display: flex;
			justify-content: start;
			align-items: center;
			gap: 10px;
			padding-right: 16px;
		}

		.taskbar-item {
			display: flex;
			align-items: center;
			gap: 10px;
			transition: all 0.2s;
			cursor: pointer;
			margin: 5px 0;
			border-radius: var(--radius-sm);
			padding: 0 10px;

			.taskbar-item-title {
				display: flex;
				align-items: stretch;
				max-width: 200px;
				color: var(--taskbar-item-text-color);
				font-size: 0.85rem;

				& > span {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
			}

			&.active {
				box-shadow:
					var(--shadow-sm),
					0px 15px 20px -15px rgba(from var(--color-primary) r g b / 0.8);
			}

			&:hover {
				background-color: var(--color-accent) !important;
			}

			.taskbar-item-icon {
				display: flex;
				align-items: stretch;
				transition: filter 0.2s ease-in-out;
			}

			&.minimized {
				opacity: 0.7;
				background-color: transparent;

				.taskbar-item-icon {
					filter: grayscale(1);
				}
			}
		}
	}

	:global(.btn-startmenu) {
		@apply mx-2 my-1 h-full;
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background-color 0.2s;
		cursor: pointer;
		border-radius: var(--radius-sm);
		/*background-color: var(--color-primary-alpha-60);*/
		background-color: var(--color-secondary);
		aspect-ratio: 1;
		height: 45px;
		/*color: var(--color-neutral-100);*/
		color: var(--color-taskbar-foreground);

		&:hover,
		&[data-state='open'] {
			background-color: var(--color-primary-alpha-80);
			color: var(--color-neutral-100);
		}
	}
</style>
