<script lang="ts">
	import UniversalIcon from './UniversalIcon.svelte';

	interface MenuItem {
		label: string;
		href: string;
		icon?: string;
		children?: MenuItem[];
	}

	interface Props {
		items: MenuItem[];
	}

	let { items = [] }: Props = $props();

	// Track which menu items are expanded
	let expandedItems = $state<Set<string>>(new Set());

	function toggleExpand(label: string) {
		const newExpanded = new Set(expandedItems);
		if (newExpanded.has(label)) {
			newExpanded.delete(label);
		} else {
			newExpanded.add(label);
		}
		expandedItems = newExpanded;
	}

	function isExpanded(label: string): boolean {
		return expandedItems.has(label);
	}
</script>

<nav class="sidebar-menu">
	{#each items as item}
		<div class="menu-item-wrapper">
			{#if item.children && item.children.length > 0}
				<!-- Parent item with children -->
				<button
					class="menu-item parent"
					class:expanded={isExpanded(item.label)}
					onclick={() => toggleExpand(item.label)}
				>
					<div class="menu-item-content">
						{#if item.icon}
							<UniversalIcon icon={item.icon} size={18} />
						{:else}
							<div class="icon-placeholder"></div>
						{/if}
						<span class="label">{item.label}</span>
					</div>
					<svg
						class="chevron"
						class:rotated={isExpanded(item.label)}
						width="14"
						height="14"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M4 6L8 10L12 6"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<!-- Children submenu with smooth animation -->
				<div class="submenu-wrapper" class:expanded={isExpanded(item.label)}>
					<div class="submenu">
						{#each item.children as child}
							<a href={child.href} class="menu-item child">
								<div class="menu-item-content">
									{#if child.icon}
										<UniversalIcon icon={child.icon} size={14} />
									{:else}
										<div class="icon-placeholder small"></div>
									{/if}
									<span class="label">{child.label}</span>
								</div>
							</a>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Simple menu item without children -->
				<a href={item.href} class="menu-item">
					<div class="menu-item-content">
						{#if item.icon}
							<UniversalIcon icon={item.icon} size={18} />
						{:else}
							<div class="icon-placeholder"></div>
						{/if}
						<span class="label">{item.label}</span>
					</div>
				</a>
			{/if}
		</div>
	{/each}
</nav>

<style>
	.sidebar-menu {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.menu-item-wrapper {
		display: flex;
		flex-direction: column;
	}

	.menu-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: all 0.15s ease;
		cursor: pointer;
		border: none;
		border-radius: var(--radius-sm, 0.375rem);
		background: transparent;
		padding: 0.625rem 0.75rem;
		width: 100%;
		color: var(--color-neutral-700);
		font-weight: 500;
		font-size: 0.8rem;
		text-decoration: none;
	}

	.menu-item:hover {
		background-color: var(--color-neutral-300);
		color: var(--color-neutral-900);
	}

	.menu-item.child {
		padding: 0.5rem 0.625rem 0.5rem 2.25rem;
		color: var(--color-neutral-500);
		font-weight: 400;
		font-size: 0.75rem;
	}

	.menu-item.child:hover {
		color: var(--color-neutral-800);
	}

	.menu-item-content {
		display: flex;
		flex: 1;
		align-items: center;
		gap: 0.625rem;
	}

	.icon-placeholder {
		flex-shrink: 0;
		border-radius: 50%;
		background-color: var(--color-neutral-400);
		width: 18px;
		height: 18px;
	}

	.icon-placeholder.small {
		background-color: var(--color-neutral-400);
		width: 14px;
		height: 14px;
	}

	.label {
		flex: 1;
		line-height: 1.3;
		text-align: left;
	}

	.chevron {
		flex-shrink: 0;
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		color: var(--color-neutral-500);
	}

	.chevron.rotated {
		transform: rotate(180deg);
	}

	/* Smooth submenu animation wrapper using CSS Grid */
	.submenu-wrapper {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.submenu-wrapper.expanded {
		grid-template-rows: 1fr;
	}

	.submenu {
		display: flex;
		flex-direction: column;
		gap: 0.0625rem;
		padding-top: 0.125rem;
		min-height: 0;
	}

	/* Dark mode styles */
	:global(.dark) .menu-item {
		color: var(--color-neutral-300);
	}

	:global(.dark) .menu-item:hover {
		background-color: var(--color-neutral-700);
		color: var(--color-neutral-100);
	}

	:global(.dark) .menu-item.child {
		color: var(--color-neutral-500);
	}

	:global(.dark) .menu-item.child:hover {
		color: var(--color-neutral-200);
	}

	:global(.dark) .icon-placeholder {
		background-color: var(--color-neutral-600);
	}

	:global(.dark) .icon-placeholder.small {
		background-color: var(--color-neutral-600);
	}

	:global(.dark) .chevron {
		color: var(--color-neutral-500);
	}
</style>
