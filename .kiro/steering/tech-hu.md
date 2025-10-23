# Technológiai Stack

## Alap Keretrendszer

- **SvelteKit**: Teljes stack webes keretrendszer SSR/SPA képességekkel
- **Svelte 5**: Komponens keretrendszer rune-okkal a reaktivitáshoz
- **TypeScript**: Típusbiztos JavaScript fejlesztés
- **Vite**: Build eszköz és fejlesztői szerver

## Csomagkezelő

- **Bun**: Elsődleges csomagkezelő (packageManager mezőben megadva)
- Node.js 20+ szükséges

## Stílus & UI

- **TailwindCSS 4**: Utility-first CSS keretrendszer Vite pluginnal
- **bits-ui**: Headless UI komponensek Svelte-hez
- **Tailwind Variants**: Komponens variáns rendszer
- **Lucide/Phosphor**: Ikon könyvtárak
- **CSS Animációk**: tailwindcss-animate, tw-animate-css

## Adatbázis & ORM

- **PostgreSQL**: Elsődleges adatbázis
- **Drizzle ORM**: Típusbiztos SQL ORM migrációkkal
- **Drizzle Kit**: Séma kezelés és migrációk

## Hitelesítés

- **Better Auth**: Hitelesítési könyvtár felhasználókezeléshez

## Állapotkezelés

- **Svelte 5 Rune-ok**: Beépített reaktivitási rendszer ($state, $effect)
- Egyedi store-ok ablak és téma kezeléshez

## Fejlesztői Eszközök

- **ESLint**: Kód linting Svelte pluginnal
- **Prettier**: Kód formázás Svelte pluginnal
- **TypeScript**: Típus ellenőrzés svelte-check-kel

## Gyakori Parancsok

### Fejlesztés

```bash
bun dev                 # Fejlesztői szerver indítása
bun build              # Produkciós build készítése
bun preview            # Produkciós build előnézete
```

### Kód Minőség

```bash
bun check              # Típus ellenőrzés Svelte-tel
bun check:watch        # Típus ellenőrzés watch módban
bun lint               # Linting futtatása
bun format             # Kód formázása
```

### Adatbázis

```bash
bun db:generate        # Drizzle migrációk generálása
bun db:push            # Séma push az adatbázisba
bun db:migrate         # Migrációk futtatása
bun db:seed            # Adatbázis feltöltése teszt adatokkal
```

## Konfigurációs Fájlok

- `svelte.config.js`: SvelteKit konfiguráció kísérleti funkciókkal
- `vite.config.ts`: Vite build konfiguráció
- `drizzle.config.ts`: Adatbázis séma és migráció beállítások
- `tsconfig.json`: TypeScript fordító opciók
