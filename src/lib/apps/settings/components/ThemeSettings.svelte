<script lang="ts">
	import CustomCombobox from '$lib/components/CustomCombobox.svelte';

	const themeOptions = [
		{ value: 'dark', label: 'Sötét' },
		{ value: 'light', label: 'Világos' },
		{ value: 'auto', label: 'Automatikus' }
	];

	let selectedTheme = $state<string | undefined>('dark');

	function handleThemeChange(value: string | undefined) {
		console.log('Téma változott:', value);
		selectedTheme = value;
		// Itt kezelheted a téma váltást
	}
</script>

<div class="theme-settings">
	<h3>Téma beállítások</h3>
	<CustomCombobox
		items={themeOptions}
		bind:value={selectedTheme}
		placeholder="Válassz témát..."
		name="theme-selector"
		ariaLabel="Téma választása"
		onChange={handleThemeChange}
		disabled={false}
	/>
	<p>Kiválasztott téma: {selectedTheme ?? 'nincs'}</p>
</div>

<style>
	.theme-settings {
		padding: 20px;
	}

	h3 {
		margin-bottom: 16px;
		color: var(--panel-text-color);
		font-weight: 600;
		font-size: 1.125rem;
	}

	p {
		margin-top: 12px;
		color: var(--neutral-600);
		font-size: 0.875rem;
	}

	:global(.dark) p {
		color: var(--neutral-400);
	}
</style>
