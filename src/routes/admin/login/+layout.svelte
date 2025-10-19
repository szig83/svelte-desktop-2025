<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import './login.css';
	let { children, data } = $props();
</script>

<h1>Login layout</h1>
{@render children()}
