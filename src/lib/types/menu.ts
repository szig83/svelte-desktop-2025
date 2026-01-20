/**
 * MenuItem interface for app navigation menus.
 * Used across all apps for consistent menu structure.
 */
export interface MenuItem {
	/** Display label for the menu item. */
	label: string;

	/** Unique identifier/href for the menu item (e.g., "#appearance"). */
	href: string;

	/** Optional icon name (Lucide/Phosphor). */
	icon?: string;

	/** Optional component name to load (from app's components folder). */
	component?: string;

	/** Optional props to pass to the loaded component. */
	props?: Record<string, unknown>;

	/** Optional child menu items for nested menus. */
	children?: MenuItem[];

	/** If true, renders as a visual separator instead of a clickable item. */
	separator?: boolean;
}

/**
 * Event payload for menu item click events.
 */
export interface MenuItemClickEvent {
	item: MenuItem;
	event: MouseEvent;
}
