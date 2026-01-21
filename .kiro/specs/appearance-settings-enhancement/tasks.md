# Megjelenési Beállítások Fejlesztése - Feladatok

## 1. Előkészítés és Típusok Ellenőrzése

- [x] 1.1 Típusok és konstansok ellenőrzése
  - Fájl: `src/lib/constants.ts`
  - ThemeMode típus ellenőrzése ('light', 'dark', 'auto') ✅
  - FontSize típus ellenőrzése ('small', 'medium', 'large') ✅
  - DEFAULTS.THEME objektum ellenőrzése ✅

- [x] 1.2 Settings típusok ellenőrzése
  - Fájl: `src/lib/types/theme.ts`
  - ThemeSettings interface ellenőrzése ✅
  - mode, modeTaskbarStartMenu, fontSize mezők ellenőrzése ✅

- [x] 1.3 Remote függvény ellenőrzése
  - Fájl: `src/lib/apps/settings/settings.remote.ts`
  - updateSettings függvény theme paraméter támogatásának ellenőrzése ✅
  - Validációs séma ellenőrzése ✅

## 2. AppearanceSettings Komponens Átírása

- [x] 2.1 Import-ok hozzáadása
  - Switch, Label, Button komponensek importálása ✅
  - toast importálása svelte-sonner-ből ✅
  - updateSettings importálása settings.remote-ból ✅
  - getContext importálása svelte-ből ✅
  - invalidate importálása $app/navigation-ből ✅
  - ThemeMode, FontSize típusok importálása ✅
  - Ikonok importálása (Sun, Moon, Type) ✅

- [x] 2.2 Context és állapotkezelés beállítása
  - getContext('settings') használata ✅
  - settings.theme objektum elérése ✅
  - isTaskbarCustomMode derived state létrehozása ✅
  - TypeScript típusok definiálása ✅

- [x] 2.3 Desktop téma mód handler függvény
  - handleThemeModeChange implementálása ✅
  - updateSettings hívás theme.mode paraméterrel ✅
  - invalidate('app:settings') hívás ✅
  - Toast értesítések (sikeres/sikertelen) ✅
  - Error handling ✅

- [x] 2.4 Taskbar egyedi mód handler függvények
  - handleTaskbarCustomModeToggle implementálása ✅
  - Logika: ha egyedi mód ki van kapcsolva, taskbar mód = desktop mód ✅
  - Logika: ha egyedi mód be van kapcsolva, taskbar mód != desktop mód ✅
  - handleTaskbarModeChange implementálása ✅
  - Disabled állapot kezelése ✅
  - Toast értesítések és error handling ✅

- [x] 2.5 Betűméret handler függvény
  - handleFontSizeChange implementálása ✅
  - updateSettings hívás theme.fontSize paraméterrel ✅
  - invalidate('app:settings') hívás ✅
  - Toast értesítések és error handling ✅

## 3. Template Implementálása

- [x] 3.1 Alapstruktúra létrehozása
  - .appearance-settings konténer ✅
  - h2 címsor ✅
  - Meglévő tab megoldás eltávolítása ✅
  - Szekciók létrehozása ✅

- [x] 3.2 Desktop Téma Mód Szekció
  - .settings-section konténer ✅
  - .setting-item wrapper ✅
  - .setting-label-group (címke és leírás) ✅
  - .theme-mode-cards konténer ✅
  - Világos mód kártya (Sun ikon, "Világos" címke) ✅
  - Sötét mód kártya (Moon ikon, "Sötét" címke) ✅
  - class:active binding a kiválasztott módhoz ✅
  - onclick handler hozzáadása ✅
  - .info-block információs szöveg ✅

- [x] 3.3 Taskbar Egyedi Mód Szekció
  - .settings-section konténer ✅
  - .setting-item wrapper ✅
  - .setting-header (címke + Switch) ✅
  - Switch komponens (id, checked, onclick) ✅
  - Feltételes renderelés: {#if isTaskbarCustomMode} ✅
  - .taskbar-mode-selector konténer ✅
  - Világos/Sötét mód gombok (Button komponens) ✅
  - variant binding az aktív módhoz ✅
  - onclick handler hozzáadása ✅
  - .info-block információs szöveg ✅
  - class:disabled binding ✅

- [x] 3.4 Betűméret Szekció
  - .settings-section konténer ✅
  - .setting-item wrapper ✅
  - .setting-label-group (címke és leírás) ✅
  - .font-size-buttons konténer ✅
  - Három Button komponens (Kicsi, Közepes, Nagy) ✅
  - Type ikon különböző méretekkel (14, 16, 18) ✅
  - variant binding az aktív mérethez ✅
  - onclick handler hozzáadása ✅
  - .info-block információs szöveg ✅

## 4. Stílusok Implementálása

- [x] 4.1 Alapvető stílusok
  - .appearance-settings stílus ✅
  - h2 stílus (light és dark mode) ✅
  - .settings-section stílus (border, padding, dark mode) ✅
  - .settings-section:last-child stílus ✅

- [x] 4.2 Beállítási elemek stílusai
  - .setting-item stílus (flex, gap) ✅
  - .setting-header stílus (flex, justify-between) ✅
  - .setting-label-group stílus ✅
  - .setting-label-group :global(label) stílus (dark mode) ✅
  - .setting-description stílus (dark mode) ✅

- [x] 4.3 Információs blokk stílusai
  - .info-block stílus (border, background, padding) ✅
  - .info-block dark mode stílus ✅
  - .info-block.disabled stílus (dark mode) ✅
  - .info-block p stílus ✅

- [x] 4.4 Téma mód kártyák stílusai
  - .theme-mode-cards stílus (grid layout) ✅
  - .theme-card stílus (flex, border, background, padding) ✅
  - .theme-card dark mode stílus ✅
  - .theme-card:hover stílus (dark mode) ✅
  - .theme-card.active stílus (dark mode) ✅
  - .theme-card-icon stílus (dark mode, active) ✅
  - .theme-card-label stílus (dark mode, active) ✅

- [x] 4.5 Taskbar és betűméret gombok stílusai
  - .taskbar-mode-selector stílus ✅
  - .mode-buttons stílus (flex, gap) ✅
  - .mode-buttons :global(button) stílus ✅
  - .font-size-buttons stílus (flex, gap) ✅
  - .font-size-buttons :global(button) stílus ✅

## 5. Funkcionális Tesztelés

- [ ] 5.1 Desktop téma mód tesztelése
  - Világos mód kiválasztása működik
  - Sötét mód kiválasztása működik
  - Aktív állapot vizuálisan jelölve
  - Beállítás mentésre kerül
  - Toast értesítés megjelenik
  - Téma azonnal alkalmazódik
  - **Megjegyzés**: Manuális tesztelésre vár böngészőben

- [ ] 5.2 Taskbar egyedi mód tesztelése
  - Switch be/kikapcsolása működik
  - Egyedi mód bekapcsolásakor taskbar mód eltér a desktop módtól
  - Egyedi mód kikapcsolásakor taskbar mód = desktop mód
  - Taskbar mód választó csak egyedi mód esetén aktív
  - Taskbar mód váltás működik
  - Beállítások mentésre kerülnek
  - Toast értesítések megjelennek
  - **Megjegyzés**: Manuális tesztelésre vár böngészőben

- [ ] 5.3 Betűméret tesztelése
  - Kicsi méret kiválasztása működik
  - Közepes méret kiválasztása működik
  - Nagy méret kiválasztása működik
  - Aktív méret vizuálisan jelölve
  - Beállítás mentésre kerül
  - Toast értesítés megjelenik
  - Betűméret változás látható
  - **Megjegyzés**: Manuális tesztelésre vár böngészőben

- [ ] 5.4 Mentési folyamat tesztelése
  - updateSettings függvény helyesen hívódik
  - invalidate('app:settings') meghívódik
  - Context frissül
  - UI újrarenderelődik
  - Beállítások megmaradnak újratöltés után
  - **Megjegyzés**: Manuális tesztelésre vár böngészőben

## 6. UI és Vizuális Tesztelés

- [ ] 6.1 Light mode tesztelése
  - Összes szekció helyesen jelenik meg
  - Színek megfelelőek
  - Kontrasztarány megfelelő
  - Téma kártyák vizuálisan vonzóak
  - Aktív állapotok jól láthatók

- [ ] 6.2 Dark mode tesztelése
  - Összes szekció helyesen jelenik meg dark mode-ban
  - Színek megfelelőek
  - Kontrasztarány megfelelő
  - Téma kártyák vizuálisan vonzóak
  - Aktív állapotok jól láthatók

- [ ] 6.3 Hover és focus állapotok
  - Téma kártyák hover effektje működik
  - Gombok hover effektje működik
  - Focus állapotok láthatók
  - Keyboard navigáció működik

- [ ] 6.4 Responsive viselkedés
  - Téma kártyák grid layoutja működik
  - Gombok megfelelően tördelődnek
  - Szövegek olvashatók kisebb képernyőn

## 7. Hibakezelés Tesztelése

- [ ] 7.1 Mentési hibák kezelése
  - Hálózati hiba esetén hibaüzenet jelenik meg
  - Toast error értesítés megjelenik
  - Konzolban részletes hibaüzenet
  - UI nem marad inkonzisztens állapotban

- [ ] 7.2 Érvénytelen értékek kezelése
  - TypeScript típusok megakadályozzák az érvénytelen értékeket
  - Valibot validáció működik a backend-en

## 8. Hozzáférhetőség Tesztelése

- [ ] 8.1 Keyboard navigáció
  - Tab billentyűvel végignavigálható
  - Enter/Space aktiválja a gombokat
  - Focus sorrend logikus

- [ ] 8.2 ARIA attribútumok
  - Label komponensek megfelelő for attribútumokkal
  - Switch komponensek role="switch" attribútummal
  - Leíró szövegek minden vezérlőhöz

- [ ] 8.3 Screen reader támogatás
  - Címkék felolvashatók
  - Állapotok bejelentésre kerülnek
  - Információs blokkok felolvashatók

## 9. Teljesítmény Ellenőrzés

- [ ] 9.1 Reaktivitás ellenőrzése
  - $derived megfelelően működik
  - Nincs felesleges újrarenderelés
  - Csak a szükséges komponensek frissülnek

- [ ] 9.2 Mentési teljesítmény
  - API hívások gyorsak (< 300ms)
  - Nincs lag a UI-ban
  - Optimista UI frissítés működik

## 10. Kód Minőség

- [x] 10.1 TypeScript típusellenőrzés
  - Nincs TypeScript hiba ✅
  - Típusok helyesen definiálva ✅
  - Implicit any típusok elkerülve ✅

- [x] 10.2 Linting
  - Nincs ESLint hiba a komponensben ✅
  - Kód formázás konzisztens ✅
  - Prettier szabályok betartva ✅

- [x] 10.3 Kód kommentek
  - Komplex logika kommentálva ✅
  - JSDoc kommentek a függvényeknél ✅
  - Magyarázó kommentek ahol szükséges ✅

## 11. Integráció Ellenőrzése

- [ ] 11.1 Settings app integráció
  - Komponens betöltődik a menu.json alapján
  - Props megfelelően átadódnak
  - Context elérhető

- [ ] 11.2 Más komponensekkel való kompatibilitás
  - PerformanceSettings mellett működik
  - Nem zavarja a többi beállítási komponenst
  - Konzisztens megjelenés

## 12. Dokumentáció

- [ ] 12.1 Kód dokumentáció
  - Függvények dokumentálva
  - Komplex logika magyarázva
  - Props interface dokumentálva

- [ ] 12.2 Felhasználói dokumentáció (opcionális)
  - Információs blokkok érthetőek
  - Leírások pontosak
  - Példák ahol szükséges

## 13. Véglegesítés

- [ ] 13.1 Összes funkció működésének ellenőrzése
  - Manuális tesztelés minden funkcióval
  - Edge case-ek tesztelése
  - Különböző böngészőkben tesztelés

- [ ] 13.2 Cleanup
  - Nem használt import-ok eltávolítása
  - Kommentált kód eltávolítása
  - Console.log-ok eltávolítása (kivéve error logging)

- [ ] 13.3 Git commit előkészítése
  - Változások áttekintése
  - Commit message előkészítése
  - Spec dokumentumok frissítése ha szükséges
