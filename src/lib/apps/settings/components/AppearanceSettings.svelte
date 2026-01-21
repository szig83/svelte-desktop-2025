<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import ColorHuePicker from '$lib/components/ui/ColorHuePicker.svelte';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { ThemeMode, FontSize } from '$lib/types/theme';

	// Ikonok
	import Sun from 'lucide-svelte/icons/sun';
	import Moon from 'lucide-svelte/icons/moon';
	import Monitor from 'lucide-svelte/icons/monitor';
	import Type from 'lucide-svelte/icons/type';

	// Settings objektum a kontextusból
	const settings = getContext<{
		theme: {
			mode: ThemeMode;
			modeTaskbarStartMenu: ThemeMode;
			colorPrimaryHue: string;
			fontSize: FontSize;
		};
	}>('settings');

	// Desktop téma mód változtatása
	async function handleThemeModeChange(newMode: ThemeMode) {
		try {
			// Desktop mód változtatásakor a taskbar mód is automatikusan követi
			const result = await updateSettings({
				theme: {
					mode: newMode,
					modeTaskbarStartMenu: newMode
				}
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

	// Taskbar mód változtatása
	async function handleTaskbarModeChange(newMode: ThemeMode) {
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

	// Betűméret változtatása
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

	// Szín változtatása
	async function handleColorChange(newHue: number) {
		try {
			const result = await updateSettings({
				theme: { colorPrimaryHue: newHue.toString() }
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Szín mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Color update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}
</script>

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
						<Sun size={28} />
					</div>
					<span class="theme-card-label">Világos</span>
				</button>

				<button
					class="theme-card"
					class:active={settings.theme.mode === 'dark'}
					onclick={() => handleThemeModeChange('dark')}
				>
					<div class="theme-card-icon">
						<Moon size={28} />
					</div>
					<span class="theme-card-label">Sötét</span>
				</button>

				<button
					class="theme-card"
					class:active={settings.theme.mode === 'auto'}
					onclick={() => handleThemeModeChange('auto')}
				>
					<div class="theme-card-icon">
						<Monitor size={28} />
					</div>
					<span class="theme-card-label">Automatikus</span>
				</button>
			</div>

			<div class="info-block">
				<p>
					A desktop téma mód határozza meg az alkalmazás általános megjelenését. A világos mód
					világos hátteret és sötét szöveget használ, míg a sötét mód sötét hátteret és világos
					szöveget. Az automatikus mód a rendszer beállításait követi.
				</p>
			</div>
		</div>
	</div>

	<!-- Taskbar Mód Szekció -->
	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Taskbar téma mód</Label>
				<p class="setting-description">A taskbar eltérő témát használhat a desktoptól</p>
			</div>

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
				<Button
					variant={settings.theme.modeTaskbarStartMenu === 'auto' ? 'default' : 'outline'}
					size="sm"
					onclick={() => handleTaskbarModeChange('auto')}
				>
					<Monitor size={16} />
					Auto
				</Button>
			</div>

			<div class="info-block">
				<p>
					Ez hasznos lehet, ha szeretnéd, hogy a taskbar jobban kiemelkedjen vagy kevésbé legyen
					feltűnő.
				</p>
			</div>
		</div>
	</div>

	<!-- Színek Szekció -->
	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Színek</Label>
				<p class="setting-description">Válaszd ki az alkalmazás elsődleges színét</p>
			</div>

			<ColorHuePicker
				currentHue={parseInt(settings.theme.colorPrimaryHue)}
				onHueChange={handleColorChange}
			/>

			<div class="info-block">
				<p>
					Az elsődleges szín határozza meg az alkalmazás kiemelő színét, amely megjelenik a
					gombokban, linkekben és más interaktív elemekben. Válassz egy előre definiált színt, vagy
					hozz létre egyedi színt az árnyalat csúszkával.
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

	.info-block p {
		margin: 0;
	}

	/* Téma mód kártyák - Modernebb megjelenés */
	.theme-mode-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.theme-card {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.625rem;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid var(--color-neutral-200);
		border-radius: var(--radius-lg, 0.5rem);
		background-color: transparent;
		padding: 1.25rem 0.75rem;
		min-height: 100px;
	}

	:global(.dark) .theme-card {
		border-color: var(--color-neutral-700);
	}

	.theme-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .theme-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-950);
	}

	.theme-card.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .theme-card.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-900);
	}

	.theme-card-icon {
		display: flex;
		justify-content: center;
		align-items: center;
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
		font-size: 0.8125rem;
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

	/* Taskbar és betűméret gombok */
	.mode-buttons {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.mode-buttons :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

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
