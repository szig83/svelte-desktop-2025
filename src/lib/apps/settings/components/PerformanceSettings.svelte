<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { APP_CONSTANTS } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';

	// Settings objektum a kontextusból - ez már reaktív a layout miatt
	const settings = getContext<{
		preferPerformance: boolean;
		windowPreview: boolean;
		screenshotThumbnailHeight: number;
	}>('settings');

	// Számított értékek
	let isWindowPreviewDisabled = $derived(settings.preferPerformance);
	let isScreenshotHeightDisabled = $derived(settings.preferPerformance || !settings.windowPreview);

	async function handlePreferPerformanceChange() {
		const newValue = !settings.preferPerformance;
		try {
			const result = await updateSettings({ preferPerformance: newValue });
			if (result && 'success' in result && result.success) {
				// Frissítjük az oldalt, hogy a settings újratöltődjön
				await invalidate('app:settings');
				console.log('Settings updated successfully');
				toast.success('Beállítások mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Settings update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	async function handleWindowPreviewChange() {
		if (isWindowPreviewDisabled) return;
		const newValue = !settings.windowPreview;
		try {
			const result = await updateSettings({ windowPreview: newValue });
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				console.log('Settings updated successfully');
				toast.success('Beállítások mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Settings update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	async function handleScreenshotHeightChange(e: Event) {
		if (isScreenshotHeightDisabled) return;
		const target = e.target as HTMLInputElement;
		const newValue = parseInt(target.value, 10);

		if (isNaN(newValue) || newValue < 100 || newValue > 400) {
			toast.error('Az érték 100 és 400 között kell legyen');
			return;
		}

		try {
			const result = await updateSettings({
				screenshotThumbnailHeight: newValue
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				console.log('Settings updated successfully');
				toast.success('Beállítások mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Settings update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}
</script>

<div class="performance-settings">
	<h2>Teljesítmény beállítások</h2>

	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-header">
				<div class="setting-label-group">
					<Label>Teljesítmény optimalizálás</Label>
					<p class="setting-description">Gyorsabb működés a vizuális effektek rovására</p>
				</div>
				<Switch
					id="prefer-performance"
					checked={settings.preferPerformance}
					onclick={handlePreferPerformanceChange}
				/>
			</div>
			<div class="info-block">
				<p>
					Ha be van kapcsolva, az ablakok mozgatása közben a tartalmuk el van rejtve, és az ablak
					előnézet funkció is le van tiltva. Ez jelentősen javítja a teljesítményt lassabb
					eszközökön.
				</p>
			</div>
		</div>
	</div>

	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-header">
				<div class="setting-label-group" class:disabled={isWindowPreviewDisabled}>
					<Label>Ablak előnézet</Label>
					<p class="setting-description">Előnézeti képek megjelenítése a tálcán</p>
				</div>
				<Switch
					id="window-preview"
					checked={settings.windowPreview}
					disabled={isWindowPreviewDisabled}
					onclick={handleWindowPreviewChange}
				/>
			</div>
			<div class="info-block" class:disabled={isWindowPreviewDisabled}>
				<p>
					Az ablak előnézet funkció lehetővé teszi, hogy a tálcán lévő alkalmazások ikonjára mutatva
					egy kis előnézeti képet láss az ablak tartalmáról. Ez megkönnyíti a nyitott ablakok
					közötti navigációt.
				</p>
			</div>
		</div>
	</div>

	<div class="settings-section">
		<div class="setting-item">
			<div class="setting-header">
				<div class="setting-label-group" class:disabled={isScreenshotHeightDisabled}>
					<Label>Előnézeti kép magassága</Label>
					<p class="setting-description">Az előnézeti képek magassága pixelben</p>
				</div>
				<div class="input-with-unit">
					<Input
						id="screenshot-height"
						type="number"
						min="100"
						max="400"
						step="10"
						value={settings.screenshotThumbnailHeight}
						disabled={isScreenshotHeightDisabled}
						class="number-input"
						onchange={handleScreenshotHeightChange}
					/>
					<span class="unit" class:disabled={isScreenshotHeightDisabled}>px</span>
				</div>
			</div>
			<div class="info-block" class:disabled={isScreenshotHeightDisabled}>
				<p>
					Az előnézeti képek magasságának beállítása. Nagyobb értékek részletesebb előnézeteket
					eredményeznek, de több memóriát és feldolgozási kapacitást igényelnek. Ajánlott érték:
					{APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT}px.
				</p>
			</div>
		</div>
	</div>
</div>

<style>
	.performance-settings {
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

	.setting-label-group.disabled {
		opacity: 0.5;
		cursor: not-allowed;
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

	:global(.dark) .setting-description {
		color: var(--color-neutral-500);
	}

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
		border-color: var(--color-neutral-200);
		background-color: var(--color-neutral-50);
		color: var(--color-neutral-400);
	}

	:global(.dark) .info-block.disabled {
		border-color: var(--color-neutral-800);
		background-color: var(--color-neutral-900);
		color: var(--color-neutral-600);
	}

	.info-block p {
		margin: 0;
	}

	.input-with-unit {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.input-with-unit :global(.number-input) {
		width: 100px;
		text-align: right;
	}

	.unit {
		color: var(--color-neutral-600);
		font-weight: 500;
		font-size: 0.875rem;
	}

	:global(.dark) .unit {
		color: var(--color-neutral-400);
	}

	.unit.disabled {
		color: var(--color-neutral-400);
	}

	:global(.dark) .unit.disabled {
		color: var(--color-neutral-600);
	}
</style>
