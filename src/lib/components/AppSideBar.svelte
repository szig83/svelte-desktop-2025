<script lang="ts">
	let { children } = $props();
</script>

<div class="app-sidebar">
	{@render children()}
</div>

<style>
	.app-sidebar {
		flex: 0 0 250px;
		border-radius: var(--border-radius);
		background-color: var(--neutral-100);
		padding: 1rem;
	}

	:global {
		.dark {
			.app-sidebar {
				background-color: var(--neutral-900);
			}
		}
	}
</style>
