<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { APP_CONSTANTS } from '$lib/constants';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';
	import ContentSection from '$lib/components/shared/ContentSection.svelte';

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

<h2>Teljesítmény beállítások</h2>

<!-- Teljesítmény optimalizálás-->
<ContentSection
	title="Teljesítmény optimalizálás"
	description="Gyorsabb működés a vizuális effektek rovására"
>
	{#snippet info()}
		Ha be van kapcsolva, az ablakok mozgatása közben a tartalmuk el van rejtve, és az ablak előnézet
		funkció is le van tiltva. Ez jelentősen javítja a teljesítményt lassabb eszközökön.
	{/snippet}

	<Switch
		id="prefer-performance"
		checked={settings.preferPerformance}
		onclick={handlePreferPerformanceChange}
	/>
</ContentSection>

<!-- Ablak előnézet -->
<ContentSection
	title="Ablak előnézet"
	description="Előnézeti képek megjelenítése a tálcán"
	disabled={isWindowPreviewDisabled}
>
	{#snippet info()}
		Az ablak előnézet funkció lehetővé teszi, hogy a tálcán lévő alkalmazások ikonjára mutatva egy
		kis előnézeti képet láss az ablak tartalmáról. Ez megkönnyíti a nyitott ablakok közötti
		navigációt.
	{/snippet}

	<Switch
		id="window-preview"
		checked={settings.windowPreview}
		disabled={isWindowPreviewDisabled}
		onclick={handleWindowPreviewChange}
	/>
</ContentSection>

<!-- Előnézeti kép magassága -->
<ContentSection
	title="Előnézeti kép magassága"
	description="Az előnézeti képek magassága pixelben"
	disabled={isScreenshotHeightDisabled}
>
	{#snippet info()}
		Az előnézeti képek magasságának beállítása. Nagyobb értékek részletesebb előnézeteket
		eredményeznek, de több memóriát és feldolgozási kapacitást igényelnek. Ajánlott érték:
		{APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT}px.
	{/snippet}

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
</ContentSection>

<style>
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
