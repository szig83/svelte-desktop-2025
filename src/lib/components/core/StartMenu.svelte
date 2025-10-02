<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { getApps } from '$lib/services/apps.remote';
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	import AppIcon from './AppIcon.svelte';
	import UniversalIcon from '../UniversalIcon.svelte';

	const windowManager = getWindowManager();
	let { show = $bindable() } = $props();

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
			<div class="start-menu-header">
				<div class="search-bar">
					<UniversalIcon icon="Search" size={18} class="search-icon" />
					<input class="search-input" type="text" placeholder="Keresés..." />
				</div>
			</div>
			<div class="start-menu-content">
				{#if apps?.error}
					<p>oops!</p>
				{:else if apps?.loading}
					<p>loading...</p>
				{:else if apps?.current}
					<div class="start-menu-apps">
						{#each apps.current as app}
							<AppIcon
								onclick={() => {
									windowManager.openWindow(app.appName, app.title, app);
									show = false;
								}}
								{app}
							/>
						{/each}
					</div>
				{/if}
			</div>
			<div class="start-menu-footer">
				<div class="start-menu-footer-left">
					<div class="avatar"><img src="avatar.png" alt="" /></div>
					<div>Szigeti Balázs</div>
				</div>
				<div class="start-menu-footer-right">
					<button class="btn-click-effect">
						<UniversalIcon icon="Power" size={16} class="btn-power" />
					</button>
				</div>
			</div>
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
		width: 100%;
		overflow: auto;

		/*&::after {
			position: absolute;
			bottom: 0;
			left: calc(var(--startmenu-margin, 16px) + 10px);
			transform: translateX(-50%);
			clip-path: polygon(50% 100%, 0 0, 100% 0);
			background: var(--startmenu-bg);
			width: 20px;
			height: var(--startmenu-margin, 16px);
			content: '';
		}*/
	}

	.start-menu-content {
		display: flex;
		flex-grow: 1;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 10px;
	}

	.start-menu-apps {
		display: inline-grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 10px 15px;
	}

	.start-menu-header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 15px 0 10px 0;

		.search-bar {
			display: flex;
			align-items: center;
			gap: 5px;
			:global(.search-icon) {
				color: #7f7f7f;
			}
			.search-input {
				all: unset;
				transition: border-color 0.2s ease-in-out;
				outline: none;
				border: 1px solid transparent;
				border-radius: 14px;
				background-color: rgba(0, 0, 0, 0.2);
				padding: 0 10px;
				min-width: 200px;
				max-width: 400px;
				height: 28px;
				color: #b7b7b7;
				font-size: 0.8rem;
				field-sizing: content;

				&::placeholder {
					color: #7f7f7f !important;
				}

				&:focus {
					border-color: rgba(255, 255, 255, 0.05);
				}
			}
		}
	}

	.start-menu-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.1);
		padding: 10px 15px;
		font-size: 0.8rem;
	}

	.start-menu-footer-left {
		display: flex;
		align-items: center;
		gap: 10px;
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
