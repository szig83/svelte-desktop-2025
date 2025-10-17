# Téma Rendszer Dokumentáció

## Áttekintés

Az alkalmazás egy központi témakezelő rendszert használ, amely lehetővé teszi a design beállítások (sötét/világos mód, színséma, betűméret, stb.) dinamikus módosítását az alkalmazás bármely pontjáról.

## Komponensek

### 1. ThemeManager Store (`/src/lib/stores/themeStore.svelte.ts`)

A központi témakezelő osztály, amely Svelte 5 runes-t használ a reaktivitáshoz.

#### Funkciók:

- **`setMode(mode: ThemeMode)`** - Téma mód beállítása ('light', 'dark', 'auto')
- **`setColorScheme(scheme: ColorScheme)`** - Színséma beállítása ('blue', 'green', 'purple', 'orange', 'red')
- **`setFontSize(size)`** - Betűméret beállítása ('small', 'medium', 'large')
- **`setAnimations(enabled: boolean)`** - Animációk be/kikapcsolása
- **`updateSettings(newSettings)`** - Több beállítás egyszerre történő frissítése

#### Computed tulajdonságok:

- **`effectiveMode`** - Az aktuális effektív téma mód (auto esetén a rendszer beállítás alapján)
- **`isDark`** - Boolean, hogy sötét mód aktív-e
- **`isLight`** - Boolean, hogy világos mód aktív-e
- **`cssClasses`** - CSS osztályok string formában a layout számára
- **`cssVariables`** - CSS változók objektum formában

#### Automatikus funkciók:

- LocalStorage-ba menti a beállításokat
- Auto mód esetén figyeli a rendszer téma változásokat
- Automatikusan alkalmazza a változásokat a layout-ra

## Használat

### 1. ThemeManager elérése komponensből

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	
	const themeManager = getThemeManager();
</script>

<!-- Téma mód váltása -->
<button onclick={() => themeManager.setMode('dark')}>
	Sötét mód
</button>

<!-- Színséma váltása -->
<button onclick={() => themeManager.setColorScheme('purple')}>
	Lila színséma
</button>

<!-- Aktuális beállítások olvasása -->
<div>
	Aktuális mód: {themeManager.effectiveMode}
	Sötét mód: {themeManager.isDark ? 'Igen' : 'Nem'}
</div>
```

### 2. CSS változók használata

A ThemeManager automatikusan beállítja a következő CSS változókat:

```css
/* Színséma változók */
--color-primary: #3b82f6;
--color-primary-hover: #2563eb;
--color-primary-light: #dbeafe;
--color-accent: #60a5fa;

/* Betűméret változó */
--base-font-size: 16px;
```

Használat komponensben:

```svelte
<style>
	.my-button {
		background: var(--color-primary);
		color: white;
		font-size: var(--base-font-size);
	}
	
	.my-button:hover {
		background: var(--color-primary-hover);
	}
</style>
```

### 3. Dark mode stílusok

A Desktop komponens automatikusan alkalmazza a `.dark` osztályt sötét módban:

```svelte
<style>
	.my-component {
		background: white;
		color: black;
	}
	
	/* Sötét mód stílusok */
	:global(#desktop.dark) .my-component {
		background: #1f2937;
		color: white;
	}
</style>
```

### 4. Színséma specifikus stílusok

```svelte
<style>
	/* Kék színséma */
	:global(#desktop.scheme-blue) .my-element {
		border-color: #3b82f6;
	}
	
	/* Zöld színséma */
	:global(#desktop.scheme-green) .my-element {
		border-color: #10b981;
	}
</style>
```

### 5. Példa komponens használata

Az alkalmazás tartalmaz egy kész `ThemeSettings` komponenst, amely teljes UI-t biztosít a téma beállításokhoz:

```svelte
<script>
	import ThemeSettings from '$lib/components/ThemeSettings.svelte';
</script>

<ThemeSettings />
```

## Típusok

### ThemeMode
```typescript
type ThemeMode = 'light' | 'dark' | 'auto';
```

### ColorScheme
```typescript
type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';
```

### ThemeSettings
```typescript
interface ThemeSettings {
	mode: ThemeMode;
	colorScheme: ColorScheme;
	fontSize?: 'small' | 'medium' | 'large';
	animations?: boolean;
}
```

## Bővítés

### Új színséma hozzáadása

1. Bővítsd a `ColorScheme` típust a `/src/lib/types/theme.ts` fájlban
2. Add hozzá az új színeket a `getSchemeColors()` metódushoz a `themeStore.svelte.ts` fájlban
3. Frissítsd a `ThemeSettings.svelte` komponenst az új opcióval

### Új beállítás hozzáadása

1. Bővítsd a `ThemeSettings` interface-t
2. Add hozzá az új setter metódust a `ThemeManager` osztályhoz
3. Frissítsd a `cssClasses` vagy `cssVariables` getter-t szükség szerint
4. Frissítsd a `DEFAULT_THEME_SETTINGS` objektumot

## Megjegyzések

- A beállítások automatikusan mentődnek a localStorage-ba
- Auto mód esetén a rendszer téma preferenciáját követi
- A téma változások reaktívak, minden komponens automatikusan frissül
- A ThemeManager singleton pattern-t használ, így az egész alkalmazásban ugyanaz a példány érhető el
- A kontextus rendszer lehetővé teszi, hogy komponensek bárhonnan hozzáférjenek a ThemeManager-hez

## Példa használati esetek

### 1. Téma váltó gomb a taskbar-ban

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	
	const themeManager = getThemeManager();
	
	function toggleTheme() {
		const newMode = themeManager.isDark ? 'light' : 'dark';
		themeManager.setMode(newMode);
	}
</script>

<button onclick={toggleTheme}>
	{themeManager.isDark ? '☀️' : '🌙'}
</button>
```

### 2. Beállítások ablak

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	import ThemeSettings from '$lib/components/ThemeSettings.svelte';
	
	const themeManager = getThemeManager();
</script>

<div class="settings-window">
	<h1>Beállítások</h1>
	<ThemeSettings />
</div>
```

### 3. Komponens amely reagál a téma változásokra

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	
	const themeManager = getThemeManager();
	
	// A komponens automatikusan újrarenderelődik amikor a téma változik
	$: backgroundColor = themeManager.isDark ? '#1f2937' : '#ffffff';
</script>

<div style="background-color: {backgroundColor}">
	Tartalom
</div>
```
