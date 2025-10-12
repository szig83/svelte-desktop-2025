<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();

	function toggleTheme() {
		theme.setMode(theme.isDark ? 'light' : 'dark');
	}
</script>

<button class="theme-toggle" onclick={toggleTheme} title="Téma váltás">
	{#if theme.isDark}
		<span class="icon">☀️</span>
		<span class="label">Világos</span>
	{:else}
		<span class="icon">🌙</span>
		<span class="label">Sötét</span>
	{/if}
</button>

<style>
	.theme-toggle {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		border: 2px solid #d1d5db;
		background: white;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 14px;
		font-weight: 500;
	}

	.theme-toggle:hover {
		border-color: var(--color-primary, #3b82f6);
		background: var(--color-primary-light, #dbeafe);
		transform: translateY(-1px);
	}

	.theme-toggle:active {
		transform: translateY(0);
	}

	.icon {
		font-size: 18px;
		line-height: 1;
	}

	.label {
		line-height: 1;
	}

	/* Dark mode */
	:global(#desktop.dark) .theme-toggle {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(#desktop.dark) .theme-toggle:hover {
		background: #4b5563;
		border-color: var(--color-primary, #3b82f6);
	}
</style>
