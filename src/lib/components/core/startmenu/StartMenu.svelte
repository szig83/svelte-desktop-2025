<script lang="ts">
	import { getClientAppRegistry, AppRegistryError } from '$lib/services/client/appRegistry';
	import { getWindowManager } from '$lib/stores';
	import AppIcon from './AppIcon.svelte';
	import { UniversalIcon } from '$lib/components/shared';
	import Input from '$lib/components/ui/input/input.svelte';
	import StartMenuFooter from './StartMenuFooter.svelte';
	import type { AppMetadata } from '$lib/types/window';

	const windowManager = getWindowManager();
	const appRegistry = getClientAppRegistry();

	let { open = $bindable() } = $props();

	// State management for apps loading
	let apps = $state<AppMetadata[]>([]);
	let loading = $state(false);
	let error = $state<AppRegistryError | null>(null);

	// Load apps when component mounts
	$effect(() => {
		loadApps();
	});

	async function loadApps() {
		loading = true;
		error = null;

		try {
			apps = await appRegistry.getApps();
		} catch (err) {
			if (err instanceof AppRegistryError) {
				error = err;
			} else {
				error = new AppRegistryError(
					'unknown_error' as any,
					'Failed to load applications',
					err instanceof Error ? err : undefined
				);
			}
			apps = [];
		} finally {
			loading = false;
		}
	}

	async function retryLoading() {
		try {
			await appRegistry.retry();
			await loadApps();
		} catch (err) {
			// Error will be handled by loadApps
		}
	}

	async function refreshApps() {
		try {
			await appRegistry.refresh();
			await loadApps();
		} catch (err) {
			// Error will be handled by loadApps
		}
	}
</script>

<div class="start-menu">
	<div class="header">
		<div class="search-bar">
			<UniversalIcon icon="Search" size={18} class="search-icon" />
			<Input name="appSearch" class="rounded-full pl-8" placeholder="Keresés..." />
		</div>
	</div>
	<div class="content">
		{#if error}
			<div class="error-state">
				<UniversalIcon icon="AlertCircle" size={32} class="error-icon" />
				<p class="error-message">{error.getUserFriendlyMessage()}</p>
				<div class="error-actions">
					{#if error.isRecoverable()}
						<button class="retry-button" onclick={retryLoading} disabled={loading}>
							{loading ? 'Retrying...' : 'Try Again'}
						</button>
					{/if}
					<button class="refresh-button" onclick={refreshApps} disabled={loading}>
						{loading ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
			</div>
		{:else if loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading applications...</p>
			</div>
		{:else if apps.length > 0}
			<div class="apps">
				{#each apps as app}
					<AppIcon
						onclick={() => {
							windowManager.openWindow(app.appName, app.title, app, app.parameters);
							open = false;
						}}
						{app}
					/>
				{/each}
			</div>
		{:else}
			<div class="empty-state">
				<UniversalIcon icon="Package" size={32} class="empty-icon" />
				<p>No applications available</p>
				<button class="refresh-button" onclick={refreshApps} disabled={loading}>
					{loading ? 'Refreshing...' : 'Refresh'}
				</button>
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
		gap: 2rem;

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

			.apps {
				display: inline-grid;
				grid-template-columns: repeat(5, 1fr);
				gap: 10px 15px;
			}

			.loading-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 16px;
				color: #666;

				.loading-spinner {
					animation: spin 1s linear infinite;
					border: 3px solid #e0e0e0;
					border-top: 3px solid #007acc;
					border-radius: 50%;
					width: 32px;
					height: 32px;
				}

				p {
					margin: 0;
					font-weight: 500;
					font-size: 14px;
				}
			}

			.error-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12px;
				text-align: center;

				:global(.error-icon) {
					color: #d32f2f;
				}

				.error-message {
					margin: 0;
					max-width: 250px;
					color: #d32f2f;
					font-size: 14px;
				}

				.error-actions {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 8px;
				}

				.retry-button,
				.refresh-button {
					transition: background-color 0.2s;
					cursor: pointer;
					border: none;
					border-radius: 4px;
					padding: 8px 16px;
					min-width: 80px;
					color: white;
					font-size: 12px;

					&:disabled {
						opacity: 0.6;
						cursor: not-allowed;
					}
				}

				.retry-button {
					background-color: #007acc;

					&:hover:not(:disabled) {
						background-color: #005a9e;
					}

					&:active:not(:disabled) {
						background-color: #004578;
					}
				}

				.refresh-button {
					background-color: #666;

					&:hover:not(:disabled) {
						background-color: #555;
					}

					&:active:not(:disabled) {
						background-color: #444;
					}
				}
			}

			.empty-state {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 12px;
				color: #666;
				text-align: center;

				:global(.empty-icon) {
					color: #999;
				}

				p {
					margin: 0;
					font-size: 14px;
				}

				.refresh-button {
					transition: background-color 0.2s;
					cursor: pointer;
					border: none;
					border-radius: 4px;
					background-color: #666;
					padding: 8px 16px;
					min-width: 80px;
					color: white;
					font-size: 12px;

					&:disabled {
						opacity: 0.6;
						cursor: not-allowed;
					}

					&:hover:not(:disabled) {
						background-color: #555;
					}

					&:active:not(:disabled) {
						background-color: #444;
					}
				}
			}
		}

		@keyframes spin {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	}
</style>
