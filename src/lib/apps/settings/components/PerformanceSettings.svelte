<script lang="ts">
	import { Switch } from '$lib/components/ui/switch';
	import { Label } from '$lib/components/ui/label';
	import { Slider } from 'bits-ui';
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

	const thumbnailHeights = [100, 200, 300, 400];

	// Csak akkor mentünk, amikor a felhasználó befejezi a slider mozgatását
	async function handleScreenshotHeightCommit(newValue: number) {
		if (isScreenshotHeightDisabled) return;

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
	title="Előnézeti kép"
	description="Az előnézeti képek méretének kezelése"
	disabled={isScreenshotHeightDisabled}
	contentPosition="bottom"
>
	{#snippet info()}
		Az előnézeti képek magasságának beállítása. Nagyobb értékek részletesebb előnézeteket
		eredményeznek, de több memóriát és feldolgozási kapacitást igényelnek. Ajánlott érték:
		{APP_CONSTANTS.DEFAULT_SCREENSHOT_HEIGHT}px.
	{/snippet}

	<div class="slider-container">
		<Slider.Root
			type="single"
			step={thumbnailHeights}
			value={settings.screenshotThumbnailHeight}
			disabled={isScreenshotHeightDisabled}
			onValueCommit={(value) => handleScreenshotHeightCommit(value)}
			class="slider-root"
			trackPadding={3}
		>
			{#snippet children({ tickItems })}
				<span class="slider-track">
					<Slider.Range class="slider-range" />
				</span>
				<Slider.Thumb index={0} class="slider-thumb" />
				{#each tickItems as { index, value } (index)}
					<Slider.Tick {index} class="slider-tick" />
					<Slider.TickLabel {index} class="slider-tick-label">
						{value}px
					</Slider.TickLabel>
				{/each}
			{/snippet}
		</Slider.Root>
	</div>
</ContentSection>

<style>
	.slider-container {
		margin-top: 2rem;
		padding: 0 0.5rem;
		width: 100%;
	}

	.slider-container :global(.slider-root) {
		display: flex;
		position: relative;
		align-items: center;
		width: 100%;
		touch-action: none;
		user-select: none;
	}

	.slider-container :global(.slider-track) {
		position: relative;
		flex-grow: 1;
		cursor: pointer;
		border-radius: 9999px;
		background-color: var(--color-muted);
		width: 100%;
		height: 0.5rem;
		overflow: hidden;
	}

	.slider-container :global(.slider-range) {
		position: absolute;
		background-color: var(--color-foreground);
		height: 100%;
	}

	.slider-container :global(.slider-thumb) {
		display: block;
		z-index: 10;
		transition: all 0.2s;
		cursor: pointer;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
		border: 2px solid var(--color-foreground);
		border-radius: 9999px;
		background-color: white;
		width: 20px;
		height: 20px;
	}

	.slider-container :global(.slider-thumb:hover) {
		box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
	}

	.slider-container :global(.slider-thumb:focus-visible) {
		outline: none;
		box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.2);
	}

	.slider-container :global(.slider-thumb[data-disabled]) {
		opacity: 0.5;
		pointer-events: none;
	}

	.slider-container :global(.slider-tick) {
		z-index: 1;
		background-color: var(--color-background);
		width: 1px;
		height: 0.5rem;
	}

	:global(.dark) .slider-container :global(.slider-tick) {
		background-color: var(--color-background);
	}

	.slider-container :global(.slider-tick-label) {
		margin-bottom: 1.25rem;
		color: var(--color-muted-foreground);
		font-weight: 500;
		font-size: 0.875rem;
		line-height: 1;
	}

	.slider-container :global(.slider-tick-label[data-selected]) {
		color: var(--color-foreground);
	}
</style>
