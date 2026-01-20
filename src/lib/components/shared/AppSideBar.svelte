<script lang="ts">
	let { children } = $props();
</script>

<div class="app-sidebar">
	{@render children()}
</div>

<style>
	.app-sidebar {
		flex: 0 0 250px;
		border-radius: var(--radius-md);
		background: linear-gradient(
			to bottom right,
			var(--color-neutral-200),
			var(--color-neutral-100)
		);
		padding: 1rem;
	}

	:global {
		.dark {
			.app-sidebar {
				background: linear-gradient(
					to bottom right,
					var(--color-neutral-900),
					var(--color-neutral-800)
				);
			}
		}
	}
</style>
