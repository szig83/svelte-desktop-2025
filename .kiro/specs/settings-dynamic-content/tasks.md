# App Dinamikus Tartalom Betöltési Rendszer - Feladatok

## 1. Közös Típusok Létrehozása

- [x] 1.1 Új `menu.ts` fájl létrehozása a types mappában
  - Fájl: `src/lib/types/menu.ts`
  - MenuItem interface definiálása
  - MenuItemClickEvent interface definiálása
  - JSDoc kommentek hozzáadása
  - Export-ok beállítása

## 2. AppContentArea Általános Komponens Implementálása

- [x] 2.1 AppContentArea.svelte komponens létrehozása a shared mappában
  - Fájl: `src/lib/components/shared/AppContentArea.svelte`
  - Props interface (appName, component, props)
  - Állapotkezelés ($state: loadedComponent, loading, error)
  - Dinamikus import logika implementálása app-specifikus mappából
  - $effect hook a komponens betöltéshez

- [x] 2.2 AppContentArea UI implementálása
  - Loading állapot megjelenítése (spinner animációval)
  - Error állapot megjelenítése
  - Placeholder megjelenítése
  - Dinamikus komponens renderelése (svelte:component)

- [x] 2.3 AppContentArea stílusok
  - Loading stílus (spinner animáció)
  - Error stílus (light/dark mode)
  - Placeholder stílus
  - Responsive layout

- [x] 2.4 AppContentArea export hozzáadása
  - Fájl: `src/lib/components/shared/index.ts`
  - AppContentArea export hozzáadása

## 3. AppSideBarMenu Komponens Módosítása

- [x] 3.1 MenuItem interface importálása
  - Import hozzáadása: `import type { MenuItem } from '$lib/types/menu'`
  - Meglévő inline interface eltávolítása

- [x] 3.2 Új props hozzáadása
  - activeHref prop (opcionális)
  - onItemClick callback prop (opcionális)

- [x] 3.3 Kattintás kezelés implementálása
  - handleClick függvény létrehozása
  - onclick eseménykezelő hozzáadása button és a elemekhez
  - event.preventDefault() hívás
  - onItemClick callback meghívása
  - Szülő és gyerek elemekre is

- [x] 3.4 Aktív állapot vizuális jelzése
  - class:active binding hozzáadása
  - Aktív állapot ellenőrzése (item.href === activeHref)
  - Szülő és gyerek elemekre

- [x] 3.5 Aktív menüpont stílusok
  - .menu-item.active stílus hozzáadása
  - Dark mode támogatás
  - Szülő és gyerek elemekre

## 4. Settings App Frissítése (Első Implementáció)

- [x] 4.1 Import-ok frissítése
  - MenuItem type import hozzáadása: `import type { MenuItem } from '$lib/types/menu'`
  - AppContentArea import hozzáadása a shared komponensekhez

- [x] 4.2 Állapotkezelés implementálása
  - activeMenuItem $state létrehozása
  - activeComponent $state létrehozása
  - componentProps $state létrehozása

- [x] 4.3 Menüpont kattintás kezelő függvény
  - handleMenuItemClick implementálása
  - Aktív állapot frissítése
  - Komponens és props beállítása

- [x] 4.4 Alapértelmezett menüpont logika
  - findDefaultMenuItem függvény implementálása
  - Első menüpont vagy első gyerek keresése (ami component-tel rendelkezik)
  - $effect hook az inicializáláshoz

- [x] 4.5 AppContentArea integráció
  - AppContentArea komponens hozzáadása a template-hez
  - Props átadása: appName="settings", activeComponent, componentProps
  - Meglévő .settings-content div cseréje

- [x] 4.6 AppSideBarMenu props átadása
  - activeHref prop átadása
  - onItemClick callback átadása

- [x] 4.7 Meglévő ColorSchemePicker eltávolítása
  - Statikus ColorSchemePicker törlése a template-ből
  - Import eltávolítása (ha már nincs használva)

## 5. Settings App Komponensek Létrehozása

- [x] 5.1 components mappa létrehozása
  - Mappa: `src/lib/apps/settings/components/`

- [x] 5.2 AppearanceSettings.svelte komponens
  - Props interface (defaultTab)
  - Tab állapotkezelés ($state)
  - ColorSchemePicker integráció (áthelyezés)
  - Tab navigáció UI
  - Stílusok (tabs, active state)

- [x] 5.3 GeneralSettings.svelte komponens
  - Alapvető struktúra
  - Placeholder tartalom
  - Stílusok

- [x] 5.4 PlaceholderSettings.svelte komponens
  - Props interface (title, message)
  - Általános placeholder UI
  - "Fejlesztés alatt" üzenet
  - Ikon megjelenítés
  - Stílusok

## 6. Menu.json Frissítése

- [x] 6.1 Megjelenés menüpont hozzáadása
  - label, href, icon beállítása
  - component: "AppearanceSettings"
  - props megadása (defaultTab)

- [x] 6.2 Általános menüpont hozzáadása
  - label, href, icon beállítása
  - component: "GeneralSettings"

- [x] 6.3 Meglévő menüpontok frissítése
  - component mező hozzáadása ahol szükséges
  - PlaceholderSettings használata fejlesztés alatt lévő funkciókhoz
  - href értékek egyediségének ellenőrzése

## 7. Import-ok és Export-ok Ellenőrzése

- [x] 7.1 menu.ts export ellenőrzése
  - Fájl: `src/lib/types/menu.ts`
  - MenuItem export ✓
  - MenuItemClickEvent export ✓
  - Linting hibák javítva (any → unknown, pontok hozzáadva)

- [x] 7.2 Shared components index.ts frissítése
  - Fájl: `src/lib/components/shared/index.ts`
  - AppContentArea export hozzáadása ✓

- [x] 7.3 Import-ok ellenőrzése
  - AppSideBarMenu: MenuItem import `$lib/types/menu`-ből ✓
  - Settings index.svelte: MenuItem import ✓
  - Settings index.svelte: AppContentArea import ✓

## 8. Stílusok Finomhangolása

- [x] 8.1 Settings app layout ellenőrzése
  - Flex layout működése ✓
  - ContentArea méretezése ✓
  - Scrollbar működése ✓
  - TypeScript hiba javítva (null → undefined)

- [x] 8.2 Dark mode tesztelése
  - Összes új stílus dark mode-ban ✓
  - Aktív menüpont dark mode-ban ✓
  - Error és loading állapotok ✓
  - Scrollbar CSS változók használata ✓
  - Aktív menüpont vizuális jelölése finomhangolva ✓

- [x] 8.3 Responsive viselkedés
  - Különböző ablakméreteken ✓
  - Minimális méret ellenőrzése (metadata.ts: 600x500) ✓

## 9. Error Handling Tesztelése

- [x] 9.1 Nem létező komponens betöltése
  - Error üzenet megjelenítése ✓
  - Konzol hibaüzenet ellenőrzése ✓

- [x] 9.2 Komponens betöltési hiba szimulálása
  - Try-catch működésének ellenőrzése ✓
  - Error state frissítése ✓

- [x] 9.3 Hiányzó props kezelése
  - Komponensek működése props nélkül ✓
  - Opcionális props alapértelmezett értékei ✓

## 10. Integrációs Tesztelés

- [x] 10.1 Teljes menü navigáció tesztelése
  - Minden menüpont kattintható ✓
  - Megfelelő komponens töltődik be ✓
  - Aktív állapot helyesen jelenik meg ✓

- [x] 10.2 Almenü működés tesztelése
  - Expand/collapse működik ✓
  - Gyerek elemek kattinthatók ✓
  - Aktív állapot gyerek elemeken ✓

- [x] 10.3 Komponens váltás tesztelése
  - Smooth átmenet komponensek között ✓
  - Nincs felesleges újratöltés ✓
  - Props megfelelően frissülnek ✓

- [x] 10.4 Alapértelmezett nézet tesztelése
  - App megnyitásakor alapértelmezett komponens jelenik meg ✓
  - Alapértelmezett menüpont aktív ✓

## 11. Teljesítmény Ellenőrzés

- [x] 11.1 Lazy loading működésének ellenőrzése
  - Komponensek csak kattintáskor töltődnek be ✓
  - Dinamikus import működik ✓

- [x] 11.2 Komponens cache működése
  - Ugyanaz a komponens nem töltődik újra ✓
  - Vite cache működése ✓

## 12. Dokumentáció

- [x] 12.1 Kód kommentek
  - Komplex logika magyarázata ✓
  - Props dokumentálása (JSDoc) ✓
  - Függvények dokumentálása ✓

- [x] 12.2 README frissítése (opcionális)
  - Spec dokumentumok elkészültek ✓

## 13. Cleanup és Refaktorálás

- [x] 13.1 Nem használt kód eltávolítása
  - Kommentált scrollToSection függvény eltávolítva ✓
  - ColorSchemePicker import eltávolítva ✓

- [x] 13.2 Kód formázás
  - Konzisztens kód stílus ✓

- [x] 13.3 TypeScript típusellenőrzés
  - Svelte 5 deprecation warning javítva (svelte:component → {@const}) ✓
  - Linting hibák javítva ✓

## 14. Véglegesítés és Dokumentáció

- [x] 14.1 Összes funkció működésének ellenőrzése
  - Manuális tesztelés settings app-ban ✓
  - Működik light és dark mode-ban ✓

- [x] 14.2 Újrafelhasználhatóság dokumentálása
  - Spec dokumentumok tartalmazzák ✓
  - Design.md részletezi más app-okhoz való használatot ✓

- [x] 14.3 Git commit előkészítése
  - Változások áttekintve ✓

## 15. Jövőbeli Bővítés Előkészítése (Opcionális)

- [ ] 15.1 Users app előkészítése (opcionális)
  - components mappa létrehozása
  - menu.json létrehozása
  - Ugyanaz a minta alkalmazása

- [ ] 15.2 Dokumentáció más fejlesztőknek (opcionális)
  - Spec dokumentumok elkészültek ✓
  - Design.md tartalmazza a használati útmutatót ✓
