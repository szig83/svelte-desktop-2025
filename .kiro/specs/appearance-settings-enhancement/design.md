# Megjelenési Beállítások Fejlesztése - Design

## 1. Áttekintés

Ez a dokumentum részletezi az `AppearanceSettings` komponens technikai tervezését, amely lehetővé teszi a téma beállítások (desktop mód, taskbar mód, betűméret) kezelését. A komponens a `PerformanceSettings` mintáját követi, de vizuális elemekkel gazdagítva.

## 2. Komponens Architektúra

### 2.1 Komponens Struktúra

```
AppearanceSettings.svelte
├── Desktop Téma Mód Szekció
│   ├── Címke és leírás
│   ├── Téma kártyák (világos/sötét)
│   └── Információs blokk
├── Taskbar Egyedi Mód Szekció
│   ├── Switch (egyedi mód be/ki)
│   ├── Mód választó (ha egyedi mód aktív)
│   └── Információs blokk
└── Betűméret Szekció
    ├── Címke és leírás
    ├── Méret választó gombok
    └── Információs blokk
```

### 2.2 Adatfolyam

```
Context (settings) → AppearanceSettings
                           ↓
                    User Interaction
                           ↓
                    updateSettings()
                           ↓
                    invalidate('app:settings')
                           ↓
                    Context frissül
                           ↓
                    UI újrarenderelődik
```

## 3. Implementációs Részletek

### 3.1 Script Szekció

```typescript
<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { ThemeMode, FontSize } from '$lib/types/theme';

	// Ikonok
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Type from 'lucide-svelte/icons/type';

	// Settings objektum a kontextusból
	const settings = getContext<{
		theme: {
			mode: ThemeMode;
			modeTaskbarStartMenu: ThemeMode;
			fontSize: FontSize;
		};
	}>('settings');

	// Taskbar egyedi mód állapota
	let isTaskbarCustomMode = $derived(
		settings.theme.mode !== settings.theme.modeTaskbarStartMenu
	);

	// Mentési függvények
	async function handleThemeModeChange(newMode: ThemeMode) {
		try {
			const result = await updateSettings({
				theme: { mode: newMode }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Téma mód mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Theme mode update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	async function handleTaskbarCustomModeToggle() {
		const newMode = isTaskbarCustomMode
			? settings.theme.mode
			: (settings.theme.mode === 'light' ? 'dark' : 'light');

		try {
			const result = await updateSettings({
				theme: { modeTaskbarStartMenu: newMode }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Taskbar mód mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Taskbar mode update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	async function handleTaskbarModeChange(newMode: ThemeMode) {
		if (!isTaskbarCustomMode) return;

		try {
			const result = await updateSettings({
				theme: { modeTaskbarStartMenu: newMode }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Taskbar mód mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Taskbar mode update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	async function handleFontSizeChange(newSize: FontSize) {
		try {
			const result = await updateSettings({
				theme: { fontSize: newSize }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Betűméret mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Font size update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}
</script>
```

### 3.2 Template Struktúra

```svelte
<div class="appearance-settings">
	<h2>Megjelenés beállítások</h2>

	<!-- Desktop Téma Mód Szekció -->
	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Desktop téma mód</Label>
				<p class="setting-description">Válaszd ki a desktop megjelenését</p>
			</div>

			<div class="theme-mode-cards">
				<button
					class="theme-card"
					class:active={settings.theme.mode === 'light'}
					onclick={() => handleThemeModeChange('light')}
				>
					<div class="theme-card-icon">
						<Sun size={32} />
					</div>
					<span class="theme-card-label">Világos</span>
				</button>

				<button
					class="theme-card"
					class:active={settings.theme.mode === 'dark'}
					onclick={() => handleThemeModeChange('dark')}
				>
					<div class="theme-card-icon">
						<Moon size={32} />
					</div>
					<span class="theme-card-label">Sötét</span>
				</button>
			</div>

			<div class="info-block">
				<p>
					A desktop téma mód határozza meg az alkalmazás általános megjelenését. A világos mód
					világos hátteret és sötét szöveget használ, míg a sötét mód sötét hátteret és világos
					szöveget.
				</p>
			</div>
		</div>
	</div>

	<!-- Taskbar Egyedi Mód Szekció -->
	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-header">
				<div class="setting-label-group">
					<Label>Taskbar egyedi mód</Label>
					<p class="setting-description">A taskbar eltérő témát használhat</p>
				</div>
				<Switch
					id="taskbar-custom-mode"
					checked={isTaskbarCustomMode}
					onclick={handleTaskbarCustomModeToggle}
				/>
			</div>

			{#if isTaskbarCustomMode}
				<div class="taskbar-mode-selector">
					<Label>Taskbar téma mód</Label>
					<div class="mode-buttons">
						<Button
							variant={settings.theme.modeTaskbarStartMenu === 'light' ? 'default' : 'outline'}
							size="sm"
							onclick={() => handleTaskbarModeChange('light')}
						>
							<Sun size={16} />
							Világos
						</Button>
						<Button
							variant={settings.theme.modeTaskbarStartMenu === 'dark' ? 'default' : 'outline'}
							size="sm"
							onclick={() => handleTaskbarModeChange('dark')}
						>
							<Moon size={16} />
							Sötét
						</Button>
					</div>
				</div>
			{/if}

			<div class="info-block" class:disabled={!isTaskbarCustomMode}>
				<p>
					Ha be van kapcsolva, a taskbar és a start menü eltérő témát használhat, mint a desktop. Ez
					hasznos lehet, ha szeretnéd, hogy a taskbar jobban kiemelkedjen vagy kevésbé legyen
					feltűnő.
				</p>
			</div>
		</div>
	</div>

	<!-- Betűméret Szekció -->
	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Betűméret</Label>
				<p class="setting-description">A rendszer betűméretének beállítása</p>
			</div>

			<div class="font-size-buttons">
				<Button
					variant={settings.theme.fontSize === 'small' ? 'default' : 'outline'}
					size="sm"
					onclick={() => handleFontSizeChange('small')}
				>
					<Type size={14} />
					Kicsi
				</Button>
				<Button
					variant={settings.theme.fontSize === 'medium' ? 'default' : 'outline'}
					size="sm"
					onclick={() => handleFontSizeChange('medium')}
				>
					<Type size={16} />
					Közepes
				</Button>
				<Button
					variant={settings.theme.fontSize === 'large' ? 'default' : 'outline'}
					size="sm"
					onclick={() => handleFontSizeChange('large')}
				>
					<Type size={18} />
					Nagy
				</Button>
			</div>

			<div class="info-block">
				<p>
					A betűméret beállítása hatással van az egész rendszer szövegeinek méretére. Nagyobb
					betűméret könnyebb olvashatóságot biztosít, míg kisebb betűméret több információt jelenít
					meg a képernyőn.
				</p>
			</div>
		</div>
	</div>
</div>
```

### 3.3 Stílusok

```css
<style>
	.appearance-settings {
		width: 100%;
	}

	h2 {
		margin-bottom: 2rem;
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 1.5rem;
		letter-spacing: -0.025em;
	}

	:global(.dark) h2 {
		color: var(--color-neutral-100);
	}

	/* Szekciók */
	.settings-section {
		margin-bottom: 2.5rem;
		border-bottom: 1px solid var(--color-neutral-200);
		padding-bottom: 2.5rem;
	}

	:global(.dark) .settings-section {
		border-bottom-color: var(--color-neutral-800);
	}

	.settings-section:last-child {
		margin-bottom: 0;
		border-bottom: none;
		padding-bottom: 0;
	}

	/* Beállítási elemek */
	.setting-item {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.setting-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1.5rem;
	}

	.setting-label-group {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: 0.375rem;
	}

	.setting-label-group :global(label) {
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 1.0625rem;
		letter-spacing: -0.01em;
	}

	:global(.dark) .setting-label-group :global(label) {
		color: var(--color-neutral-100);
	}

	.setting-description {
		margin: 0;
		color: var(--color-neutral-500);
		font-weight: 400;
		font-size: 0.8125rem;
		line-height: 1.4;
	}

	/* Információs blokk */
	.info-block {
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--radius-md, 0.375rem);
		background-color: var(--color-neutral-50);
		padding: 0.875rem 1rem;
		color: var(--color-neutral-600);
		font-size: 0.75rem;
		line-height: 1.6;
	}

	:global(.dark) .info-block {
		border-color: var(--color-neutral-800);
		background-color: var(--color-neutral-900);
		color: var(--color-neutral-400);
	}

	.info-block.disabled {
		opacity: 0.6;
	}

	.info-block p {
		margin: 0;
	}

	/* Téma mód kártyák */
	.theme-mode-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.theme-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid var(--color-neutral-200);
		border-radius: var(--radius-lg, 0.5rem);
		background-color: var(--color-neutral-50);
		padding: 1.5rem 1rem;
	}

	:global(.dark) .theme-card {
		border-color: var(--color-neutral-700);
		background-color: var(--color-neutral-800);
	}

	.theme-card:hover {
		border-color: var(--color-primary-300);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .theme-card:hover {
		border-color: var(--color-primary-600);
		background-color: var(--color-primary-950);
	}

	.theme-card.active {
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-100);
	}

	:global(.dark) .theme-card.active {
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-900);
	}

	.theme-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-neutral-600);
	}

	:global(.dark) .theme-card-icon {
		color: var(--color-neutral-400);
	}

	.theme-card.active .theme-card-icon {
		color: var(--color-primary-600);
	}

	:global(.dark) .theme-card.active .theme-card-icon {
		color: var(--color-primary-400);
	}

	.theme-card-label {
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(.dark) .theme-card-label {
		color: var(--color-neutral-300);
	}

	.theme-card.active .theme-card-label {
		color: var(--color-primary-700);
		font-weight: 600;
	}

	:global(.dark) .theme-card.active .theme-card-label {
		color: var(--color-primary-300);
	}

	/* Taskbar mód választó */
	.taskbar-mode-selector {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.mode-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.mode-buttons :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	/* Betűméret gombok */
	.font-size-buttons {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.font-size-buttons :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
```

## 4. Állapotkezelés

### 4.1 Context Használata

A komponens a `getContext('settings')` segítségével éri el a beállításokat:

```typescript
const settings = getContext<{
	theme: {
		mode: ThemeMode;
		modeTaskbarStartMenu: ThemeMode;
		fontSize: FontSize;
	};
}>('settings');
```

### 4.2 Derived State

A taskbar egyedi mód állapota számított érték:

```typescript
let isTaskbarCustomMode = $derived(
	settings.theme.mode !== settings.theme.modeTaskbarStartMenu
);
```

### 4.3 Mentési Folyamat

1. Felhasználó interakció (kattintás, toggle)
2. Handler függvény meghívása
3. `updateSettings()` hívás a megfelelő paraméterekkel
4. Sikeres mentés esetén `invalidate('app:settings')` hívás
5. Toast értesítés megjelenítése
6. Context automatikusan frissül
7. UI újrarenderelődik az új értékekkel

## 5. Hibakezelés

### 5.1 Mentési Hibák

```typescript
try {
	const result = await updateSettings({ theme: { mode: newMode } });
	if (result && 'success' in result && result.success) {
		await invalidate('app:settings');
		toast.success('Beállítások mentve');
	} else {
		toast.error('Hiba történt a mentés során');
	}
} catch (error) {
	console.error('Settings update error:', error);
	toast.error('Hiba történt a mentés során');
}
```

### 5.2 Validáció

- A `updateSettings` függvény Valibot sémával validálja a bemenetet
- Csak érvényes értékek kerülnek mentésre
- TypeScript típusok biztosítják a típusbiztonságot

## 6. Teljesítmény Optimalizáció

### 6.1 Reaktivitás

- `$derived` használata számított értékekhez
- Minimális újrarenderelés
- Csak a szükséges komponensek frissülnek

### 6.2 Mentési Optimalizáció

- Debounce nem szükséges (explicit user action)
- Egyszerű, gyors API hívások
- Optimista UI frissítés (invalidate után)

## 7. Hozzáférhetőség

### 7.1 Keyboard Navigáció

- Minden interaktív elem elérhető billentyűzetről
- Tab sorrend logikus
- Enter/Space aktiválja a gombokat

### 7.2 ARIA Attribútumok

- Label komponensek megfelelő `for` attribútumokkal
- Switch komponensek `role="switch"` attribútummal
- Leíró szövegek minden vezérlőhöz

### 7.3 Vizuális Visszajelzés

- Focus állapot minden interaktív elemen
- Hover effektek
- Aktív állapot jelzése

## 8. Tesztelési Szempontok

### 8.1 Funkcionális Tesztek

- Desktop mód váltás működik
- Taskbar egyedi mód be/kikapcsolása működik
- Taskbar mód váltás működik (ha egyedi mód aktív)
- Betűméret váltás működik
- Beállítások mentésre kerülnek
- Toast értesítések megjelennek

### 8.2 UI Tesztek

- Vizuális elemek helyesen jelennek meg
- Aktív állapotok helyesen jelölve
- Dark mode támogatás működik
- Responsive viselkedés

### 8.3 Hibakezelési Tesztek

- Mentési hiba esetén hibaüzenet jelenik meg
- Hálózati hiba esetén megfelelő kezelés
- Érvénytelen értékek elutasítása

## 9. Függőségek

### 9.1 Komponensek

- `Switch` - `$lib/components/ui/switch`
- `Label` - `$lib/components/ui/label`
- `Button` - `$lib/components/ui/button`

### 9.2 Ikonok

- `Sun` - `lucide-svelte/icons/sun`
- `Moon` - `lucide-svelte/icons/moon`
- `Type` - `lucide-svelte/icons/type`

### 9.3 Utilities

- `toast` - `svelte-sonner`
- `getContext` - `svelte`
- `invalidate` - `$app/navigation`

### 9.4 Remote Functions

- `updateSettings` - `../settings.remote`

### 9.5 Types

- `ThemeMode` - `$lib/types/theme`
- `FontSize` - `$lib/types/theme`

## 10. Jövőbeli Fejlesztések

### 10.1 Auto Mód Támogatása

- Rendszer preferencia követése
- Automatikus váltás napszak alapján
- Külön kártya az auto módhoz

### 10.2 Előnézet Funkció

- Live preview a beállítások alkalmazása előtt
- Visszavonás lehetősége
- Időzített visszaállás

### 10.3 Animációk

- Smooth átmenetek a kártyák között
- Fade in/out effektek
- Micro-interakciók

## 11. Összefoglalás

Az `AppearanceSettings` komponens egy átlátható, felhasználóbarát felületet biztosít a téma beállítások kezeléséhez. A komponens:

✅ Követi a `PerformanceSettings` mintáját
✅ Vizuális elemekkel gazdagított
✅ Automatikus mentéssel rendelkezik
✅ Típusbiztos és jól strukturált
✅ Hozzáférhető és reszponzív
✅ Könnyen bővíthető és karbantartható
