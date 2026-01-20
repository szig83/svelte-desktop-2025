<script lang="ts">
	import ColorSchemePicker from '$lib/components/ui/ColorSchemePicker.svelte';

	interface Props {
		defaultTab?: string;
	}

	let { defaultTab = 'colors' }: Props = $props();
	let activeTab = $state(defaultTab);
</script>

<div class="appearance-settings">
	<h2>Megjelenés beállítások</h2>

	<div class="tabs">
		<button class:active={activeTab === 'colors'} onclick={() => (activeTab = 'colors')}>
			Színek
		</button>
		<button class:active={activeTab === 'theme'} onclick={() => (activeTab = 'theme')}>
			Téma
		</button>
	</div>

	<div class="tab-content">
		{#if activeTab === 'colors'}
			<ColorSchemePicker />
		{:else if activeTab === 'theme'}
			<div class="theme-placeholder">
				<p>Téma beállítások hamarosan...</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.appearance-settings {
		width: 100%;
	}

	h2 {
		margin-bottom: 1.5rem;
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 1.5rem;
	}

	:global(.dark) h2 {
		color: var(--color-neutral-100);
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-neutral-200);
	}

	:global(.dark) .tabs {
		border-bottom-color: var(--color-neutral-700);
	}

	.tabs button {
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		padding: 0.5rem 1rem;
		color: var(--color-neutral-600);
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(.dark) .tabs button {
		color: var(--color-neutral-400);
	}

	.tabs button:hover {
		color: var(--color-neutral-900);
	}

	:global(.dark) .tabs button:hover {
		color: var(--color-neutral-200);
	}

	.tabs button.active {
		border-bottom-color: var(--color-primary-500);
		color: var(--color-primary-600);
	}

	:global(.dark) .tabs button.active {
		border-bottom-color: var(--color-primary-400);
		color: var(--color-primary-400);
	}

	.tab-content {
		margin-top: 1rem;
	}

	.theme-placeholder {
		padding: 2rem;
		color: var(--color-neutral-500);
		text-align: center;
	}
</style>
