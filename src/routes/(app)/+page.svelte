<script lang="ts">
	//import { getWindowManager } from '$lib/stores/windowStore.svelte';
	//const windowManager = getWindowManager();
</script>

<!-- <button
	onclick={() => {
		console.log(windowManager.windows);
	}}>Katt</button
>-->

<style>
	.div1,
	.div2 {
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--brand-bg);
		aspect-ratio: 1;
		width: 300px;
		color: var(--brand-text);
		&:hover {
			background-color: var(--brand-bg-hover);
		}
	}

	.div2 {
		background-color: var(--accent-bg);
		color: var(--accent-text);
		&:hover {
			background-color: var(--accent-bg-hover);
		}
	}
</style>
