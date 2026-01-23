<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
	import { Button } from '$lib/components/ui/button';
	import type { TaskbarPosition } from '$root/src/lib/constants';
	import { getContext } from 'svelte';
	import { updateSettings } from '../settings.remote';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';

	// Ikonok
	import { PanelTop, PanelBottom } from 'lucide-svelte';

	interface Props {
		// Jövőbeli props-ok ide kerülnek
	}

	let {}: Props = $props();

	// Settings objektum a kontextusból
	const settings = getContext<{
		taskbarPosition: TaskbarPosition;
	}>('settings');

	// Tálca pozíció változtatása
	async function handleTaskbarPositionChange(position: TaskbarPosition) {
		try {
			const result = await updateSettings({
				taskbarPosition: position
			});
			if (result && 'success' in result && result.success) {
				await invalidate('app:settings');
				toast.success('Tálca pozíció mentve');
			} else {
				toast.error('Hiba történt a mentés során');
			}
		} catch (error) {
			toast.error('Hiba történt a mentés során');
		}
	}
</script>

<h2>Tálca beállítások</h2>

<ContentSection
	title="Tálca pozíció"
	description="A tálca pozíciója a képernyőn."
	contentPosition="bottom"
>
	{#snippet info()}
		Tetszés szerint állítható a tálca pozíciója a képernyőn. Elhelyezhető a képernyő alján vagy
		felső részén.
	{/snippet}
	<div class="button-groups">
		<Button
			variant={settings.taskbarPosition === 'top' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleTaskbarPositionChange('top')}
		>
			<PanelTop size={14} />
			Felül
		</Button>
		<Button
			variant={settings.taskbarPosition === 'bottom' ? 'default' : 'outline'}
			size="sm"
			onclick={() => handleTaskbarPositionChange('bottom')}
		>
			<PanelBottom size={14} />
			Alul
		</Button>
	</div>
</ContentSection>

<style>
	/* Gomb csoport */
	.button-groups {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.button-groups :global(button) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
