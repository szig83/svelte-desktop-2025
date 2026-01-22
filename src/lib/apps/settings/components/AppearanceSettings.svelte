<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import ColorHuePicker from '$lib/components/ui/ColorHuePicker.svelte';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { ThemeMode, FontSize } from '$lib/types/theme';
	import * as Tooltip from '$lib/components/ui/tooltip';

	// Ikonok
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

<h2>Megjelenés beállítások</h2>

<!-- Desktop Téma Mód Szekció -->
<section>
	<div class="setting-item">
		<div class="setting-label-group">
			<Label>Desktop téma mód</Label>
			<p class="setting-description">Válaszd ki a desktop megjelenését</p>
		</div>

		<Tooltip.Provider delayDuration={200}>
			<div class="theme-mode-swatches">
				<!-- Világos mód -->

				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="theme-swatch light-swatch"
							class:active={settings.theme.mode === 'light'}
							onclick={() => handleThemeModeChange('light')}
							aria-label="Világos mód"
							type="button"
						>
							{#if settings.theme.mode === 'light'}
								<span class="checkmark">✓</span>
							{/if}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>Világos mód</Tooltip.Content>
				</Tooltip.Root>

				<!-- Sötét mód -->

				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="theme-swatch dark-swatch"
							class:active={settings.theme.mode === 'dark'}
							onclick={() => handleThemeModeChange('dark')}
							aria-label="Sötét mód"
							type="button"
						>
							{#if settings.theme.mode === 'dark'}
								<span class="checkmark">✓</span>
							{/if}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>Sötét mód</Tooltip.Content>
				</Tooltip.Root>

				<!-- Automatikus mód -->

				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="theme-swatch auto-swatch"
							class:active={settings.theme.mode === 'auto'}
							onclick={() => handleThemeModeChange('auto')}
							aria-label="Automatikus mód"
							type="button"
						>
							{#if settings.theme.mode === 'auto'}
								<span class="checkmark">✓</span>
							{/if}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>Automatikus mód</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</Tooltip.Provider>

		<div class="info-block">
			<p>
				A desktop téma mód határozza meg az alkalmazás általános megjelenését. A világos mód világos
				hátteret és sötét szöveget használ, míg a sötét mód sötét hátteret és világos szöveget. Az
				automatikus mód a rendszer beállításait követi.
			</p>
		</div>
	</div>
</section>

<!-- Taskbar Mód Szekció -->
<section>
	<div class="setting-item">
		<div class="setting-label-group">
			<Label>Taskbar téma mód</Label>
			<p class="setting-description">A taskbar eltérő témát használhat a desktoptól</p>
		</div>

		<Tooltip.Provider delayDuration={200}>
			<div class="theme-mode-swatches">
				<!-- Világos mód -->
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="theme-swatch light-swatch"
							class:active={settings.theme.modeTaskbarStartMenu === 'light'}
							onclick={() => handleTaskbarModeChange('light')}
							aria-label="Világos mód"
							type="button"
						>
							{#if settings.theme.modeTaskbarStartMenu === 'light'}
								<span class="checkmark">✓</span>
							{/if}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>Világos mód</Tooltip.Content>
				</Tooltip.Root>

				<!-- Sötét mód -->
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="theme-swatch dark-swatch"
							class:active={settings.theme.modeTaskbarStartMenu === 'dark'}
							onclick={() => handleTaskbarModeChange('dark')}
							aria-label="Sötét mód"
							type="button"
						>
							{#if settings.theme.modeTaskbarStartMenu === 'dark'}
								<span class="checkmark">✓</span>
							{/if}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>Sötét mód</Tooltip.Content>
				</Tooltip.Root>

				<!-- Automatikus mód -->
				<Tooltip.Root>
					<Tooltip.Trigger>
						<button
							class="theme-swatch auto-swatch"
							class:active={settings.theme.modeTaskbarStartMenu === 'auto'}
							onclick={() => handleTaskbarModeChange('auto')}
							aria-label="Automatikus mód"
							type="button"
						>
							{#if settings.theme.modeTaskbarStartMenu === 'auto'}
								<span class="checkmark">✓</span>
							{/if}
						</button>
					</Tooltip.Trigger>
					<Tooltip.Content>Automatikus mód</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</Tooltip.Provider>

		<div class="info-block">
			<p>
				Ez hasznos lehet, ha szeretnéd, hogy a taskbar jobban kiemelkedjen vagy kevésbé legyen
				feltűnő.
			</p>
		</div>
	</div>
</section>

<!-- Színek Szekció -->
<section>
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
				Az elsődleges szín határozza meg az alkalmazás kiemelő színét, amely megjelenik a gombokban,
				linkekben és más interaktív elemekben. Válassz egy előre definiált színt, vagy hozz létre
				egyedi színt az árnyalat csúszkával.
			</p>
		</div>
	</div>
</section>

<!-- Betűméret Szekció -->
<section>
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
</section>

<style>
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

	/* Téma mód korongok - Hasonló a szín választóhoz */
	.theme-mode-swatches {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.theme-swatch {
		display: flex;
		position: relative;
		justify-content: center;
		align-items: center;
		transition:
			border-color 0.2s ease,
			box-shadow 0.2s ease;
		cursor: pointer;
		border: 3px solid transparent;
		border-radius: 50%;
		padding: 0;
		width: 40px;
		height: 40px;
	}

	.theme-swatch:hover {
		border-color: rgba(0, 0, 0, 0.3);
	}

	:global(.dark) .theme-swatch:hover {
		border-color: rgba(255, 255, 255, 0.3);
	}

	.theme-swatch:focus {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	.theme-swatch:focus:not(:focus-visible) {
		outline: none;
	}

	.theme-swatch.active {
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
		border-color: rgba(0, 0, 0, 0.5);
	}

	:global(.dark) .theme-swatch.active {
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.6);
	}

	/* Világos mód korong */
	.light-swatch {
		border: 3px solid var(--color-neutral-300);
		background: linear-gradient(135deg, #e5e5e5 0%, #d0d0d0 100%);
	}

	:global(.dark) .light-swatch {
		border-color: var(--color-neutral-600);
	}

	.light-swatch:hover {
		border-color: var(--color-neutral-400);
	}

	:global(.dark) .light-swatch:hover {
		border-color: var(--color-neutral-500);
	}

	.light-swatch.active {
		border-color: var(--color-neutral-600);
	}

	:global(.dark) .light-swatch.active {
		border-color: var(--color-neutral-400);
	}

	/* Sötét mód korong */
	.dark-swatch {
		border: 3px solid var(--color-neutral-700);
		background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
	}

	:global(.dark) .dark-swatch {
		border-color: var(--color-neutral-500);
	}

	.dark-swatch:hover {
		border-color: var(--color-neutral-600);
	}

	:global(.dark) .dark-swatch:hover {
		border-color: var(--color-neutral-400);
	}

	.dark-swatch.active {
		border-color: var(--color-neutral-900);
	}

	:global(.dark) .dark-swatch.active {
		border-color: var(--color-neutral-300);
	}

	/* Automatikus mód korong - fele világos, fele sötét */
	.auto-swatch {
		border: 3px solid var(--color-neutral-400);
		background: linear-gradient(90deg, #e5e5e5 0%, #e5e5e5 50%, #1a1a1a 50%, #1a1a1a 100%);
	}

	:global(.dark) .auto-swatch {
		border-color: var(--color-neutral-500);
	}

	.auto-swatch:hover {
		border-color: var(--color-neutral-500);
	}

	:global(.dark) .auto-swatch:hover {
		border-color: var(--color-neutral-400);
	}

	.auto-swatch.active {
		border-color: var(--color-neutral-700);
	}

	:global(.dark) .auto-swatch.active {
		border-color: var(--color-neutral-300);
	}

	/* Checkmark a korongokon */
	.theme-swatch .checkmark {
		transition: opacity 0.2s ease;
		color: var(--color-neutral-600);
		font-weight: bold;
		font-size: 20px;
		text-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
	}

	.dark-swatch .checkmark {
		color: var(--color-neutral-300);
		text-shadow: 0 0 3px rgba(0, 0, 0, 0.8);
	}

	.auto-swatch .checkmark {
		color: var(--color-neutral-700);
		text-shadow:
			-1px -1px 0 #fff,
			1px -1px 0 #fff,
			-1px 1px 0 #fff,
			1px 1px 0 #fff;
	}

	:global(.dark) .auto-swatch .checkmark {
		color: var(--color-neutral-300);
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
