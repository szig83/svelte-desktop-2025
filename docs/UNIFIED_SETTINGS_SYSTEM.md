# Egységes Beállítás-kezelési Rendszer

## Áttekintés

Az alkalmazás egy egységes cookie-alapú beállítás-kezelési rendszert használ, amely biztosítja a szerver és kliens közötti szinkronizációt.

## Architektúra

### 1. Tárolás: Cookie-alapú

Minden felhasználói beállítás (téma, teljesítmény, stb.) egy `app.user_settings` nevű cookie-ban tárolódik:

```typescript
cookies.set('app.user_settings', JSON.stringify(settings), {
  path: '/',
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 365 // 1 év
});
```

### 2. Szerver oldal: hooks.server.ts

A szerver minden kérésnél betölti a beállításokat a cookie-ból:

```typescript
const savedSettings = event.cookies.get('app.user_settings');
event.locals.settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
```

Az effektív téma mód (dark/light) már az SSR során beillesztésre kerül a HTML-be:

```typescript
let effectiveMode = event.locals.settings.theme.mode;
if (effectiveMode === 'auto') {
  effectiveMode = 'dark'; // SSR fallback
}
html.replace('#class-placeholder#', effectiveMode);
```

### 3. Kliens oldal: ThemeManager

A `ThemeManager` inicializálása a layout-ban történik a szerver beállításokkal:

```typescript
// Csak kliens oldalon, közvetlenül (NEM $effect-ben)
if (browser) {
  const themeManager = createThemeManager(data.settings.theme);

  // Beállítjuk a mentési callback-et, ami cookie-ba menti
  themeManager.setSaveCallback(async (themeSettings) => {
    await updateSettings({ theme: themeSettings });
  });
}
```

**Fontos**:

- A ThemeManager csak kliens oldalon inicializálódik (`if (browser)`)
- Közvetlenül a script szinten, NEM `$effect`-ben (hogy elkerüljük a context hibákat)
- Globális singleton pattern - nincs szükség context-re
- SSR során a Desktop komponens közvetlenül a `settings` context-et használja

### 4. Beállítások frissítése

Minden beállítás módosítás a `settings.remote.ts` API-n keresztül történik:

```typescript
await updateSettings({
  theme: {
    mode: 'dark',
    colorPrimaryHue: '225'
  }
});
```

Az API:

1. Frissíti a `locals.settings` objektumot
2. Elmenti a cookie-ba
3. A kliens `invalidate('app:settings')` hívással újratölti az oldalt

## Adatfolyam

```
Felhasználó módosít beállítást
    ↓
ThemeManager.setMode() / setColor() stb.
    ↓
saveCallback() → updateSettings() API hívás
    ↓
Szerver frissíti locals.settings és cookie-t
    ↓
invalidate('app:settings') → oldal újratöltése
    ↓
Layout újratölti data.settings-et a szerverről
    ↓
ThemeManager reaktívan frissül
    ↓
UI automatikusan frissül
```

## Előnyök

1. **SSR kompatibilis**: A szerver már az első rendereléskor ismeri a beállításokat
2. **Egységes**: Minden beállítás ugyanúgy működik (téma, teljesítmény, stb.)
3. **Szinkronizált**: F5 után is megmaradnak a beállítások
4. **Adatbázis-ready**: Később könnyen átállítható adatbázisra
5. **Biztonságos**: HttpOnly cookie-k használata

## Jövőbeli fejlesztés: Adatbázis integráció

A rendszer könnyen bővíthető adatbázis támogatással:

```typescript
// hooks.server.ts
if (session?.user) {
  // Betöltés adatbázisból
  const dbSettings = await db.query.userSettings.findFirst({
    where: eq(userSettings.userId, session.user.id)
  });

  if (dbSettings) {
    event.locals.settings = dbSettings;
  } else {
    // Fallback cookie-ra
    event.locals.settings = cookieSettings;
  }
}
```

```typescript
// settings.remote.ts
if (locals.user) {
  // Mentés adatbázisba
  await db.update(userSettings)
    .set(updates)
    .where(eq(userSettings.userId, locals.user.id));
}
// Továbbra is mentjük cookie-ba fallback-ként
cookies.set('app.user_settings', ...);
```

## Használat komponensekben

### Téma beállítások módosítása

```typescript
import { getThemeManager } from '$lib/stores';

const theme = getThemeManager();

// Mód váltása
await theme.setMode('dark');

// Szín váltása
await theme.setColor('225');

// Betűméret váltása
await theme.setFontSize('large');
```

### Teljesítmény beállítások módosítása

```typescript
import { updateSettings } from '$lib/apps/settings/settings.remote';

await updateSettings({
  preferPerformance: true,
  windowPreview: false
});
```

## Fontos megjegyzések

- A `ThemeManager` **globális singleton** pattern-t használ (nincs Svelte context)
- A layout-ban inicializálódik a szerver beállításokkal **csak kliens oldalon** (`if (browser)`)
- Közvetlenül a script szinten inicializálódik, NEM `$effect`-ben
- SSR során a Desktop komponens közvetlenül a `settings` context-et használja
- A Desktop komponens `$derived` segítségével váltogat SSR és kliens mód között
- Minden módosítás async és automatikusan szinkronizál

## SSR és Kliens oldali renderelés

A rendszer támogatja mind az SSR-t, mind a kliens oldali renderelést:

### SSR (Server-Side Rendering)

- A `hooks.server.ts` beilleszti a téma osztályt a HTML-be (`#class-placeholder#`)
- A Desktop komponens a `settings` context-ből számítja ki a CSS osztályokat
- Fallback: `auto` mód esetén `dark` témát használ

### Kliens oldal

- A ThemeManager inicializálódik a layout-ban
- A Desktop komponens a ThemeManager-t használja a CSS osztályok generálásához
- Reaktív frissítések a `$derived` és `$effect` segítségével

### SSR-kompatibilis komponens minta

**Fontos**: Minden komponens, ami a `ThemeManager`-t használja, csak kliens oldalon renderelődik (`{#if browser}`), hogy elkerülje az SSR hibákat.

Példa komponensek:

- `ThemeSwitcher.svelte`
- `ColorSchemePicker.svelte`

Minta kód:

```svelte
<script lang="ts">
	import { getThemeManager } from '$lib/stores';
	import { browser } from '$app/environment';

	let theme = $state<ReturnType<typeof getThemeManager> | null>(null);

	$effect(() => {
		if (browser) {
			theme = getThemeManager();
		}
	});

	// Használd a theme-et null-check-kel vagy derived értékekkel
	const isDark = $derived(theme?.isDark ?? false);
</script>

{#if browser && theme}
	<!-- Komponens tartalma -->
	<button onclick={() => theme.setMode('dark')}> Dark Mode </button>
{/if}
```

**Miért szükséges ez?**

- SSR során a `ThemeManager` még nem létezik (csak kliens oldalon inicializálódik)
- A `getThemeManager()` hívás SSR-ben hibát okozna
- A `{#if browser}` biztosítja, hogy a komponens csak kliens oldalon renderelődjön
