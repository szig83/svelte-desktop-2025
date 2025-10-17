<script lang="ts">
	import { Rocket, Menu } from 'lucide-svelte';
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	import type { WindowManager } from '$lib/stores/windowStore.svelte';
	import UniversalIcon from '$lib/components/UniversalIcon.svelte';
	import StartMenu from './StartMenu.svelte';
	import Clock from '$lib/components/Clock.svelte';
	import * as Popover from '$lib/components/ui/popover';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import WindowLink from '$lib/components/WindowLink.svelte';
	import { getContext } from 'svelte';
	import { takeWindowScreenshot } from '$lib/utils/screenshot';
	import type { TaskbarPosition } from '$lib/types/desktopEnviroment.ts';
	let { windowManager }: { windowManager: WindowManager } = $props();

	const settings = getContext<{
		screenshotThumbnailHeight: number;
		windowPreview: boolean;
		preferPerformance: boolean;
		taskbarPosition: TaskbarPosition;
	}>('settings');
	/**
	 * @TODO ahhoz fog kelleni, hogy a taskbar/startmenü-t külön lehessen dark módba kapcsolni.
	 */
	const themeManager = getThemeManager();

	let startMenuOpen = $state(false);
</script>

<div class={['taskbar', settings.taskbarPosition === 'top' ? 'order-1' : 'order-3']}>
	<div class="taskbar-left">
		<Popover.Root bind:open={startMenuOpen}>
			<Popover.Trigger class="btn-startmenu btn-click-effect"><Menu size={24} /></Popover.Trigger>
			<Popover.Content class="z-[1000] mx-2 my-2 flex w-[var(--startmenu-width)] items-stretch"
				><StartMenu bind:open={startMenuOpen} /></Popover.Content
			>
		</Popover.Root>

		{#each windowManager.windows as window (window.id)}
			<div class="taskbar-item-wrapper">
				<button
					class="taskbar-item"
					class:active={window.isActive}
					class:minimized={window.isMinimized}
					onclick={async () => {
						if (window.isMinimized) {
							// Ha minimalizált, visszaállítjuk és aktiváljuk
							await windowManager.minimizeWindow(window.id);
						} else if (window.isActive) {
							// Ha aktív, minimalizáljuk (screenshot-tal)
							await windowManager.minimizeWindow(window.id, async () => {
								if (settings.windowPreview && !settings.preferPerformance) {
									await takeWindowScreenshot(
										window.id,
										windowManager,
										settings.screenshotThumbnailHeight
									);
								}
							});
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
				{#if window.screenshot}
					<div class="screenshot-preview">
						<img
							style:height="{settings.screenshotThumbnailHeight}px"
							src={window.screenshot}
							alt="{window.title} preview"
						/>
					</div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="taskbar-right">
		<WindowLink />
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
			align-items: stretch;
			gap: 10px;
			padding-right: 16px;
		}

		.taskbar-item-wrapper {
			display: flex;
			position: relative;
			align-items: stretch;

			&:hover .screenshot-preview {
				transform: translateY(-8px);
				visibility: visible;
				opacity: 1;
			}
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

		.screenshot-preview {
			position: absolute;
			bottom: 100%;
			left: 0;
			/*transform: translateX(-50%) translateY(0);*/
			visibility: hidden;
			opacity: 0;
			z-index: 1000;
			backdrop-filter: blur(12px);
			transition:
				opacity 0.2s,
				visibility 0.2s,
				transform 0.2s;
			margin-bottom: 8px;
			box-shadow: var(--shadow-lg);
			border: 1px solid var(--color-border);
			border-radius: var(--radius-md);
			background-color: var(--color-popover);
			padding: 8px;
			pointer-events: none;

			img {
				display: block;
				border-radius: var(--radius-sm);
				max-width: none;
				/*height: 200px;*/
				object-fit: contain;
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
