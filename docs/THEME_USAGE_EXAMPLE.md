# Téma Rendszer - Gyors Használati Példák

## 1. Egyszerű téma váltó gomb

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();
</script>

<button onclick={() => theme.setMode(theme.isDark ? 'light' : 'dark')}>
	{theme.isDark ? '☀️ Világos' : '🌙 Sötét'}
</button>
```

## 2. Színséma választó

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();
	const colors = ['blue', 'green', 'purple', 'orange', 'red'] as const;
</script>

<div class="color-picker">
	{#each colors as color}
		<button
			class:active={theme.settings.colorScheme === color}
			onclick={() => theme.setColorScheme(color)}
		>
			{color}
		</button>
	{/each}
</div>
```

## 3. Komponens dark mode stílusokkal

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();
</script>

<div class="card">
	<h2>Kártya címe</h2>
	<p>Tartalom...</p>
</div>

<style>
	.card {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		background: white;
		padding: 20px;
		color: #1f2937;
	}

	/* Dark mode */
	:global(#desktop.dark) .card {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		background: #374151;
		color: #f9fafb;
	}
</style>
```

## 4. CSS változók használata

```svelte
<button class="primary-button"> Kattints ide </button>

<style>
	.primary-button {
		transition: background 0.2s;
		cursor: pointer;
		border: none;
		border-radius: 6px;
		background: var(--color-primary);
		padding: 10px 20px;
		color: white;
	}

	.primary-button:hover {
		background: var(--color-primary-hover);
	}
</style>
```

## 5. Teljes beállítások panel

```svelte
<script lang="ts">
	import ThemeSettings from '$lib/components/ThemeSettings.svelte';
</script>

<!-- Ez egy kész komponens minden beállítással -->
<ThemeSettings />
```

## 6. Reaktív stílusok

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();

	// Automatikusan frissül amikor a téma változik
	$: bgColor = theme.isDark ? '#1f2937' : '#ffffff';
	$: textColor = theme.isDark ? '#f9fafb' : '#1f2937';
</script>

<div style="background: {bgColor}; color: {textColor}">
	Ez a tartalom automatikusan alkalmazkodik a témához
</div>
```

## 7. Beállítások mentése és betöltése

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();

	// A beállítások automatikusan mentődnek localStorage-ba
	// Nem kell manuálisan kezelni!

	function applyCustomTheme() {
		theme.updateSettings({
			mode: 'dark',
			colorScheme: 'purple',
			fontSize: 'large',
			animations: true
		});
	}
</script>

<button onclick={applyCustomTheme}> Egyedi téma alkalmazása </button>
```

## 8. Feltételes renderelés téma alapján

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();
</script>

{#if theme.isDark}
	<img src="/logo-dark.svg" alt="Logo" />
{:else}
	<img src="/logo-light.svg" alt="Logo" />
{/if}
```

## 9. Animációk kezelése

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';

	const theme = getThemeManager();
</script>

<div class="animated-box">Animált tartalom</div>

<style>
	.animated-box {
		transition: transform 0.3s ease;
	}

	.animated-box:hover {
		transform: scale(1.05);
	}

	/* Ha az animációk ki vannak kapcsolva, ez automatikusan érvényesül */
	:global(#desktop.no-animations) .animated-box {
		transition: none;
	}
</style>
```

## 10. Színséma specifikus stílusok

```svelte
<div class="themed-element">Színséma alapú elem</div>

<style>
	.themed-element {
		border: 2px solid var(--color-primary);
		padding: 10px;
	}

	/* Specifikus színsémák */
	:global(#desktop.scheme-blue) .themed-element {
		background: #dbeafe;
	}

	:global(#desktop.scheme-green) .themed-element {
		background: #d1fae5;
	}

	:global(#desktop.scheme-purple) .themed-element {
		background: #ede9fe;
	}
</style>
```

## Tippek

1. **Használd a CSS változókat** - Így a színek automatikusan követik a színsémát
2. **`:global(#desktop.dark)` használata** - Így biztosítod, hogy a dark mode stílusok csak akkor érvényesüljenek, amikor aktív
3. **Reaktív változók** - Használj `$:` jelölést, hogy a komponens automatikusan frissüljön
4. **ThemeSettings komponens** - Ha gyorsan kell egy beállítások panel, használd a kész komponenst
5. **LocalStorage** - A beállítások automatikusan mentődnek, nem kell külön kezelni

## Hibakeresés

Ha nem működik a téma:

1. Ellenőrizd, hogy a `Desktop.svelte` komponens létrehozza-e a `ThemeManager`-t
2. Nézd meg a böngésző konzolját hibákért
3. Ellenőrizd, hogy a CSS osztályok helyesen vannak-e alkalmazva az elemekre
4. Használd a böngésző DevTools-t, hogy megnézd a CSS változókat
