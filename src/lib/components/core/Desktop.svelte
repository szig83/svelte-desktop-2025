<script lang="ts">
	import { getContext } from 'svelte';
	import { createWindowManager, setWindowManager, getThemeManager } from '$lib/stores';
	import { getAppByName } from '$lib/services/client/appRegistry';
	import * as ContextMenu from '$lib/components/ui/context-menu';
	import Window from '$lib/components/core/window/Window.svelte';
	import Taskbar from '$lib/components/core/Taskbar.svelte';
	import type { BackgroundType } from '$lib/types/desktopEnviroment.ts';
	import { browser } from '$app/environment';

	const settings = getContext<{
		background: {
			type: BackgroundType;
			value: string;
		};
		theme: {
			mode: 'light' | 'dark' | 'auto';
			modeTaskbarStartMenu: 'light' | 'dark' | 'auto';
			colorPrimaryHue: string;
			fontSize: 'small' | 'medium' | 'large';
		};
	}>('settings');

	const windowManager = createWindowManager();
	setWindowManager(windowManager);

	// ThemeManager csak kliens oldalon
	let themeManager = $state<ReturnType<typeof getThemeManager> | null>(null);

	$effect(() => {
		if (browser) {
			themeManager = getThemeManager();
		}
	});

	let { children } = $props();

	function handleWorkspaceClick(e: MouseEvent) {
		// Ha a workspace-re kattintunk (nem ablakra), deaktiváljuk az összes ablakot
		if (e.target === e.currentTarget) {
			windowManager.deactivateAllWindows();
		}
	}

	function handleWorkspaceKeydown(e: KeyboardEvent) {
		// Enter vagy Space billentyűre ugyanaz történik, mint kattintásra
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			windowManager.deactivateAllWindows();
		}
	}

	// CSS változók és osztályok alkalmazása a document root-ra (html elem)
	$effect(() => {
		if (themeManager) {
			// CSS változók beállítása
			const vars = themeManager.cssVariables;
			Object.entries(vars).forEach(([key, value]) => {
				document.documentElement.style.setProperty(key, value);
			});

			// CSS osztályok szinkronizálása (dark/light mód, stb.)
			document.documentElement.className = themeManager.cssClasses;
		}
	});

	// SSR-hez: effektív téma mód kiszámítása settings-ből
	function getEffectiveMode() {
		if (settings.theme.mode === 'auto') {
			return 'dark'; // SSR fallback
		}
		return settings.theme.mode;
	}

	// CSS osztályok SSR-hez és kliens oldalhoz
	const cssClasses = $derived(
		themeManager ? themeManager.cssClasses : `${getEffectiveMode()} font-${settings.theme.fontSize}`
	);
</script>

<div
	class={['desktop', cssClasses]}
	style:background-color={settings.background.type === 'color' &&
	settings.background.value &&
	settings.background.value.length > 0
		? settings.background.value
		: ''}
	style:background={settings.background.type === 'image' &&
	settings.background.value &&
	settings.background.value.length > 0
		? `url(/backgrounds/image/${settings.background.value}) center center / cover no-repeat fixed`
		: ''}
	style:--primary-h={settings.theme.colorPrimaryHue}
>
	{#if settings.background.type === 'video' && settings.background.value && settings.background.value.length > 0}
		<div class="video-background">
			{#key settings.background.value}
				<video autoplay muted loop playsinline>
					<source src={`/backgrounds/video/${settings.background.value}`} type="video/mp4" />
					A böngésződ nem támogatja a videó lejátszást.
				</video>
			{/key}
		</div>
	{/if}
	<ContextMenu.Root>
		<ContextMenu.Trigger class="workspace-trigger">
			<div
				id="workspace"
				class="workspace"
				onclick={handleWorkspaceClick}
				onkeydown={handleWorkspaceKeydown}
				role="button"
				tabindex="-1"
			>
				{#if children}
					{@render children()}
				{/if}

				<!-- Ablakok renderelése -->
				{#each windowManager.windows as window (window.id)}
					<Window windowState={window} />
				{/each}
			</div>
		</ContextMenu.Trigger>
		<ContextMenu.Content class="z-1000">
			<ContextMenu.Item
				onclick={async () => {
					const settingsApp = await getAppByName('settings');
					if (settingsApp) {
						windowManager.openWindow(settingsApp.appName, settingsApp.title, settingsApp, {
							section: 'background'
						});
					}
				}}>Háttér testreszabása</ContextMenu.Item
			>
		</ContextMenu.Content>
	</ContextMenu.Root>

	<Taskbar {windowManager} />
</div>

<style>
	.desktop {
		display: flex;
		position: relative;
		flex-direction: column;
		justify-content: space-between;
		transition:
			background-color 0.3s ease,
			color 0.3s ease;
		/*background: url('/bg.jpg') center center / cover no-repeat fixed;*/
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	:global(.workspace-trigger) {
		display: flex;
		flex-grow: 1;
		order: 2;
	}

	.workspace {
		position: relative;
		flex-grow: 1;
		overflow: hidden;
	}

	.video-background {
		position: fixed;
		top: 0;
		left: 0;
		z-index: -1;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.video-background video {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: auto;
		min-width: 100%;
		height: auto;
		min-height: 100%;
		object-fit: cover;
	}
</style>
