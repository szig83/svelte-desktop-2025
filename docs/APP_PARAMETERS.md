# App Parameters System

Ez a dokumentáció leírja, hogyan lehet paramétereket átadni az alkalmazásoknak megnyitáskor.

## Használat

### 1. Több példány támogatás

Az alkalmazások támogathatják a több példány megnyitását az `allowMultiple: true` beállítással az app metaadataiban. Ebben az esetben:
- Ugyanazokkal a paraméterekkel megnyitva az app nem hoz létre új ablakot, hanem a meglévőt aktiválja
- Különböző paraméterekkel új példány nyílik meg
- Az ablak címe tartalmazza a paraméter-alapú instance azonosítót

### 2. Paraméterek átadása app megnyitásakor

```typescript
import { getWindowManager } from '$lib/stores/windowStore.svelte';

const windowManager = getWindowManager();

// Paraméterek átadása
windowManager.openWindow('app1', 'App Title', metadata, {
    userId: 'user123',
    theme: 'dark',
    initialCount: 5,
    config: {
        language: 'hu',
        notifications: true
    }
});
```

### 2. Paraméterek lekérdezése az app komponensben

```typescript
import { getAppParameters, getParameter, getWindowId } from '$lib/services/appContext';

// Összes paraméter lekérdezése
const parameters = getAppParameters();

// Window ID lekérdezése
const windowId = getWindowId();

// Specifikus paraméter lekérdezése default értékkel
const userId = getParameter<string>('userId', 'unknown');
const theme = getParameter<string>('theme', 'default');
const initialCount = getParameter<number>('initialCount', 0);

// Komplex objektum lekérdezése
const config = getParameter<{language: string, notifications: boolean}>('config');
```

## API Referencia

### WindowManager.openWindow()

```typescript
openWindow(
    appName: string, 
    title: string, 
    metadata: Partial<AppMetadata> = {}, 
    parameters: AppParameters = {}
): string
```

- `appName`: Az alkalmazás neve
- `title`: Az ablak címe  
- `metadata`: App metaadatok (méret, ikon stb.)
- `parameters`: Az appnak átadandó paraméterek
- **Visszatérési érték**: Az ablak ID-ja

### App Context Functions

#### `getAppParameters(): AppParameters`
Az összes paraméter lekérdezése objektumként.

#### `getWindowId(): string`
Az aktuális ablak ID-jának lekérdezése.

#### `getParameter<T>(key: string, defaultValue?: T): T | undefined`
Egy specifikus paraméter lekérdezése opcionális default értékkel.

#### `updateWindowTitle(newTitle: string): void`
Az aktuális ablak címének dinamikus módosítása az app komponensből.

## Példa App Komponens

```svelte
<script lang="ts">
    import { getAppParameters, getParameter, updateWindowTitle } from '$lib/services/appContext';
    
    // Paraméterek lekérdezése
    const parameters = getAppParameters();
    const userId = getParameter<string>('userId', 'guest');
    const settings = getParameter<object>('settings', {});
    
    let count = $state(0);
    
    function changeTitle() {
        updateWindowTitle(`My App - Count: ${count}`);
    }
    
    function resetTitle() {
        updateWindowTitle('My App');
    }
</script>

<div>
    <h1>User ID: {userId}</h1>
    <button onclick={() => { count++; }}>Count: {count}</button>
    <button onclick={changeTitle}>Update Title</button>
    <button onclick={resetTitle}>Reset Title</button>
    <pre>{JSON.stringify(parameters, null, 2)}</pre>
</div>
```

## Típusok

```typescript
// Paraméter interfész
export interface AppParameters {
    [key: string]: unknown;
}

// App context interfész
export interface AppContext {
    parameters: AppParameters;
    windowId: string;
}
```

## Megjegyzések

- A paraméterek a Svelte context rendszerén keresztül érhetők el
- Minden app automatikusan hozzáfér a saját paramétereinek
- A paraméterek típusbiztosak a TypeScript generikus típusokkal
- Default értékek megadhatók minden paraméterhez
