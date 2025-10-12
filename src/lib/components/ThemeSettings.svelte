<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	import type { ThemeMode, ColorScheme } from '$lib/types/theme';

	const themeManager = getThemeManager();

	const themeModes: { value: ThemeMode; label: string }[] = [
		{ value: 'light', label: 'Világos' },
		{ value: 'dark', label: 'Sötét' },
		{ value: 'auto', label: 'Automatikus' }
	];

	const colorSchemes: { value: ColorScheme; label: string }[] = [
		{ value: 'blue', label: 'Kék' },
		{ value: 'green', label: 'Zöld' },
		{ value: 'purple', label: 'Lila' },
		{ value: 'orange', label: 'Narancs' },
		{ value: 'red', label: 'Piros' }
	];

	const fontSizes: { value: 'small' | 'medium' | 'large'; label: string }[] = [
		{ value: 'small', label: 'Kicsi' },
		{ value: 'medium', label: 'Közepes' },
		{ value: 'large', label: 'Nagy' }
	];
</script>

<div class="theme-settings">
	<h2>Téma beállítások</h2>

	<!-- Téma mód -->
	<div class="setting-group">
		<label>Téma mód:</label>
		<div class="button-group">
			{#each themeModes as mode}
				<button
					class:active={themeManager.settings.mode === mode.value}
					onclick={() => themeManager.setMode(mode.value)}
				>
					{mode.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Színséma -->
	<div class="setting-group">
		<label>Színséma:</label>
		<div class="color-scheme-grid">
			{#each colorSchemes as scheme}
				<button
					class="color-scheme-button"
					class:active={themeManager.settings.colorScheme === scheme.value}
					onclick={() => themeManager.setColorScheme(scheme.value)}
					style="--scheme-color: var(--color-primary, {themeManager.settings.colorScheme === scheme.value ? 'var(--color-primary)' : '#ccc'})"
				>
					<span class="color-preview scheme-{scheme.value}"></span>
					<span>{scheme.label}</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Betűméret -->
	<div class="setting-group">
		<label>Betűméret:</label>
		<div class="button-group">
			{#each fontSizes as size}
				<button
					class:active={themeManager.settings.fontSize === size.value}
					onclick={() => themeManager.setFontSize(size.value)}
				>
					{size.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Animációk -->
	<div class="setting-group">
		<label>
			<input
				type="checkbox"
				checked={themeManager.settings.animations}
				onchange={(e) => themeManager.setAnimations(e.currentTarget.checked)}
			/>
			Animációk engedélyezése
		</label>
	</div>

	<!-- Aktuális beállítások -->
	<div class="current-settings">
		<h3>Aktuális beállítások:</h3>
		<ul>
			<li>Effektív mód: <strong>{themeManager.effectiveMode}</strong></li>
			<li>Sötét mód: <strong>{themeManager.isDark ? 'Igen' : 'Nem'}</strong></li>
			<li>Színséma: <strong>{themeManager.settings.colorScheme}</strong></li>
			<li>CSS osztályok: <code>{themeManager.cssClasses}</code></li>
		</ul>
	</div>
</div>

<style>
	.theme-settings {
		padding: 20px;
		max-width: 600px;
	}

	h2 {
		margin-top: 0;
		margin-bottom: 20px;
		font-size: 1.5em;
	}

	h3 {
		margin-top: 20px;
		margin-bottom: 10px;
		font-size: 1.2em;
	}

	.setting-group {
		margin-bottom: 20px;
	}

	.setting-group > label {
		display: block;
		margin-bottom: 8px;
		font-weight: 600;
	}

	.button-group {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.button-group button {
		padding: 8px 16px;
		border: 2px solid #d1d5db;
		background: white;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.9em;
	}

	.button-group button:hover {
		border-color: var(--color-primary, #3b82f6);
		background: var(--color-primary-light, #dbeafe);
	}

	.button-group button.active {
		border-color: var(--color-primary, #3b82f6);
		background: var(--color-primary, #3b82f6);
		color: white;
		font-weight: 600;
	}

	.color-scheme-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 10px;
	}

	.color-scheme-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 12px;
		border: 2px solid #d1d5db;
		background: white;
		border-radius: 8px;
		cursor: pointer;
		transition: all 0.2s;
	}

	.color-scheme-button:hover {
		border-color: #9ca3af;
		transform: translateY(-2px);
	}

	.color-scheme-button.active {
		border-color: var(--color-primary, #3b82f6);
		background: var(--color-primary-light, #dbeafe);
		font-weight: 600;
	}

	.color-preview {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		border: 2px solid #e5e7eb;
	}

	.color-preview.scheme-blue {
		background: #3b82f6;
	}
	.color-preview.scheme-green {
		background: #10b981;
	}
	.color-preview.scheme-purple {
		background: #8b5cf6;
	}
	.color-preview.scheme-orange {
		background: #f97316;
	}
	.color-preview.scheme-red {
		background: #ef4444;
	}

	.current-settings {
		margin-top: 30px;
		padding: 15px;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.current-settings ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.current-settings li {
		padding: 6px 0;
		border-bottom: 1px solid #e5e7eb;
	}

	.current-settings li:last-child {
		border-bottom: none;
	}

	code {
		background: #e5e7eb;
		padding: 2px 6px;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.9em;
	}

	/* Dark mode támogatás */
	:global(#desktop.dark) .theme-settings {
		color: #f9fafb;
	}

	:global(#desktop.dark) .button-group button {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(#desktop.dark) .button-group button:hover {
		background: #4b5563;
	}

	:global(#desktop.dark) .color-scheme-button {
		background: #374151;
		border-color: #4b5563;
		color: #f9fafb;
	}

	:global(#desktop.dark) .color-scheme-button:hover {
		border-color: #6b7280;
	}

	:global(#desktop.dark) .current-settings {
		background: #374151;
		border-color: #4b5563;
	}

	:global(#desktop.dark) .current-settings li {
		border-color: #4b5563;
	}

	:global(#desktop.dark) code {
		background: #4b5563;
		color: #f9fafb;
	}
</style>
