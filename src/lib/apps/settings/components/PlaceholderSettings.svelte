<script lang="ts">
	interface Props {
		title?: string;
		message?: string;
	}

	let { title = 'Fejlesztés alatt', message = 'Ez a funkció hamarosan elérhető lesz.' }: Props =
		$props();
</script>

<div class="placeholder-settings">
	<div class="icon">🚧</div>
	<h3>{title}</h3>
	<p>{message}</p>
</div>

<style>
	.placeholder-settings {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		min-height: 400px;
		color: var(--color-neutral-500);
		text-align: center;
	}

	.icon {
		opacity: 0.8;
		margin-bottom: 1rem;
		font-size: 4rem;
	}

	h3 {
		margin-bottom: 0.5rem;
		color: var(--color-neutral-700);
		font-weight: 600;
		font-size: 1.25rem;
	}

	:global(.dark) h3 {
		color: var(--color-neutral-300);
	}

	p {
		max-width: 400px;
		color: var(--color-neutral-500);
		font-size: 0.875rem;
	}

	:global(.dark) p {
		color: var(--color-neutral-400);
	}
</style>
