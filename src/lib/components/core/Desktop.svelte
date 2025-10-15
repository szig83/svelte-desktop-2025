<script lang="ts">
	import { createWindowManager, setWindowManager } from '$lib/stores/windowStore.svelte';
	import { createThemeManager, setThemeManager } from '$lib/stores/themeStore.svelte';
	import Window from '$lib/components/core/window/Window.svelte';
	import Taskbar from '$lib/components/core/Taskbar.svelte';

	const windowManager = createWindowManager();
	setWindowManager(windowManager);

	const themeManager = createThemeManager();
	setThemeManager(themeManager);

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
		// CSS változók beállítása
		const vars = themeManager.cssVariables;
		Object.entries(vars).forEach(([key, value]) => {
			document.documentElement.style.setProperty(key, value);
		});

		// CSS osztályok szinkronizálása (dark/light mód, stb.)
		document.documentElement.className = themeManager.cssClasses;
	});
</script>

<div class={['desktop', themeManager.cssClasses]}>
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
		background: url('/bg.jpg') center center / cover no-repeat fixed;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.workspace {
		position: relative;
		flex-grow: 1;
		order: 1;
		overflow: hidden;
	}
</style>
