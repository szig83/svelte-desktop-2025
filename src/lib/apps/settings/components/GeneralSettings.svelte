<script lang="ts">
	import ContentSection from '$lib/components/shared/ContentSection.svelte';
</script>

{#snippet comingSoon()}
	Hamarosan elérhető...
{/snippet}

<div>
	<h2>Általános beállítások</h2>

	<ContentSection title="Nyelv és régió" description="Nyelvi és regionális beállítások kezelése">
		{#snippet info()}
			{@render comingSoon()}
		{/snippet}
	</ContentSection>

	<ContentSection title="Értesítések" description="Értesítési beállítások kezelése">
		{#snippet info()}
			{@render comingSoon()}
		{/snippet}
	</ContentSection>

	<ContentSection title="Adatvédelem" description="Adatvédelmi beállítások kezelése">
		{#snippet info()}
			{@render comingSoon()}
		{/snippet}
	</ContentSection>
</div>
