# App Dinamikus Tartalom Betöltési Rendszer - Design

## 1. Áttekintés

Ez a dokumentum részletezi egy **általános, újrafelhasználható** dinamikus tartalom betöltési rendszer technikai tervezését. A megoldás lehetővé teszi, hogy **bármely app-ban** a bal oldali menüpontokra kattintva különböző Svelte komponensek töltődjenek be a jobb oldali tartalmi területre.

**Első implementáció:** A settings app, de a rendszer minden app-ban (users, help, stb.) használható lesz.

**Kulcs elvek:**

- **Általános, újrafelhasználható komponensek** a `src/lib/components/shared/` mappában
- **Típusok és interfészek közös helyen** (`src/lib/types/`)
- **App-specifikus komponensek** az adott app `components/` mappájában
- **Egységes API** minden app számára

## 2. Architektúra

### 2.1 Komponens Hierarchia

```
[Bármely App]/index.svelte (pl. settings, users, help)
├── AppSideBar (shared)
│   └── AppSideBarMenu (shared, módosított)
│       └── MenuItem komponensek
└── AppContentArea (shared, új általános komponens)
    └── Dinamikusan betöltött app-specifikus komponens
```

**Megjegyzés:** Az `AppContentArea` egy általános, újrafelhasználható komponens lesz, amely bármely app-ban használható.

### 2.2 Adatfolyam

```
menu.json → [App]/index.svelte → $state (activeMenuItem)
                                   ↓
                            AppSideBarMenu (onclick event)
                                   ↓
                            AppContentArea (dynamic import from app/components/)
```

**Kulcs:** Az `AppContentArea` prop-ként kapja meg az app nevét, így tudja, hogy melyik app components mappájából töltse be a komponenst.

### 2.3 Fájl Struktúra

```
src/lib/
├── types/
│   └── menu.ts (új - közös MenuItem interface)
├── components/
│   └── shared/
│       ├── AppSideBar.svelte (meglévő)
│       ├── AppSideBarMenu.svelte (módosított)
│       └── AppContentArea.svelte (új - általános)
└── apps/
    ├── settings/
    │   ├── index.svelte (módosított)
    │   ├── menu.json (módosított)
    │   └── components/ (új mappa)
    │       ├── AppearanceSettings.svelte
    │       ├── GeneralSettings.svelte
    │       └── PlaceholderSettings.svelte
    ├── users/
    │   ├── index.svelte (jövőbeli)
    │   ├── menu.json (jövőbeli)
    │   └── components/ (jövőbeli)
    └── help/
        └── ... (jövőbeli)
```

## 3. Komponens Tervezés

### 3.1 MenuItem Interface (Közös Típus)

**Fájl:** `src/lib/types/menu.ts` (új, közös típusok)

```typescript
/**
 * MenuItem interface for app navigation menus
 * Used across all apps for consistent menu structure
 */
export interface MenuItem {
  /** Display label for the menu item */
  label: string;

  /** Unique identifier/href for the menu item (e.g., "#appearance") */
  href: string;

  /** Optional icon name (Lucide/Phosphor) */
  icon?: string;

  /** Optional component name to load (from app's components folder) */
  component?: string;

  /** Optional props to pass to the loaded component */
  props?: Record<string, any>;

  /** Optional child menu items for nested menus */
  children?: MenuItem[];
}

/**
 * Event payload for menu item click events
 */
export interface MenuItemClickEvent {
  item: MenuItem;
  event: MouseEvent;
}
```

**Megjegyzés:** Ez a típus minden app-ban használható lesz, ezért közös helyen van.

### 3.2 AppContentArea Komponens (Új, Általános, Shared)

**Fájl:** `src/lib/components/shared/AppContentArea.svelte`

**Props:**

- `appName: string` - Az app neve (pl. 'settings', 'users', 'help')
- `component: string | null` - A betöltendő komponens neve
- `props?: Record<string, any>` - A komponensnek átadandó props

**Funkciók:**

- Dinamikus komponens import az app-specifikus components mappából
- Loading állapot kezelése
- Error handling
- Placeholder megjelenítése ha nincs komponens

**Implementáció:**

```svelte
<script lang="ts">
	interface Props {
		appName: string;
		component: string | null;
		props?: Record<string, any>;
	}

	let { appName, component, props = {} }: Props = $props();

	let loadedComponent = $state<any>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	$effect(() => {
		if (component) {
			loadComponent(component);
		} else {
			loadedComponent = null;
			error = null;
		}
	});

	async function loadComponent(name: string) {
		loading = true;
		error = null;

		try {
			// Dinamikus import az app-specifikus components mappából
			const module = await import(`../../apps/${appName}/components/${name}.svelte`);
			loadedComponent = module.default;
		} catch (e) {
			console.error(`Failed to load component: ${name} from app: ${appName}`, e);
			error = `Nem sikerült betölteni a komponenst: ${name}`;
			loadedComponent = null;
		} finally {
			loading = false;
		}
	}
</script>

<div class="app-content-area">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
			<p>Betöltés...</p>
		</div>
	{:else if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{:else if loadedComponent}
		<svelte:component this={loadedComponent} {...props} />
	{:else}
		<div class="placeholder">
			<p>Válassz egy menüpontot a bal oldalon</p>
		</div>
	{/if}
</div>

<style>
	.app-content-area {
		width: 100%;
		height: 100%;
	}

	.loading,
	.placeholder {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		height: 100%;
		color: var(--color-neutral-500);
	}

	.error {
		margin: 1rem;
		border: 1px solid var(--color-red-200);
		border-radius: var(--radius-md);
		background-color: var(--color-red-50);
		padding: 1rem;
		color: var(--color-red-700);
	}

	:global(.dark) .error {
		border-color: var(--color-red-700);
		background-color: var(--color-red-900);
		color: var(--color-red-200);
	}

	.spinner {
		animation: spin 0.8s linear infinite;
		border: 3px solid var(--color-neutral-200);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
```

**Megjegyzés:** Az `appName` prop lehetővé teszi, hogy ugyanez a komponens minden app-ban működjön.

### 3.3 AppSideBarMenu Módosítása

**Fájl:** `src/lib/components/shared/AppSideBarMenu.svelte`

**Új Props:**

- `activeHref?: string` - Az aktív menüpont href-je
- `onItemClick?: (item: MenuItem) => void` - Kattintás callback

**Módosítások:**

- MenuItem interface import `src/lib/types/menu.ts`-ből
- `<a>` és `<button>` elemek `onclick` eseménykezelője
- Aktív állapot vizuális jelzése (`class:active={item.href === activeHref}`)
- Event propagáció megakadályozása (`event.preventDefault()`)

**Példa kód részlet:**

```svelte
<script lang="ts">
	import type { MenuItem } from '$lib/types/menu';
	import UniversalIcon from './UniversalIcon.svelte';

	interface Props {
		items: MenuItem[];
		activeHref?: string;
		onItemClick?: (item: MenuItem) => void;
	}

	let { items = [], activeHref, onItemClick }: Props = $props();

	// ... meglévő kód ...

	function handleClick(item: MenuItem, event: MouseEvent) {
		event.preventDefault();
		onItemClick?.(item);
	}
</script>

<!-- Módosított template -->
<button
	class="menu-item parent"
	class:active={item.href === activeHref}
	onclick={(e) => handleClick(item, e)}
>
	<!-- ... -->
</button>
```

### 3.4 App Főkomponens Minta (Bármely App)

**Példa:** `src/lib/apps/settings/index.svelte`

Ez a minta minden app-ban ugyanúgy implementálható.

```svelte
<script lang="ts">
	import { AppSideBar, AppSideBarMenu, AppContentArea } from '$lib/components/shared';
	import type { MenuItem } from '$lib/types/menu';
	import menuItems from './menu.json';

	// Állapotkezelés
	let activeMenuItem = $state<string | null>(null);
	let activeComponent = $state<string | null>(null);
	let componentProps = $state<Record<string, any>>({});

	// Alapértelmezett menüpont beállítása
	$effect(() => {
		const defaultItem = findDefaultMenuItem(menuItems);
		if (defaultItem) {
			handleMenuItemClick(defaultItem);
		}
	});

	function findDefaultMenuItem(items: MenuItem[]): MenuItem | null {
		for (const item of items) {
			if (item.component) {
				return item;
			}
			if (item.children) {
				const found = findDefaultMenuItem(item.children);
				if (found) return found;
			}
		}
		return null;
	}

	function handleMenuItemClick(item: MenuItem) {
		activeMenuItem = item.href;
		activeComponent = item.component || null;
		componentProps = item.props || {};
	}
</script>

<div class="app-container">
	<AppSideBar>
		<AppSideBarMenu
			items={menuItems}
			activeHref={activeMenuItem}
			onItemClick={handleMenuItemClick}
		/>
	</AppSideBar>

	<div class="app-content">
		<AppContentArea appName="settings" component={activeComponent} props={componentProps} />
	</div>
</div>

<style>
	.app-container {
		display: flex;
		flex-direction: row;
		height: 100%;
		overflow: hidden;
	}

	.app-content {
		flex: 1;
		padding: 24px;
		overflow-y: auto;
	}
</style>
```

**Kulcs pontok:**

- Az `appName` prop értéke az app neve ('settings', 'users', stb.)
- A minta minden app-ban ugyanúgy használható
- Csak az `appName` és a `menuItems` import változik app-onként

## 4. Beállítási Komponensek (App-specifikus)

### 4.1 Komponens Struktúra

**Mappa:** `src/lib/apps/[app-name]/components/`

Minden beállítási komponens:

- Önálló `.svelte` fájl
- Default export
- Props interface definiálása
- Svelte 5 runes használata
- Független, újrafelhasználható

### 4.2 Példa Komponens - AppearanceSettings

**Fájl:** `src/lib/apps/settings/components/AppearanceSettings.svelte`

```svelte
<script lang="ts">
	import ColorSchemePicker from '$lib/components/ui/ColorSchemePicker.svelte';

	interface Props {
		defaultTab?: string;
	}

	let { defaultTab = 'colors' }: Props = $props();
	let activeTab = $state(defaultTab);
</script>

<div class="appearance-settings">
	<h2>Megjelenés beállítások</h2>

	<div class="tabs">
		<button class:active={activeTab === 'colors'} onclick={() => (activeTab = 'colors')}>
			Színek
		</button>
		<button class:active={activeTab === 'theme'} onclick={() => (activeTab = 'theme')}>
			Téma
		</button>
	</div>

	<div class="tab-content">
		{#if activeTab === 'colors'}
			<ColorSchemePicker />
		{:else if activeTab === 'theme'}
			<div>Téma beállítások...</div>
		{/if}
	</div>
</div>

<style>
	.appearance-settings {
		width: 100%;
	}

	h2 {
		margin-bottom: 1.5rem;
		font-weight: 600;
		font-size: 1.5rem;
	}

	.tabs {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.tabs button {
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		padding: 0.5rem 1rem;
	}

	.tabs button.active {
		border-bottom-color: var(--color-primary-500);
		color: var(--color-primary-600);
	}
</style>
```

### 4.3 Példa Komponens - PlaceholderSettings

**Fájl:** `src/lib/apps/settings/components/PlaceholderSettings.svelte`

```svelte
<script lang="ts">
	interface Props {
		title?: string;
		message?: string;
	}

	let { title = 'Fejlesztés alatt', message = 'Ez a funkció hamarosan elérhető lesz.' }: Props =
		$props();
</script>

<div class="placeholder-settings">
	<div class="icon">🚧</div>
	<h3>{title}</h3>
	<p>{message}</p>
</div>

<style>
	.placeholder-settings {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: var(--color-neutral-500);
		text-align: center;
	}

	.icon {
		margin-bottom: 1rem;
		font-size: 4rem;
	}

	h3 {
		margin-bottom: 0.5rem;
		font-weight: 600;
		font-size: 1.25rem;
	}

	p {
		font-size: 0.875rem;
	}
</style>
```

## 5. Menu.json Struktúra

### 5.1 Frissített Struktúra

**Fájl:** `src/lib/apps/settings/menu.json`

```json
[
	{
		"label": "Megjelenés",
		"href": "#appearance",
		"icon": "Palette",
		"component": "AppearanceSettings",
		"props": {
			"defaultTab": "colors"
		}
	},
	{
		"label": "Általános",
		"href": "#general",
		"icon": "Settings",
		"component": "GeneralSettings"
	},
	{
		"label": "Egyenleglekérdezés",
		"href": "#balance",
		"icon": "Wallet",
		"children": [
			{
				"label": "24 Forintos lakáshitel",
				"href": "#balance-housing",
				"icon": "Home",
				"component": "PlaceholderSettings",
				"props": {
					"title": "Lakáshitel",
					"message": "A lakáshitel funkció fejlesztés alatt áll."
				}
			},
			{
				"label": "Folyószámla-hitelkeret",
				"href": "#balance-credit",
				"icon": "CreditCard",
				"component": "PlaceholderSettings"
			}
		]
	}
]
```

**Mezők:**

- `label`: Megjelenő szöveg
- `href`: Egyedi azonosító (kötelező, egyedi kell legyen)
- `icon`: Ikon neve (opcionális)
- `component`: Komponens neve a `components/` mappából (opcionális)
- `props`: Komponensnek átadandó props (opcionális)
- `children`: Almenü elemek (opcionális)

## 6. Shared Components Export

### 6.1 Index.ts Frissítése

**Fájl:** `src/lib/components/shared/index.ts`

```typescript
export { default as AppSideBar } from './AppSideBar.svelte';
export { default as AppSideBarMenu } from './AppSideBarMenu.svelte';
export { default as AppContentArea } from './AppContentArea.svelte';
export { default as UniversalIcon } from './UniversalIcon.svelte';
export { default as ErrorAlert } from './ErrorAlert.svelte';
```

## 7. Stílusok

### 7.1 Aktív Menüpont Stílus

**AppSideBarMenu.svelte:**

```css
.menu-item.active {
	background-color: var(--color-primary-100);
	color: var(--color-primary-700);
	font-weight: 600;
}

:global(.dark) .menu-item.active {
	background-color: var(--color-primary-900);
	color: var(--color-primary-200);
}
```

## 8. Teljesítmény Optimalizáció

### 8.1 Lazy Loading

- Komponensek csak akkor töltődnek be, amikor először kiválasztják őket
- Dinamikus `import()` használata
- Vite automatikusan kezeli a code splitting-et

### 8.2 Bundle Splitting

- Minden app-specifikus komponens külön chunk lesz
- Az `AppContentArea` dinamikus import-ja biztosítja ezt
- Csak a szükséges komponensek töltődnek be

## 9. Error Handling

### 9.1 Komponens Betöltési Hiba

```typescript
try {
  const module = await import(`../../apps/${appName}/components/${name}.svelte`);
  loadedComponent = module.default;
} catch (e) {
  console.error(`Failed to load component: ${name} from app: ${appName}`, e);
  error = `Nem sikerült betölteni a komponenst: ${name}`;
  loadedComponent = null;
}
```

### 9.2 Hiányzó Komponens

- Ha a menu.json-ban megadott komponens nem létezik
- Error üzenet megjelenítése az AppContentArea-ban
- Fejlesztői konzolban részletes hibaüzenet

## 10. Újrafelhasználhatóság Más App-okban

### 10.1 Users App Példa (Jövőbeli)

**Fájl:** `src/lib/apps/users/index.svelte`

```svelte
<script lang="ts">
  import { AppSideBar, AppSideBarMenu, AppContentArea } from '$lib/components/shared';
  import type { MenuItem } from '$lib/types/menu';
  import menuItems from './menu.json';

  let activeMenuItem = $state<string | null>(null);
  let activeComponent = $state<string | null>(null);
  let componentProps = $state<Record<string, any>>({});

  // ... ugyanaz a logika mint a settings app-ban ...
</script>

<div class="app-container">
  <AppSideBar>
    <AppSideBarMenu
      items={menuItems}
      activeHref={activeMenuItem}
      onItemClick={handleMenuItemClick}
    />
  </AppSideBar>

  <div class="app-content">
    <AppContentArea
      appName="users"  <!-- Csak ez változik! -->
      component={activeComponent}
      props={componentProps}
    />
  </div>
</div>
```

**Komponensek:** `src/lib/apps/users/components/`

- `UserList.svelte`
- `UserProfile.svelte`
- `UserPermissions.svelte`

## 11. Implementációs Sorrend

1. **Közös típusok** (`src/lib/types/menu.ts`)
2. **AppContentArea komponens** (`src/lib/components/shared/AppContentArea.svelte`)
3. **AppSideBarMenu módosítása** (activeHref, onItemClick)
4. **Shared index.ts frissítése**
5. **Settings app frissítése** (állapotkezelés, integráció)
6. **Settings komponensek** (AppearanceSettings, PlaceholderSettings, GeneralSettings)
7. **Menu.json frissítése**
8. **Tesztelés**
9. **Dokumentáció**

## 12. Jövőbeli Bővítések

### 12.1 Komponens Registry

- Központi registry a komponensekhez minden app-ból
- Metaadatok (név, leírás, kategória, app)
- Automatikus komponens felfedezés

### 12.2 Globális Keresés

- Keresés minden app beállításai között
- Komponens tartalmában való keresés
- Gyors navigáció keresési eredményekhez

### 12.3 App-ok Közötti Navigáció

- Egyik app-ból a másikba navigálás
- Deep linking app-ok között
- Breadcrumb navigáció

## 13. Összefoglalás

Ez a rendszer egy **általános, újrafelhasználható megoldás**, amely:

✅ Minden app-ban használható ugyanazzal az API-val
✅ Közös komponensek és típusok a shared mappában
✅ App-specifikus komponensek az adott app mappájában
✅ Lazy loading és code splitting
✅ Egyszerű bővíthetőség új app-okkal
✅ Konzisztens felhasználói élmény minden app-ban
