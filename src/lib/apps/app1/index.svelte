<script lang="ts" context="module">
	export const meta = {
		title: 'Felhasználók',
		window: {
			width: 600, // px
			height: 400 // px
			// Alternatívák:
			// width: '50%',     // százalék
			// height: '60%',    // százalék
			// fullscreen: true  // teljes képernyő
		},
		helpId: 'app1Help'
	};
</script>

<script lang="ts">
	import { getTest } from './app.remote';
	const x = getTest();
</script>

<div>
	<h1>App 1</h1>

	{#if x.error}
		<p>oops!</p>
	{:else if x.loading}
		<p>loading...</p>
	{:else}
		{x.current?.test}
	{/if}
</div>
