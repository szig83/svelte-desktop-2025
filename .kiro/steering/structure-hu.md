# Projekt Struktúra

## Gyökér Szint

- `src/`: Fő alkalmazás forráskód
- `static/`: Statikus eszközök (ikonok, képek, videók)
- `docker/`: Docker konfiguráció és PostgreSQL beállítás
- `docs/`: Projekt dokumentáció
- Konfigurációs fájlok: `package.json`, `svelte.config.js`, `vite.config.ts`, `drizzle.config.ts`

## Forrás Struktúra (`src/`)

### Alap Alkalmazás

- `app.html`: HTML sablon
- `app.d.ts`: Globális típus definíciók
- `hooks.server.ts`: SvelteKit szerver hook-ok
- `routes/`: SvelteKit routing (oldalak és API végpontok)

### Könyvtár (`src/lib/`)

#### Komponensek (`src/lib/components/`)

- `core/`: Alap asztali környezet komponensek
  - `Desktop.svelte`: Fő asztali konténer
  - `Taskbar.svelte`: Alsó tálca
  - `startmenu/`: Start menü komponensek
  - `window/`: Ablakkezelő komponensek
- `ui/`: Újrafelhasználható UI komponensek (gombok, inputok, stb.)
- Önálló komponensek: `Clock.svelte`, `ThemeSwitcher.svelte`, stb.

#### Alkalmazások (`src/lib/apps/`)

Minden app a következő mintát követi:

```
src/lib/apps/[app-név]/
├── index.svelte     # Fő app komponens
└── icon.svg         # App ikon
```

Az appok dinamikusan töltődnek be az ablakkezelő által.

#### Adatbázis (`src/lib/server/database/`)

- `schemas/`: Drizzle ORM séma definíciók
  - `auth/`: Hitelesítéssel kapcsolatos táblák
  - `platform/`: Platform beállítások és felhasználói preferenciák
- `drizzle/`: Generált migrációk
- `seeds/`: Adatbázis feltöltő szkriptek
- `queries/`: Újrafelhasználható adatbázis lekérdezések
- `procedures/`: SQL tárolt eljárások

#### Állapotkezelés (`src/lib/stores/`)

- `windowStore.svelte.ts`: Ablakkezelés Svelte 5 rune-okkal
- `themeStore.svelte.ts`: Téma és megjelenés kezelése

#### Típusok (`src/lib/types/`)

- `window.ts`: Ablak és app kapcsolatos típusok
- `theme.ts`: Téma rendszer típusok
- `desktopEnviroment.ts`: Asztali környezet típusok
- `settings.ts`: Felhasználói beállítások típusok

#### Szolgáltatások (`src/lib/services/`)

- `appContext.ts`: Alkalmazás kontextus kezelés
- `apps.remote.ts`: Távoli app betöltő szolgáltatások

#### Segédprogramok (`src/lib/utils/`)

- `iconLoader.ts`: Dinamikus ikon betöltés
- `screenshot.ts`: Ablak képernyőkép funkció
- `utils.ts`: Általános segédfunkciók

## Főbb Minták

### App Fejlesztés

- Minden app egy önálló Svelte komponens a `src/lib/apps/[név]/` mappában
- Az appok paramétereket kapnak az ablakkezelőn keresztül
- Az appok lehetnek egy- vagy többpéldányosak a metaadatok alapján

### Adatbázis Séma Szervezés

- A sémák domain szerint vannak szervezve (auth, platform)
- Minden sémának saját mappája van a kapcsolódó táblákkal
- A seed-ek ugyanazt a struktúrát követik, mint a sémák

### Komponens Architektúra

- Az alap komponensek az asztali környezet funkcionalitását kezelik
- A UI komponensek újrafelhasználhatók az alkalmazásban
- A komponensek Svelte 5 rune-okat használnak a reaktivitáshoz

### Állapotkezelés

- Az ablak állapot a `WindowManager` osztályon keresztül van kezelve
- A téma állapot a `ThemeManager` osztályon keresztül van kezelve
- Mindkettő Svelte 5 `$state` rune-okat használ a reaktivitáshoz
