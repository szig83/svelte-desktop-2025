<script lang="ts">
	interface Props {
		// Jövőbeli props-ok ide kerülnek
	}

	let {}: Props = $props();
</script>

<div class="general-settings">
	<h2>Általános beállítások</h2>

	<div class="settings-section">
		<h3>Nyelv és régió</h3>
		<p class="description">Nyelvi és regionális beállítások kezelése</p>
		<div class="placeholder-content">
			<p>Hamarosan elérhető...</p>
		</div>
	</div>

	<div class="settings-section">
		<h3>Értesítések</h3>
		<p class="description">Értesítési beállítások kezelése</p>
		<div class="placeholder-content">
			<p>Hamarosan elérhető...</p>
		</div>
	</div>

	<div class="settings-section">
		<h3>Adatvédelem</h3>
		<p class="description">Adatvédelmi beállítások kezelése</p>
		<div class="placeholder-content">
			<p>Hamarosan elérhető...</p>
		</div>
	</div>
</div>

<style>
	.general-settings {
		width: 100%;
	}

	h2 {
		margin-bottom: 1.5rem;
		color: var(--color-neutral-900);
		font-weight: 600;
		font-size: 1.5rem;
	}

	:global(.dark) h2 {
		color: var(--color-neutral-100);
	}

	.settings-section {
		margin-bottom: 2rem;
		border-bottom: 1px solid var(--color-neutral-200);
		padding-bottom: 2rem;
	}

	:global(.dark) .settings-section {
		border-bottom-color: var(--color-neutral-700);
	}

	.settings-section:last-child {
		border-bottom: none;
	}

	h3 {
		margin-bottom: 0.5rem;
		color: var(--color-neutral-800);
		font-weight: 600;
		font-size: 1.125rem;
	}

	:global(.dark) h3 {
		color: var(--color-neutral-200);
	}

	.description {
		margin-bottom: 1rem;
		color: var(--color-neutral-600);
		font-size: 0.875rem;
	}

	:global(.dark) .description {
		color: var(--color-neutral-400);
	}

	.placeholder-content {
		border-radius: var(--radius-md, 0.375rem);
		background-color: var(--color-neutral-50);
		padding: 1.5rem;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
		text-align: center;
	}

	:global(.dark) .placeholder-content {
		background-color: var(--color-neutral-800);
		color: var(--color-neutral-400);
	}
</style>
