# Megjelenési Beállítások Fejlesztése

## 1. Áttekintés

Az `AppearanceSettings` komponens fejlesztése, amely lehetővé teszi a felhasználók számára a téma beállítások (dark/light mód, taskbar mód, betűméret) kezelését egy átlátható, felhasználóbarát felületen keresztül. A komponens kinézete és működése hasonló lesz a `PerformanceSettings` komponenshez, de vizuális elemekkel gazdagítva a jobb felhasználói élmény érdekében.

## 2. Felhasználói Történetek

### 2.1 Desktop Téma Mód Beállítása

**Mint** felhasználó
**Szeretnék** választani a világos és sötét téma között
**Hogy** a számomra kényelmesebb megjelenést használhassam

**Elfogadási Kritériumok:**

- Vizuális választó (kártyák) a világos és sötét mód között
- Minden kártya tartalmaz egy illusztrációt/ikont, ami szemlélteti a módot
- Az aktív mód vizuálisan kiemelve jelenik meg
- A kiválasztott mód azonnal alkalmazódik
- A beállítás mentésre kerül és megmarad újratöltés után
- Információs blokk magyarázza a funkciót

### 2.2 Taskbar Egyedi Mód Beállítása

**Mint** felhasználó
**Szeretnék** a taskbar számára külön témát beállítani
**Hogy** a taskbar eltérő megjelenésű legyen, mint a desktop

**Elfogadási Kritériumok:**

- Switch kapcsoló a taskbar egyedi mód be/kikapcsolásához
- Ha be van kapcsolva, a taskbar mód eltérhet a desktop módtól
- Ha ki van kapcsolva, a taskbar követi a desktop módot
- Dropdown vagy választó a taskbar módjának beállításához (világos/sötét)
- A taskbar mód választó csak akkor aktív, ha az egyedi mód be van kapcsolva
- Információs blokk magyarázza a funkciót
- A beállítás mentésre kerül

### 2.3 Betűméret Beállítása

**Mint** felhasználó
**Szeretnék** a rendszer betűméretét módosítani
**Hogy** a számomra megfelelő olvashatóságot érjem el

**Elfogadási Kritériumok:**

- Három választható betűméret: kicsi (small), közepes (medium), nagy (large)
- Választó gombok vagy dropdown a betűméret kiválasztásához
- Az aktív betűméret vizuálisan kiemelve
- A betűméret változás azonnal látható a felületen
- Információs blokk magyarázza a funkciót
- A beállítás mentésre kerül

### 2.4 Beállítások Mentése

**Mint** felhasználó
**Szeretnék** hogy a beállításaim automatikusan mentésre kerüljenek
**Hogy** ne kelljen külön mentés gombot nyomnom

**Elfogadási Kritériumok:**

- Minden beállítás változás automatikusan mentésre kerül
- Toast értesítés jelenik meg sikeres mentés esetén
- Hibaüzenet jelenik meg, ha a mentés sikertelen
- A mentés a `settings.remote.ts` `updateSettings` függvényét használja
- A beállítások a `theme` objektum megfelelő mezőit frissítik:
  - `theme.mode` - desktop téma mód
  - `theme.modeTaskbarStartMenu` - taskbar téma mód
  - `theme.fontSize` - betűméret

## 3. Technikai Követelmények

### 3.1 Komponens Struktúra

**Fájl:** `src/lib/apps/settings/components/AppearanceSettings.svelte`

**Szekciók:**

1. **Desktop Téma Mód** - Vizuális kártyák világos/sötét mód választáshoz
2. **Taskbar Egyedi Mód** - Switch + mód választó
3. **Betűméret** - Választó gombok vagy dropdown

**Nincs szükség tab megoldásra** - minden beállítás egy oldalon jelenik meg.

### 3.2 Állapotkezelés

- A komponens a `getContext('settings')` segítségével éri el a beállításokat
- A settings objektum reaktív, a layout biztosítja
- A komponens a `settings.theme` objektumot használja:
  - `settings.theme.mode` - ThemeMode ('light' | 'dark' | 'auto')
  - `settings.theme.modeTaskbarStartMenu` - ThemeMode ('light' | 'dark' | 'auto')
  - `settings.theme.fontSize` - FontSize ('small' | 'medium' | 'large')

### 3.3 Mentési Logika

- Az `updateSettings` függvény használata a `settings.remote.ts`-ből
- Minden beállítás változás esetén:
  ```typescript
  await updateSettings({
    theme: {
      mode: newMode,
      // vagy
      modeTaskbarStartMenu: newTaskbarMode,
      // vagy
      fontSize: newFontSize
    }
  });
  ```
- `invalidate('app:settings')` hívás a beállítások újratöltéséhez
- Toast értesítések sikeres/sikertelen mentés esetén

### 3.4 Vizuális Elemek

**Desktop Téma Mód Választó:**

- Két kártya (világos és sötét)
- Minden kártya tartalmaz:
  - Ikon vagy illusztráció (pl. nap ikon világos módhoz, hold ikon sötét módhoz)
  - Címke ("Világos" / "Sötét")
  - Aktív állapot jelzése (border, háttérszín)
- Kattintható kártyák
- Hover effekt

**Taskbar Mód:**

- Switch komponens (shadcn-svelte)
- Label és leírás
- Mód választó (csak ha a switch be van kapcsolva)
- Disabled állapot kezelése

**Betűméret Választó:**

- Három gomb vagy radio button csoport
- Címkék: "Kicsi", "Közepes", "Nagy"
- Aktív állapot jelzése

### 3.5 Stílusok

- Hasonló a `PerformanceSettings` komponenshez:
  - `.settings-section` - szekciók elválasztása
  - `.setting-item` - egy beállítási elem
  - `.setting-header` - címke és vezérlő elem
  - `.setting-label-group` - címke és leírás
  - `.info-block` - információs blokk
- Új stílusok a vizuális elemekhez:
  - `.theme-mode-cards` - téma mód kártyák konténere
  - `.theme-card` - egyedi téma kártya
  - `.theme-card.active` - aktív téma kártya
  - `.font-size-buttons` - betűméret gombok konténere

### 3.6 Használt Komponensek

- `Switch` - shadcn-svelte switch komponens
- `Label` - shadcn-svelte label komponens
- `Button` - shadcn-svelte button komponens (opcionális)
- `toast` - svelte-sonner toast értesítések
- Lucide/Phosphor ikonok (Sun, Moon, Type, stb.)

## 4. Nem-Funkcionális Követelmények

### 4.1 Felhasználói Élmény

- Intuitív, könnyen érthető felület
- Vizuális visszajelzés minden interakcióra
- Gyors válaszidő (< 300ms)
- Smooth animációk és átmenetek
- Konzisztens megjelenés a többi beállítási komponenssel

### 4.2 Hozzáférhetőség

- Keyboard navigáció támogatása
- ARIA címkék és leírások
- Megfelelő kontrasztarány
- Screen reader támogatás

### 4.3 Teljesítmény

- Nincs felesleges újrarenderelés
- Optimalizált állapotkezelés
- Gyors mentési műveletek

### 4.4 Karbantarthatóság

- Tiszta, jól strukturált kód
- Típusbiztos TypeScript
- Kommentált komplex logika
- Újrafelhasználható segédfüggvények

## 5. Korlátozások és Feltételezések

### 5.1 Korlátozások

- A komponens nem kezeli a színséma beállítást (ez egy későbbi fejlesztés)
- Az 'auto' téma mód (rendszer preferencia) jelenleg nem támogatott a UI-ban
- A taskbar mód csak akkor állítható, ha az egyedi mód be van kapcsolva

### 5.2 Feltételezések

- A `settings` objektum elérhető a context-ből
- Az `updateSettings` függvény megfelelően működik
- A téma változások azonnal alkalmazódnak a rendszerben
- A felhasználó böngészője támogatja a modern CSS funkciókat

## 6. Jövőbeli Bővítések

- **Auto mód támogatása** - rendszer preferencia követése
- **Színséma beállítás** - elsődleges szín választása
- **Előnézet funkció** - beállítások előnézete alkalmazás előtt
- **Téma profilok** - előre definiált téma kombinációk
- **Egyedi betűméret** - pontos pixel érték megadása
- **Animációk be/kikapcsolása** - teljesítmény optimalizálás
- **Kontrasztarány beállítás** - hozzáférhetőség javítása

## 7. Sikerkritériumok

A funkció akkor tekinthető sikeresnek, ha:

✅ A felhasználó könnyen megértheti és használhatja a beállításokat
✅ Minden beállítás változás mentésre kerül és megmarad
✅ A vizuális elemek segítik a felhasználót a döntéshozatalban
✅ A komponens kinézete konzisztens a többi beállítási komponenssel
✅ Nincs teljesítménybeli probléma vagy lag
✅ A kód tiszta, jól strukturált és karbantartható
