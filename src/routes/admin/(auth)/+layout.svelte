<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../appAdmin.css';
	let { children, data } = $props();
</script>

<div class="auth">
	{@render children()}
</div>

<style>
	.auth {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
	}
</style>
