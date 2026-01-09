<script lang="ts">
	import ColorSchemePicker from '$lib/components/ui/ColorSchemePicker.svelte';
	import { AppSideBar } from '$lib/components/shared';

	/*function scrollToSection(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}*/
</script>

<div class="settings-app">
	<AppSideBar>oldalsó menü</AppSideBar>
	<div class="settings-content">
		<ColorSchemePicker />
	</div>
</div>

<style>
	.settings-app {
		display: flex;
		flex-direction: row;
		height: 100%;
		overflow: hidden;
	}

	.settings-content {
		flex: 1;
		padding: 24px;
		overflow-y: auto;
	}

	/* Scrollbar styling */
	.settings-content::-webkit-scrollbar {
		width: 8px;
	}

	.settings-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.settings-content::-webkit-scrollbar-thumb {
		border-radius: 4px;
		background: #d1d5db;
	}

	.settings-content::-webkit-scrollbar-thumb:hover {
		background: #9ca3af;
	}

	:global(#desktop.dark) .settings-content::-webkit-scrollbar-thumb {
		background: #4b5563;
	}

	:global(#desktop.dark) .settings-content::-webkit-scrollbar-thumb:hover {
		background: #6b7280;
	}
</style>
