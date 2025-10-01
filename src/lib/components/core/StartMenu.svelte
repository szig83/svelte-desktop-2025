<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	let { show } = $props();
</script>

{#if show}
	<div id="startMenu" transition:fly={{ y: 20, duration: 200 }}>
		<div class="start-menu-content">Start menü</div>
	</div>
{/if}

<style>
	#startMenu {
		display: flex;
		position: fixed;
		bottom: var(--taskbar-height, 100px);
		left: var(--startmenu-margin, 16px);
		z-index: calc(var(--taskbar-z-index) - 1);
		padding-bottom: var(--startmenu-margin, 16px);
		width: var(--startmenu-width, 300px);
		height: var(--startmenu-height, 300px);
		overflow: hidden;
		color: #fff;
	}

	.start-menu-content {
		box-shadow: var(--default-shadow);
		border-radius: var(--default-border-radius, 0);
		background-color: var(--startmenu-bg);
		padding: 8px;
		width: 100%;
		overflow: auto;

		&::after {
			position: absolute;
			bottom: 0;
			left: calc(var(--startmenu-margin, 16px) + 15px);
			transform: translateX(-50%);
			clip-path: polygon(50% 100%, 0 0, 100% 0);
			background: var(--startmenu-bg);
			width: 20px;
			height: var(--startmenu-margin, 16px);
			content: '';
		}
	}
</style>
