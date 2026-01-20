<script lang="ts">
	interface Props {
		appName: string;
		component: string | null;
		props?: Record<string, any>;
	}

	let { appName, component, props = {} }: Props = $props();

	let loadedComponent = $state<any>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		if (component) {
			loadComponent(component);
		} else {
			loadedComponent = null;
			error = null;
		}
	});

	async function loadComponent(name: string) {
		loading = true;
		error = null;

		try {
			// Dinamikus import az app-specifikus components mappából
			const module = await import(`../../apps/${appName}/components/${name}.svelte`);
			loadedComponent = module.default;
		} catch (e) {
			console.error(`Failed to load component: ${name} from app: ${appName}`, e);
			error = `Nem sikerült betölteni a komponenst: ${name}`;
			loadedComponent = null;
		} finally {
			loading = false;
		}
	}
</script>

<div class="app-content-area">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Betöltés...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{:else if loadedComponent}
		{@const Component = loadedComponent}
		<Component {...props} />
	{:else}
		<div class="placeholder">
			<p>Válassz egy menüpontot a bal oldalon</p>
		</div>
	{/if}
</div>

<style>
	.app-content-area {
		width: 100%;
		height: 100%;
	}

	.loading,
	.placeholder {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
		color: var(--color-neutral-500);
	}

	.loading p,
	.placeholder p {
		font-size: 0.875rem;
	}

	.error {
		margin: 1rem;
		border: 1px solid var(--color-red-200);
		border-radius: var(--radius-md, 0.375rem);
		background-color: var(--color-red-50);
		padding: 1rem;
		color: var(--color-red-700);
	}

	:global(.dark) .error {
		border-color: var(--color-red-700);
		background-color: var(--color-red-900);
		color: var(--color-red-200);
	}

	.spinner {
		animation: spin 0.8s linear infinite;
		border: 3px solid var(--color-neutral-200);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
	}

	:global(.dark) .spinner {
		border-color: var(--color-neutral-700);
		border-top-color: var(--color-primary-400);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
