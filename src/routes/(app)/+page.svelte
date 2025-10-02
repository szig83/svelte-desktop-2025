<script lang="ts">
	import { getWindowManager } from '$lib/stores/windowStore.svelte';
	const windowManager = getWindowManager();
</script>

<button
	onclick={() => {
		console.log(windowManager.windows);
	}}>Katt</button
>
