# 🎨 Téma Rendszer - Gyors Áttekintés

## ✅ Elkészült Funkciók

A témakezelő rendszer **teljesen működőképes** és azonnal használható az alkalmazásban.

### Fő Komponensek

1. **ThemeManager Store** (`src/lib/stores/themeStore.svelte.ts`)
   - Központi témakezelő osztály
   - Svelte 5 runes alapú reaktivitás
   - Automatikus localStorage mentés
   - Auto mód rendszer téma követéssel

2. **Típusok** (`src/lib/types/theme.ts`)
   - `ThemeMode`: 'light' | 'dark' | 'auto'
   - `ColorScheme`: 'blue' | 'green' | 'purple' | 'orange' | 'red'
   - `ThemeSettings`: teljes beállítások interface

3. **Desktop Integráció** (`src/lib/components/core/Desktop.svelte`)
   - ThemeManager automatikusan létrejön és kontextusba kerül
   - CSS osztályok és változók automatikusan alkalmazódnak
   - Dark mode, színsémák, betűméret, animációk kezelése

4. **Kész Komponensek**
   - `ThemeSettings.svelte` - Teljes beállítások panel
   - `ThemeToggle.svelte` - Egyszerű téma váltó gomb
   - `ColorSchemePicker.svelte` - Színséma választó

## 🚀 Gyors Használat

### 1. Téma váltás bárhonnan

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib';
	const theme = getThemeManager();
</script>

<button onclick={() => theme.setMode('dark')}>Sötét mód</button>
```

### 2. Kész komponensek használata

```svelte
<script>
	import { ThemeToggle, ColorSchemePicker, ThemeSettings } from '$lib';
</script>

<!-- Egyszerű váltó gomb -->
<ThemeToggle />

<!-- Színséma választó -->
<ColorSchemePicker />

<!-- Teljes beállítások panel -->
<ThemeSettings />
```

### 3. Dark mode stílusok

```svelte
<style>
	.my-element {
		background: white;
		color: black;
	}
	
	:global(#desktop.dark) .my-element {
		background: #1f2937;
		color: white;
	}
</style>
```

### 4. CSS változók használata

```svelte
<style>
	.button {
		background: var(--color-primary);
		color: white;
	}
	
	.button:hover {
		background: var(--color-primary-hover);
	}
</style>
```

## 📦 Elérhető Funkciók

### ThemeManager Metódusok

```typescript
theme.setMode('dark' | 'light' | 'auto')
theme.setColorScheme('blue' | 'green' | 'purple' | 'orange' | 'red')
theme.setFontSize('small' | 'medium' | 'large')
theme.setAnimations(true | false)
theme.updateSettings({ mode: 'dark', colorScheme: 'purple' })
```

### ThemeManager Tulajdonságok

```typescript
theme.settings          // Aktuális beállítások
theme.effectiveMode     // 'light' vagy 'dark' (auto esetén a rendszer alapján)
theme.isDark            // boolean
theme.isLight           // boolean
theme.cssClasses        // "dark scheme-blue font-medium"
theme.cssVariables      // { '--color-primary': '#3b82f6', ... }
```

### CSS Változók

```css
--color-primary         /* Fő szín */
--color-primary-hover   /* Hover állapot */
--color-primary-light   /* Világos változat */
--color-accent          /* Kiemelő szín */
--base-font-size        /* Betűméret (14px/16px/18px) */
```

### CSS Osztályok

```css
.dark                   /* Sötét mód */
.light                  /* Világos mód */
.scheme-blue            /* Kék színséma */
.scheme-green           /* Zöld színséma */
.scheme-purple          /* Lila színséma */
.scheme-orange          /* Narancs színséma */
.scheme-red             /* Piros színséma */
.font-small             /* Kicsi betű */
.font-medium            /* Közepes betű */
.font-large             /* Nagy betű */
.no-animations          /* Animációk kikapcsolva */
```

## 📚 Dokumentáció

- **THEME_SYSTEM.md** - Részletes technikai dokumentáció
- **THEME_USAGE_EXAMPLE.md** - 10+ használati példa
- **README_THEME.md** - Ez a fájl (gyors áttekintés)

## 🎯 Következő Lépések

### Azonnal használható:

1. **Taskbar-ba téma váltó gomb**
   ```svelte
   <script>
   	import { ThemeToggle } from '$lib';
   </script>
   <ThemeToggle />
   ```

2. **Beállítások ablak létrehozása**
   - Hozz létre egy új app-ot `src/lib/apps/Settings/`
   - Használd a `ThemeSettings` komponenst

3. **Meglévő komponensek frissítése**
   - Add hozzá a dark mode stílusokat
   - Használd a CSS változókat a színekhez

### Bővítési lehetőségek:

- További színsémák hozzáadása
- Egyedi színek beállítása
- Téma profilok mentése
- Import/export funkció
- Előnézet mód

## ✨ Előnyök

- ✅ **Központi kezelés** - Egy helyről minden beállítás
- ✅ **Reaktív** - Automatikus frissítés minden komponensben
- ✅ **Perzisztens** - LocalStorage mentés
- ✅ **Típusbiztos** - TypeScript támogatás
- ✅ **Egyszerű API** - Könnyen használható
- ✅ **Kész komponensek** - Azonnal használható UI elemek
- ✅ **Auto mód** - Követi a rendszer beállítást
- ✅ **Bővíthető** - Könnyen hozzáadhatók új funkciók

## 🔧 Technikai Részletek

- **Svelte 5 runes** - Modern reaktivitás
- **Context API** - Komponensek közötti megosztás
- **Singleton pattern** - Egy példány az egész alkalmazásban
- **CSS változók** - Dinamikus stílusok
- **LocalStorage** - Beállítások mentése
- **MediaQuery** - Rendszer téma figyelése

## 🎨 Példa Integráció

```svelte
<!-- src/lib/apps/Settings/index.svelte -->
<script lang="ts">
	import { ThemeSettings } from '$lib';
</script>

<div class="settings-app">
	<h1>Beállítások</h1>
	<ThemeSettings />
</div>

<style>
	.settings-app {
		padding: 20px;
	}
	
	:global(#desktop.dark) .settings-app {
		color: white;
	}
</style>
```

## 📝 Megjegyzések

- A rendszer **azonnal működik** az alkalmazás indításakor
- **Nincs szükség** további konfigurációra
- A beállítások **automatikusan mentődnek**
- **Minden komponens** hozzáfér a ThemeManager-hez
- A **Desktop komponens** automatikusan alkalmazza a témát

---

**Kész vagy a használatra! 🎉**

Importáld a szükséges komponenseket és kezdd el használni a témakezelő rendszert!
