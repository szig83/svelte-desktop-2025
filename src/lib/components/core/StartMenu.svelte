<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { getApps } from '$lib/services/apps.remote';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import AppIcon from './AppIcon.svelte';

	const windowManager = getWindowManager();
	let { show } = $props();

	let apps = $state<ReturnType<typeof getApps> | null>(null);

	$effect(() => {
		if (show && !apps) {
			apps = getApps();
		}
	});
</script>

{#if show}
	<div id="startMenu" transition:fly={{ y: 20, duration: 200 }}>
		<div class="start-menu-wrapper">
			<div class="start-menu-header">Start menü fejléc</div>
			<div class="start-menu-content">
				{#if apps?.error}
					<p>oops!</p>
				{:else if apps?.loading}
					<p>loading...</p>
				{:else if apps?.current}
					<div class="start-menu-apps">
						{#each apps.current as app}
							<AppIcon
								onclick={() => windowManager.openWindow(app.appName, app.title, app)}
								{app}
							/>
						{/each}
					</div>
				{/if}
			</div>
			<div class="start-menu-footer">Start menü lábléc</div>
		</div>
	</div>
{/if}

<style>
	#startMenu {
		display: flex;
		position: fixed;
		bottom: var(--taskbar-height, 100px);
		left: var(--startmenu-margin, 16px);
		z-index: calc(var(--taskbar-z-index) - 1);
		padding-bottom: var(--startmenu-margin, 16px);
		width: var(--startmenu-width, 300px);
		min-height: var(--startmenu-height, 300px);
		overflow: hidden;
		color: #fff;
	}

	.start-menu-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		box-shadow: var(--default-shadow);
		border-radius: var(--default-border-radius, 0);
		background-color: var(--startmenu-bg);
		padding: 8px;
		width: 100%;
		overflow: auto;

		&::after {
			position: absolute;
			bottom: 0;
			left: calc(var(--startmenu-margin, 16px) + 15px);
			transform: translateX(-50%);
			clip-path: polygon(50% 100%, 0 0, 100% 0);
			background: var(--startmenu-bg);
			width: 20px;
			height: var(--startmenu-margin, 16px);
			content: '';
		}
	}

	.start-menu-content {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.start-menu-apps {
		display: inline-grid;
		grid-template-columns: repeat(5, 1fr);
		align-items: stretch; /* Ez igazítja a tetejére */
		justify-items: stretch;
		gap: 15px;
	}
</style>
