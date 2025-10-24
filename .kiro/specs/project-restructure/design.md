# Tervezési Dokumentum - Projekt Átszervezés

## Áttekintés

Ez a tervezési dokumentum az asztali környezet webalkalmazás átszervezését vázolja fel a karbantarthatóság, skálázhatóság és fejlesztői élmény javítása érdekében. Az átszervezés középpontjában az alkalmazások egy helyen történő szervezése áll, miközben megőrzi a meglévő adatbázis struktúrát és funkcionalitást.

A jelenlegi struktúra organikusan nőtt, ahol a komponensek, alkalmazások és szolgáltatások különböző könyvtárakban szétszórva találhatók. Ez az átszervezés egy intuitívabb és karbantarthatóbb kódbázist hoz létre, amely konzisztens mintákat követ a jövőbeli fejlesztéshez.

## Architektúra

### Alkalmazás-Központú Struktúra

Az új architektúra az alkalmazásokat önálló modulokként szervezi:

- **Core**: Asztali környezet alapjai (ablakkezelés, asztal, tálca)
- **Apps**: Alkalmazás modulok szabványosított struktúrával - minden alkalmazás saját mappájában
- **Shared**: Közös segédprogramok, típusok és komponensek
- **Database**: Meglévő adatbázis struktúra változatlan marad

### Alkalmazás Modularitás

Minden alkalmazás önálló egységként működik:

- **Önálló mappák**: Minden alkalmazás saját mappájában található
- **Teljes funkcionalitás**: Komponensek, store-ok, típusok, segédprogramok egy helyen
- **Egyszerű karbantartás**: Egy alkalmazáshoz tartozó minden kód egy helyen
- **Könnyű bővíthetőség**: Új alkalmazások egyszerűen hozzáadhatók

## Komponensek és Interfészek

### Új Könyvtár Struktúra

```
src/
├── lib/
│   ├── components/
│   │   ├── core/                 # Asztali környezet alapkomponensek
│   │   │   ├── Desktop.svelte    # Fő asztali konténer
│   │   │   ├── Taskbar.svelte    # Alsó tálca
│   │   │   ├── startmenu/        # Start menü komponensek
│   │   │   └── window/           # Ablakkezelő komponensek
│   │   ├── ui/                   # Újrafelhasználható UI komponensek
│   │   └── shared/               # Közös komponensek
│   ├── apps/                     # Alkalmazás modulok
│   │   ├── [app-name]/           # Egyedi alkalmazás modulok
│   │   │   ├── index.svelte      # Fő alkalmazás komponens
│   │   │   ├── components/       # Alkalmazás-specifikus komponensek
│   │   │   ├── stores/           # Alkalmazás állapotkezelés
│   │   │   ├── types/            # Alkalmazás típusok
│   │   │   ├── utils/            # Alkalmazás segédprogramok
│   │   │   ├── icon.svg          # Alkalmazás ikon
│   │   │   └── metadata.ts       # Alkalmazás metaadatok
│   │   ├── registry/             # Alkalmazás regisztráció
│   │   └── shared/               # Közös alkalmazás segédprogramok
│   ├── stores/                   # Globális állapotkezelés
│   │   ├── windowStore.svelte.ts # Ablakkezelés
│   │   └── themeStore.svelte.ts  # Téma kezelés
│   ├── server/                   # Szerver oldali kód
│   │   ├── database/             # MEGLÉVŐ adatbázis struktúra (változatlan)
│   │   │   ├── schemas/          # Drizzle ORM sémák (jelenlegi struktúra)
│   │   │   ├── drizzle/          # Generált migrációk
│   │   │   ├── seeds/            # Adatbázis feltöltés
│   │   │   ├── queries/          # Újrafelhasználható lekérdezések
│   │   │   └── procedures/       # SQL tárolt eljárások
│   │   └── services/             # Szerver szolgáltatások
│   ├── types/                    # Közös típus definíciók
│   ├── utils/                    # Közös segédprogramok
│   └── services/                 # Alkalmazás szolgáltatások
```

### Alkalmazás Modul Struktúra

Minden alkalmazás szabványosított struktúrát követ:

```
src/lib/apps/[app-name]/
├── index.svelte                  # Fő alkalmazás komponens
├── components/                   # Alkalmazás-specifikus komponensek
│   ├── [Feature].svelte          # Funkció-specifikus komponensek
│   └── [SubComponent].svelte     # Al-komponensek
├── stores/
│   └── [app-name].store.ts       # Alkalmazás-specifikus állapot
├── types/
│   └── [app-name].types.ts       # Alkalmazás-specifikus típusok
├── utils/
│   └── [app-name].utils.ts       # Alkalmazás-specifikus segédprogramok
├── icon.svg                      # Alkalmazás ikon
└── metadata.ts                   # Alkalmazás metaadatok és konfiguráció
```

### Adatbázis Séma Szervezés

Az adatbázis struktúra változatlan marad (jelenlegi Drizzle ORM struktúra):

```
src/lib/server/database/schemas/
├── auth/                         # Hitelesítési sémák (meglévő)
├── platform/                     # Platform sémák (meglévő)
└── index.ts                      # Séma exportok (meglévő)
```

## Adatmodellek

### Alkalmazás Regiszter Modell

```typescript
interface AppMetadata {
	id: string;
	name: string;
	description: string;
	version: string;
	icon: string;
	category: AppCategory;
	permissions: Permission[];
	multiInstance: boolean;
	defaultSize: WindowSize;
	minSize: WindowSize;
	maxSize?: WindowSize;
}

interface AppRegistry {
	apps: Map<string, AppMetadata>;
	loadApp(id: string): Promise<SvelteComponent>;
	registerApp(metadata: AppMetadata): void;
	getAppsByCategory(category: AppCategory): AppMetadata[];
}
```

### Alkalmazás Struktúra Modell

```typescript
interface AppStructure {
	mainComponent: SvelteComponent;
	metadata: AppMetadata;
	stores?: Record<string, any>;
	types?: Record<string, any>;
	utils?: Record<string, Function>;
}

interface AppModule {
	default: SvelteComponent;
	metadata: AppMetadata;
}
```

### Migrációs Stratégia

```typescript
interface MigrationPlan {
	phases: MigrationPhase[];
	rollbackStrategy: RollbackPlan;
	validationSteps: ValidationStep[];
}

interface MigrationPhase {
	name: string;
	description: string;
	files: FileOperation[];
	dependencies: string[];
}
```

## Hibakezelés

### Migrációs Hibakezelés

- **Fájl Művelet Hibák**: Átfogó naplózás és visszaállítási képességek
- **Import Útvonal Hibák**: Automatikus észlelés és javítás a törött importokhoz
- **Típus Hibák**: Fokozatos migráció ideiglenes típus hidakkal
- **Futásidejű Hibák**: Tartalék mechanizmusok az átmeneti időszakban

### Validációs Stratégia

- **Migráció Előtti Validáció**: Potenciális konfliktusok és problémák ellenőrzése
- **Migráció Utáni Validáció**: Minden funkcionalitás helyes működésének ellenőrzése
- **Automatizált Tesztelés**: Meglévő tesztek futtatása regressziók elkerülése érdekében
- **Manuális Tesztelés**: Kulcsfontosságú felhasználói folyamatok ellenőrzése

## Tesztelési Stratégia

### Migrációs Tesztelés

1. **Biztonsági Mentés Készítése**: Teljes projekt biztonsági mentés a migráció megkezdése előtt
2. **Fokozatos Tesztelés**: Minden migrációs fázis független tesztelése
3. **Integrációs Tesztelés**: Alkalmazások közötti interakciók helyes működésének ellenőrzése
4. **Teljesítmény Tesztelés**: Teljesítmény regressziók elkerülése
5. **Visszaállítási Tesztelés**: Visszaállítási eljárások működésének ellenőrzése

### Automatizált Validáció

- **Import Elemzés**: Körkörös függőségek automatikus észlelése
- **Típus Ellenőrzés**: Átfogó TypeScript validáció
- **Build Ellenőrzés**: Projekt sikeres fordításának biztosítása
- **Teszt Csomag Futtatás**: Minden meglévő teszt futtatása

## Implementációs Fázisok

### 1. Fázis: Alapok Felállítása

- Új könyvtár struktúra létrehozása
- Közös típusok és segédprogramok létrehozása
- Alkalmazás regiszter rendszer alapjainak felállítása

### 2. Fázis: Alkalmazások Átszervezése

- Meglévő alkalmazások migrálása az új struktúrába
- Alkalmazás-specifikus komponensek, store-ok, típusok egy helyre szervezése
- Alkalmazás metaadatok létrehozása

### 3. Fázis: Core Komponensek Átszervezése

- Asztali környezet komponensek átszervezése
- UI komponensek kategorizálása
- Közös komponensek elkülönítése

### 4. Fázis: Store-ok és Szolgáltatások Átszervezése

- Globális store-ok átszervezése
- Szolgáltatások kategorizálása
- Import útvonalak frissítése

### 5. Fázis: Tisztítás és Finalizálás

- Régi könyvtár struktúra eltávolítása
- Összes import útvonal frissítése
- Dokumentáció frissítése

## Tervezési Döntések és Indoklások

### Alkalmazás-Központú Szervezés

**Döntés**: Minden alkalmazás saját mappájában, minden kapcsolódó kóddal együtt
**Indoklás**: Javítja a kód megtalálhatóságát, csökkenti a kognitív terhelést, és megkönnyíti a kapcsolódó funkcionalitás megértését. A fejlesztők egy helyen megtalálják az alkalmazáshoz tartozó összes kódot.

### Szabványosított Alkalmazás Struktúra

**Döntés**: Konzisztens struktúra kikényszerítése minden alkalmazás modulhoz
**Indoklás**: Csökkenti az új fejlesztők betanulási idejét, megkönnyíti az alkalmazások karbantartását, és lehetővé teszi az automatizált eszközök használatát. A szabványosított struktúra jobb kód újrafelhasználást és tesztelési mintákat is támogat.

### Adatbázis Struktúra Megőrzése

**Döntés**: A meglévő Drizzle ORM adatbázis struktúra változatlan marad
**Indoklás**: A jelenlegi adatbázis struktúra jól szervezett és működik. A változtatás felesleges kockázatot jelentene és nem hozna jelentős előnyöket.

### Fokozatos Migrációs Stratégia

**Döntés**: Fázisokban történő migráció implementálása minden lépésnél validációval
**Indoklás**: Csökkenti a törő változások kockázatát, lehetővé teszi a könnyebb visszaállítást problémák esetén, és folyamatos validációt biztosít a migrációs folyamat során.
