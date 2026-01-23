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
	<div class="settings-content-wrapper">
		<div class="settings-content max-w-3xl">
			<AppContentArea appName="settings" component={activeComponent} props={componentProps} />
		</div>
	</div>
</div>

<style>
	.settings-app {
		display: flex;
		flex-direction: row;
		height: 100%;
		overflow: hidden;
	}

	.settings-content-wrapper {
		flex: 1;
		padding: 24px;
		overflow-y: auto;

		/* Scrollbar styling */
		&::-webkit-scrollbar {
			width: 6px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			border-radius: 3px;
			background: var(--color-neutral-300);
		}

		&::-webkit-scrollbar-thumb:hover {
			background: var(--color-neutral-400);
		}
	}

	:global(.dark) .settings-content-wrapper {
		&::-webkit-scrollbar-thumb {
			background: var(--color-neutral-600);
		}

		&::-webkit-scrollbar-thumb:hover {
			background: var(--color-neutral-500);
		}
	}

	.settings-content :global {
		/* Szekciók */
		section {
			margin-bottom: 1.5rem;
			border-bottom: 1px solid var(--color-neutral-200);
			padding-bottom: 1.5rem;

			&:last-child {
				margin-bottom: 0;
				border-bottom: none;
				padding-bottom: 0;
			}
		}

		h2 {
			margin-bottom: 2rem;
			color: var(--color-neutral-900);
			font-weight: 600;
			font-size: 1.5rem;
			letter-spacing: -0.025em;
		}
	}

	:global(.dark) .settings-content :global {
		border-bottom-color: var(--color-neutral-800);

		h2 {
			color: var(--color-neutral-100);
		}
	}
</style>
