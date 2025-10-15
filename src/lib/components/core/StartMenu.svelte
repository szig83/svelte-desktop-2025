<script lang="ts">
	import { getApps } from '$lib/services/apps.remote';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import AppIcon from './AppIcon.svelte';
	import UniversalIcon from '$lib/components/UniversalIcon.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index';

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
							windowManager.openWindow(app.appName, app.title, app);
							open = false;
							console.log(app);
						}}
						{app}
					/>
				{/each}
			</div>
		{/if}
	</div>
	<div class="footer">
		<div class="footer-left">
			<div class="avatar"><img src="avatar.png" alt="" /></div>
			<div>Szigeti Balázs</div>
		</div>
		<div class="footer-right">
			<button class="btn-click-effect">
				<UniversalIcon icon="Power" size={16} class="btn-power" />
			</button>
		</div>
	</div>
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

		.footer {
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-top: 1px solid var(--color-border);
			background-color: var(--primary-500-alpha-80);
			padding: 10px 0 0 0;
			color: var(--neutral-100);
			font-size: 0.8rem;

			.footer-left {
				display: flex;
				align-items: center;
				gap: 10px;
			}
		}
	}

	.avatar {
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 50%;
		aspect-ratio: 1;
		width: 32px;
		overflow: hidden;
	}

	:global {
		.btn-power {
			transition: color 0.2s ease-in-out;
			cursor: pointer;
			color: rgba(187, 53, 53, 0.8);

			&:hover {
				color: rgba(187, 53, 53, 1);
			}
		}
	}
</style>
