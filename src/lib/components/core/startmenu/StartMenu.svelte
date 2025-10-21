<script lang="ts">
	import { getApps } from '$lib/services/apps.remote';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import AppIcon from '../AppIcon.svelte';
	import UniversalIcon from '$lib/components/UniversalIcon.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import StartMenuFooter from './StartMenuFooter.svelte';
	const windowManager = getWindowManager();
	let { open = $bindable() } = $props();

	let apps = $state<ReturnType<typeof getApps> | null>(null);

	$effect(() => {
		if (!apps) {
			apps = getApps();
		}
	});
</script>

<div class="start-menu">
	<div class="header">
		<div class="search-bar">
			<UniversalIcon icon="Search" size={18} class="search-icon" />
			<Input name="appSearch" class="rounded-full pl-8" placeholder="Keresés..." />
		</div>
	</div>
	<div class="content">
		{#if apps?.error}
			<p>oops!</p>
		{:else if apps?.loading}
			<p>loading...</p>
		{:else if apps?.current}
			<div class="apps">
				{#each apps.current as app}
					<AppIcon
						onclick={() => {
							windowManager.openWindow(app.appName, app.title, app, app.parameters);
							open = false;
							console.log(app);
						}}
						{app}
					/>
				{/each}
			</div>
		{/if}
	</div>
	<StartMenuFooter />
</div>

<style>
	.start-menu {
		display: flex;
		flex-direction: column;
		justify-content: space-between;

		.header {
			display: flex;
			justify-content: center;
			align-items: center;

			.search-bar {
				display: flex;
				align-items: center;
				width: 50%;
				:global(.search-icon) {
					position: absolute;
					margin-left: 10px;
					color: #7f7f7f;
				}
			}
		}

		.content {
			display: flex;
			flex-grow: 1;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			padding: 20px 10px;

			.apps {
				display: inline-grid;
				grid-template-columns: repeat(5, 1fr);
				gap: 10px 15px;
			}
		}
	}
</style>
