<script lang="ts">
	import { getThemeManager } from '$lib/stores/themeStore.svelte';
	import { Sun } from 'lucide-svelte';
	import { Moon } from 'lucide-svelte';

	const theme = getThemeManager();
	function toggleTheme() {
		theme.setMode(theme.isDark ? 'light' : 'dark');
	}
</script>

<label for="toggle">
	<div class={['toggle', theme.isDark ? 'enabled' : 'disabled']}>
		<span class="hidden">
			{theme.isDark ? 'Enable Light Mode' : 'Enable Dark Mode'}
		</span>
		<div class="icons">
			<Sun />
			<Moon />
		</div>
		<input
			id="toggle"
			name="toggle"
			type="checkbox"
			checked={!theme.isDark}
			onclick={toggleTheme}
		/>
	</div>
</label>

<style>
	:root {
		--transition: 0.5s ease;
	}
	.toggle {
		position: relative;
		transition: background var(--transition);
		cursor: pointer;
		border-radius: 10px;
		background: var(--color-taskbar-background);
		padding: 1px;
		width: 42px;
		height: 20px;
	}

	.toggle::before {
		display: block;
		position: absolute;
		transform: translate(0);
		z-index: 2;
		transition:
			transform var(--transition),
			background var(--transition);
		border-radius: 11px;
		background: var(--color-foreground);
		aspect-ratio: 1;
		width: 18px;
		/* height: 41px; */
		content: '';
	}

	.toggle.enabled::before {
		transform: translateX(22px);
	}

	.toggle input {
		position: absolute;
		top: 0;
		opacity: 0;
	}

	.toggle .icons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0 5px;
		height: 100%;
	}

	:global(.toggle .icons svg) {
		z-index: 0;
		fill: var(--color-taskbar-background);
		aspect-ratio: 1;
		width: 12px;
	}
</style>
