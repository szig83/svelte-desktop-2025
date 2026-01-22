<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import ColorPicker from '$lib/components/ui/ColorPicker.svelte';
	import { toast } from 'svelte-sonner';
	import { updateSettings } from '../settings.remote';
	import { getContext } from 'svelte';
	import { invalidate } from '$app/navigation';
	import type { BackgroundType } from '$lib/constants';

	// Ikonok
	import Palette from 'lucide-svelte/icons/palette';
	import Image from 'lucide-svelte/icons/image';
	import Video from 'lucide-svelte/icons/video';

	// Settings objektum a kontextusból
	const settings = getContext<{
		background: {
			type: BackgroundType;
			value: string;
		};
	}>('settings');

	// Előre definiált háttér fájlok
	const availableImages = ['01.jpg', '02.jpg', '03.jpg', '04.jpg'];
	const availableVideos = ['bg-video.mp4', '01.mp4', '03.mp4', '04.mp4', '05.mp4'];

	// Lokális állapot a színválasztóhoz
	let colorValue = $state(
		settings.background.type === 'color' ? settings.background.value : '#1e293b'
	);

	// Háttér típus változtatása
	async function handleBackgroundTypeChange(newType: BackgroundType) {
		try {
			let newValue = '';

			// Alapértelmezett érték beállítása típus szerint
			if (newType === 'color') {
				newValue = colorValue;
			} else if (newType === 'image') {
				newValue = availableImages[0];
			} else if (newType === 'video') {
				newValue = availableVideos[0];
			}

			const result = await updateSettings({
				background: { type: newType, value: newValue }
			});

			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Háttér típus mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Background type update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	// Szín változtatása
	async function handleColorChange(newColor: string) {
		colorValue = newColor;

		try {
			const result = await updateSettings({
				background: { type: 'color', value: newColor }
			});

			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Háttérszín mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Color update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	// Kép változtatása
	async function handleImageChange(newImage: string) {
		try {
			const result = await updateSettings({
				background: { type: 'image', value: newImage }
			});

			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Háttérkép mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Image update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}

	// Videó változtatása
	async function handleVideoChange(newVideo: string) {
		try {
			const result = await updateSettings({
				background: { type: 'video', value: newVideo }
			});

			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Háttérvideó mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			console.error('Video update error:', error);
			toast.error('Hiba történt a mentés során');
		}
	}
</script>

<h2>Háttér beállítások</h2>

<!-- Háttér Típus Szekció -->
<section>
	<div class="setting-item">
		<div class="setting-label-group">
			<Label>Háttér típusa</Label>
			<p class="setting-description">Válaszd ki a desktop háttér típusát</p>
		</div>

		<div class="background-type-cards">
			<button
				class="background-card"
				class:active={settings.background.type === 'color'}
				onclick={() => handleBackgroundTypeChange('color')}
			>
				<div class="background-card-icon">
					<Palette size={28} />
				</div>
				<span class="background-card-label">Szín</span>
			</button>

			<button
				class="background-card"
				class:active={settings.background.type === 'image'}
				onclick={() => handleBackgroundTypeChange('image')}
			>
				<div class="background-card-icon">
					<Image size={28} />
				</div>
				<span class="background-card-label">Kép</span>
			</button>

			<button
				class="background-card"
				class:active={settings.background.type === 'video'}
				onclick={() => handleBackgroundTypeChange('video')}
			>
				<div class="background-card-icon">
					<Video size={28} />
				</div>
				<span class="background-card-label">Videó</span>
			</button>
		</div>

		<div class="info-block">
			<p>
				A háttér típusa határozza meg, hogy milyen módon jelenik meg a desktop háttere. A szín opció
				egy egyszínű hátteret biztosít, a kép egy statikus háttérképet, míg a videó egy animált
				hátteret.
			</p>
		</div>
	</div>
</section>

<!-- Szín Beállítás Szekció -->
{#if settings.background.type === 'color'}
	<section>
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Háttérszín</Label>
				<p class="setting-description">Válassz egy színt a desktop hátteréhez</p>
			</div>

			<ColorPicker currentColor={colorValue} onColorChange={handleColorChange} />

			<div class="info-block">
				<p>
					Válassz egy előre definiált színt, vagy hozz létre egyedi színt a színválasztóval. A
					kiválasztott szín azonnal alkalmazásra kerül a desktop hátterén.
				</p>
			</div>
		</div>
	</section>
{/if}

<!-- Kép Beállítás Szekció -->
{#if settings.background.type === 'image'}
	<section>
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Háttérkép</Label>
				<p class="setting-description">Válassz egy képet a desktop hátteréhez</p>
			</div>

			<div class="image-selection">
				{#each availableImages as image}
					<button
						class="image-option"
						class:active={settings.background.value === image}
						onclick={() => handleImageChange(image)}
						aria-label="Háttérkép {image}"
					>
						<div
							class="image-preview"
							style="background-image: url('/backgrounds/image/{image}')"
						></div>
					</button>
				{/each}
			</div>

			<div class="info-block">
				<p>
					Válassz egy előre definiált háttérképet a listából. A kép a teljes desktop területén
					megjelenik, és automatikusan igazodik a képernyő méretéhez.
				</p>
			</div>
		</div>
	</section>
{/if}

<!-- Videó Beállítás Szekció -->
{#if settings.background.type === 'video'}
	<section>
		<div class="setting-item">
			<div class="setting-label-group">
				<Label>Háttérvideó</Label>
				<p class="setting-description">Válassz egy videót a desktop hátteréhez</p>
			</div>

			<div class="video-selection">
				{#each availableVideos as video}
					<button
						class="video-option"
						class:active={settings.background.value === video}
						onclick={() => handleVideoChange(video)}
					>
						<div class="video-icon">
							<Video size={32} />
						</div>
						<span class="video-name">{video}</span>
					</button>
				{/each}
			</div>

			<div class="info-block">
				<p>
					Válassz egy előre definiált háttérvideót a listából. A videó folyamatosan ismétlődik a
					háttérben, és automatikusan igazodik a képernyő méretéhez. A videó némítva van, és nem
					befolyásolja a rendszer teljesítményét jelentősen.
				</p>
			</div>
		</div>
	</section>
{/if}

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

	/* Háttér típus kártyák */
	.background-type-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.background-card {
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

	:global(.dark) .background-card {
		border-color: var(--color-neutral-700);
	}

	.background-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .background-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-950);
	}

	.background-card.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .background-card.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-900);
	}

	.background-card-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--color-neutral-600);
	}

	:global(.dark) .background-card-icon {
		color: var(--color-neutral-400);
	}

	.background-card.active .background-card-icon {
		color: var(--color-primary-600);
	}

	:global(.dark) .background-card.active .background-card-icon {
		color: var(--color-primary-400);
	}

	.background-card-label {
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.8125rem;
	}

	:global(.dark) .background-card-label {
		color: var(--color-neutral-300);
	}

	.background-card.active .background-card-label {
		color: var(--color-primary-700);
		font-weight: 600;
	}

	:global(.dark) .background-card.active .background-card-label {
		color: var(--color-primary-300);
	}

	/* Kép választó */
	.image-selection {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.image-option {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid var(--color-neutral-200);
		border-radius: var(--radius-lg, 0.5rem);
		background-color: transparent;
		padding: 0.5rem;
	}

	:global(.dark) .image-option {
		border-color: var(--color-neutral-700);
	}

	.image-option:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-color: var(--color-primary-400);
	}

	:global(.dark) .image-option:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		border-color: var(--color-primary-500);
	}

	.image-option.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .image-option.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-900);
	}

	.image-preview {
		border-radius: var(--radius-md, 0.375rem);
		background-position: center;
		background-size: cover;
		width: 100%;
		height: 120px;
	}

	/* Videó választó */
	.video-selection {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 0.5rem;
	}

	.video-option {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 0.75rem;
		transition: all 0.2s ease;
		cursor: pointer;
		border: 2px solid var(--color-neutral-200);
		border-radius: var(--radius-lg, 0.5rem);
		background-color: transparent;
		padding: 1.5rem 1rem;
		min-height: 120px;
	}

	:global(.dark) .video-option {
		border-color: var(--color-neutral-700);
	}

	.video-option:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .video-option:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-950);
	}

	.video-option.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		border-color: var(--color-primary-500);
		background-color: var(--color-primary-50);
	}

	:global(.dark) .video-option.active {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		border-color: var(--color-primary-400);
		background-color: var(--color-primary-900);
	}

	.video-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		color: var(--color-neutral-600);
	}

	:global(.dark) .video-icon {
		color: var(--color-neutral-400);
	}

	.video-option.active .video-icon {
		color: var(--color-primary-600);
	}

	:global(.dark) .video-option.active .video-icon {
		color: var(--color-primary-400);
	}

	.video-name {
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.8125rem;
		text-align: center;
	}

	:global(.dark) .video-name {
		color: var(--color-neutral-300);
	}

	.video-option.active .video-name {
		color: var(--color-primary-700);
		font-weight: 600;
	}

	:global(.dark) .video-option.active .video-name {
		color: var(--color-primary-300);
	}
</style>
