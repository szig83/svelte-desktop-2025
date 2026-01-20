<script lang="ts">
	import type { MenuItem } from '$lib/types/menu';
	import { AppSideBar, AppSideBarMenu, AppContentArea } from '$lib/components/shared';
	import menuItems from './menu.json';
	import { getContext } from 'svelte';

	// Settings betöltése a kontextusból
	const settings = getContext('settings');

	// Állapotkezelés
	let activeMenuItem = $state<string | null>(null);
	let activeComponent = $state<string | null>(null);
	let componentProps = $state<Record<string, any>>({});

	// Alapértelmezett menüpont beállítása
	$effect(() => {
		const defaultItem = findDefaultMenuItem(menuItems);
		if (defaultItem) {
			handleMenuItemClick(defaultItem);
		}
	});

	function findDefaultMenuItem(items: MenuItem[]): MenuItem | null {
		for (const item of items) {
			if (item.component) {
				return item;
			}
			if (item.children) {
				const found = findDefaultMenuItem(item.children);
				if (found) return found;
			}
		}
		return null;
	}

	function handleMenuItemClick(item: MenuItem) {
		activeMenuItem = item.href;
		activeComponent = item.component || null;
		// Mindig átadjuk a settings-et a komponensnek
		componentProps = { ...item.props, data: { settings } };
	}
</script>

<div class="settings-app">
	<AppSideBar>
		<AppSideBarMenu
			items={menuItems}
			activeHref={activeMenuItem ?? undefined}
			onItemClick={handleMenuItemClick}
		/>
	</AppSideBar>
	<div class="settings-content">
		<AppContentArea appName="settings" component={activeComponent} props={componentProps} />
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
		background: var(--color-neutral-300);
	}

	.settings-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-400);
	}

	:global(.dark) .settings-content::-webkit-scrollbar-thumb {
		background: var(--color-neutral-600);
	}

	:global(.dark) .settings-content::-webkit-scrollbar-thumb:hover {
		background: var(--color-neutral-500);
	}
</style>
