# App Dinamikus Tartalom Betöltési Rendszer

## 1. Áttekintés

Egy általános, újrafelhasználható rendszer létrehozása, amely lehetővé teszi, hogy bármely app-ban (settings, users, stb.) a bal oldali menüpontokra kattintva különböző komponensek töltődjenek be dinamikusan a jobb oldali tartalmi területre. Ez a rendszer minden app-ban használható lesz a webOS rendszeren belül.

**Első implementáció:** A settings app lesz az első, ahol ezt a rendszert bevezetjük, de a megoldás általános és újrafelhasználható kell legyen.

## 2. Felhasználói Történetek

### 2.1 Menüpont Kiválasztása

**Mint** felhasználó
**Szeretnék** a bal oldali menüben egy menüpontra kattintani
**Hogy** a hozzá tartozó beállítási felület megjelenjen a jobb oldalon

**Elfogadási Kritériumok:**

- A menüpontra kattintva a jobb oldali tartalom frissül
- A kiválasztott menüpont vizuálisan jelezve van (aktív állapot)
- Az átmenet smooth és felhasználóbarát
- Almenü elemekre is működik a funkció

### 2.2 Komponens Hivatkozás Kezelése

**Mint** fejlesztő
**Szeretnék** a menu.json fájlban megadni, hogy melyik menüpont melyik komponenst töltse be
**Hogy** könnyen bővíthető legyen a rendszer

**Elfogadási Kritériumok:**

- A menu.json tartalmaz egy `component` mezőt minden menüponthoz
- A komponens név alapján dinamikusan töltődik be a megfelelő Svelte komponens
- Ha nincs megadva komponens, akkor üres vagy placeholder tartalom jelenik meg
- A komponensek az adott app `components/` mappájában találhatók (pl. `src/lib/apps/settings/components/`)
- A rendszer bármely app-ban használható ugyanazzal a struktúrával

### 2.3 Alapértelmezett Nézet

**Mint** felhasználó
**Szeretnék** az app megnyitásakor egy alapértelmezett nézetet látni
**Hogy** ne legyen üres a jobb oldali terület

**Elfogadási Kritériumok:**

- Az első menüpont vagy egy kijelölt alapértelmezett menüpont tartalma jelenik meg
- Az alapértelmezett menüpont aktív állapotban van
- Ha nincs menüpont, akkor egy üdvözlő üzenet jelenik meg

### 2.4 Komponens Paraméterek

**Mint** fejlesztő
**Szeretnék** paramétereket átadni a betöltött komponenseknek
**Hogy** rugalmasabb legyen a rendszer

**Elfogadási Kritériumok:**

- A menu.json támogatja a `props` mezőt
- A megadott props objektum átadódik a komponensnek
- A komponensek megfelelően kezelik a kapott paramétereket

## 3. Technikai Követelmények

### 3.1 Menu.json Struktúra Bővítése

```json
{
  "label": "Megjelenés",
  "href": "#appearance",
  "icon": "Palette",
  "component": "AppearanceSettings",
  "props": {
    "defaultTab": "colors"
  },
  "children": [...]
}
```

**Mezők magyarázata:**

- `label`: A menüpontban megjelenő szöveg
- `href`: Egyedi azonosító a menüpont azonosítására (pl. `#appearance`, `#security`)
  - Használható az aktív menüpont követésére
  - Egyedi kell legyen minden menüponton belül
- `icon`: Ikon neve (Lucide/Phosphor)
- `component`: A betöltendő komponens neve (opcionális)
  - Ha nincs megadva, akkor placeholder vagy üres tartalom jelenik meg
  - Ha külső link, akkor a href használható navigációhoz
- `props`: A komponensnek átadandó paraméterek (opcionális)
- `children`: Almenü elemek (opcionális)

### 3.2 Komponens Struktúra

- Minden beállítási komponens a `src/lib/apps/settings/components/` mappában
- Komponensek követik a Svelte 5 runes szintaxist
- Komponensek exportálnak egy default komponenst

### 3.3 Állapotkezelés

- Az aktív menüpont állapota a settings app-ban van kezelve
- Svelte 5 `$state` rune használata az állapotkezeléshez
- Az aktív menüpont ID-ja vagy href-je alapján történik az azonosítás

### 3.4 Dinamikus Import

- A komponensek dinamikusan töltődnek be (lazy loading)
- Használjuk a Svelte dinamikus import funkcióját
- Error handling ha a komponens nem található

## 4. Nem-Funkcionális Követelmények

### 4.1 Teljesítmény

- A komponensek lazy loading-gal töltődnek be
- Nincs felesleges újratöltés komponens váltáskor
- Smooth átmenetek a komponensek között

### 4.2 Karbantarthatóság

- Könnyen hozzáadható új beállítási komponens
- A menu.json egyszerűen szerkeszthető
- Tiszta komponens struktúra

### 4.3 Felhasználói Élmény

- Gyors válaszidő menüpont váltáskor
- Vizuális visszajelzés az aktív menüpontra
- Loading állapot jelzése komponens betöltéskor

## 5. Korlátozások és Feltételezések

### 5.1 Korlátozások

- Csak egy komponens lehet aktív egyszerre
- A komponensek nem kommunikálnak egymással közvetlenül
- A menu.json fájl manuálisan szerkesztendő

### 5.2 Feltételezések

- A komponensek önállóan működnek
- Minden komponens kezeli a saját állapotát
- A komponensek nem igényelnek komplex inicializálást

## 6. Jövőbeli Bővítések

- Komponensek közötti navigáció (breadcrumb)
- Keresés a beállítások között
- Kedvenc beállítások gyors elérése
- Beállítások exportálása/importálása
