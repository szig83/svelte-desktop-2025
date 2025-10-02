<!-- src/lib/components/Window.svelte -->
<script lang="ts">
	import { getWindowManager, type WindowState } from '$lib/stores/windowStore.svelte';
	let { windowState }: { windowState: WindowState } = $props();
	import WindowControlButton from './WindowControlButton.svelte';

	const windowManager = getWindowManager();

	// Minimum ablak méretek
	const MIN_WINDOW_WIDTH = 300;
	const MIN_WINDOW_HEIGHT = 200;

	let dragStartX = 0;
	let dragStartY = 0;
	let isDragging = $state(false);

	let isResizing = $state(false);
	let resizeDirection = '';
	let resizeStartX = 0;
	let resizeStartY = 0;
	let resizeStartWidth = 0;
	let resizeStartHeight = 0;
	let resizeStartLeft = 0;
	let resizeStartTop = 0;

	function handleMouseDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.window-controls')) return;

		e.preventDefault();
		windowManager.activateWindow(windowState.id);
		isDragging = true;
		dragStartX = e.clientX - windowState.position.x;
		dragStartY = e.clientY - windowState.position.y;

		// Letiltjuk a szövegkijelölést mozgatás közben
		document.body.style.userSelect = 'none';

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || windowState.isMaximized) return;

		// Workspace méretek
		const workspace = document.getElementById('workspace');
		if (!workspace) return;

		const workspaceRect = workspace.getBoundingClientRect();
		const workspaceWidth = workspaceRect.width;
		const workspaceHeight = workspaceRect.height;

		// Új pozíció számítása
		let newX = e.clientX - dragStartX;
		let newY = e.clientY - dragStartY;

		// Korlátozás a workspace határain belülre
		newX = Math.max(0, Math.min(newX, workspaceWidth - windowState.size.width));
		newY = Math.max(0, Math.min(newY, workspaceHeight - windowState.size.height));

		windowManager.updatePosition(windowState.id, {
			x: newX,
			y: newY
		});
	}

	function handleMouseUp() {
		isDragging = false;

		// Visszaállítjuk a szövegkijelölést
		document.body.style.userSelect = '';

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	function handleDoubleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.window-controls')) return;
		maximize();
	}

	function close() {
		windowManager.closeWindow(windowState.id);
	}

	function minimize() {
		windowManager.minimizeWindow(windowState.id);
	}

	function maximize() {
		windowManager.maximizeWindow(windowState.id);
	}

	function handleResizeStart(e: MouseEvent, direction: string) {
		if (windowState.isMaximized || isResizing) return;

		e.preventDefault();
		e.stopPropagation();
		windowManager.activateWindow(windowState.id);

		isResizing = true;
		resizeDirection = direction;
		resizeStartX = e.clientX;
		resizeStartY = e.clientY;
		resizeStartWidth = windowState.size.width;
		resizeStartHeight = windowState.size.height;
		resizeStartLeft = windowState.position.x;
		resizeStartTop = windowState.position.y;

		// Letiltjuk a szövegkijelölést méretezés közben
		document.body.style.userSelect = 'none';
		// Letiltjuk a kurzor változását méretezés közben
		document.body.style.cursor = getCursorForDirection(direction);

		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
	}

	function getCursorForDirection(direction: string): string {
		if (direction === 'n' || direction === 's') return 'ns-resize';
		if (direction === 'e' || direction === 'w') return 'ew-resize';
		if (direction === 'ne' || direction === 'sw') return 'nesw-resize';
		if (direction === 'nw' || direction === 'se') return 'nwse-resize';
		return 'default';
	}

	function handleResizeMove(e: MouseEvent) {
		if (!isResizing) return;

		const deltaX = e.clientX - resizeStartX;
		const deltaY = e.clientY - resizeStartY;

		let newWidth = resizeStartWidth;
		let newHeight = resizeStartHeight;
		let newLeft = resizeStartLeft;
		let newTop = resizeStartTop;

		// Workspace méretek (a taskbar nélküli terület)
		const workspace = document.getElementById('workspace');
		if (!workspace) return;

		const workspaceRect = workspace.getBoundingClientRect();
		const workspaceWidth = workspaceRect.width;
		const workspaceHeight = workspaceRect.height;

		// Vízszintes méretezés
		if (resizeDirection.includes('e')) {
			// Jobb oldal: ne menjen túl a workspace jobb szélén
			const maxWidth = workspaceWidth - resizeStartLeft;
			newWidth = Math.max(MIN_WINDOW_WIDTH, Math.min(maxWidth, resizeStartWidth + deltaX));
		} else if (resizeDirection.includes('w')) {
			// Bal oldal: ne menjen túl a workspace bal szélén (0) és tartsa a minimum méretet
			const potentialWidth = resizeStartWidth - deltaX;
			const potentialLeft = resizeStartLeft + deltaX;

			if (potentialLeft < 0) {
				// Ha túlmenne a bal szélen, állítsuk be a maximális méretet
				newWidth = resizeStartLeft + resizeStartWidth;
				newLeft = 0;
			} else if (potentialWidth >= MIN_WINDOW_WIDTH) {
				// Normál méretezés, ha a minimum méret felett vagyunk
				newWidth = potentialWidth;
				newLeft = potentialLeft;
			} else {
				// Ha elérnénk a minimum méretet, rögzítsük azt és a pozíciót
				newWidth = MIN_WINDOW_WIDTH;
				newLeft = resizeStartLeft + resizeStartWidth - MIN_WINDOW_WIDTH;
			}
		}

		// Függőleges méretezés
		if (resizeDirection.includes('s')) {
			// Alsó oldal: ne menjen túl a workspace alján
			const maxHeight = workspaceHeight - resizeStartTop;
			newHeight = Math.max(MIN_WINDOW_HEIGHT, Math.min(maxHeight, resizeStartHeight + deltaY));
		} else if (resizeDirection.includes('n')) {
			// Felső oldal: ne menjen túl a workspace tetején (0) és tartsa a minimum méretet
			const potentialHeight = resizeStartHeight - deltaY;
			const potentialTop = resizeStartTop + deltaY;

			if (potentialTop < 0) {
				// Ha túlmenne a felső szélen, állítsuk be a maximális méretet
				newHeight = resizeStartTop + resizeStartHeight;
				newTop = 0;
			} else if (potentialHeight >= MIN_WINDOW_HEIGHT) {
				// Normál méretezés, ha a minimum méret felett vagyunk
				newHeight = potentialHeight;
				newTop = potentialTop;
			} else {
				// Ha elérnénk a minimum méretet, rögzítsük azt és a pozíciót
				newHeight = MIN_WINDOW_HEIGHT;
				newTop = resizeStartTop + resizeStartHeight - MIN_WINDOW_HEIGHT;
			}
		}

		windowManager.updateSize(windowState.id, { width: newWidth, height: newHeight });
		windowManager.updatePosition(windowState.id, { x: newLeft, y: newTop });
	}

	function handleResizeEnd() {
		isResizing = false;
		resizeDirection = '';

		// Visszaállítjuk a szövegkijelölést és a kurzort
		document.body.style.userSelect = '';
		document.body.style.cursor = '';

		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
	}

	let windowStyle = $derived.by(() => {
		const left = windowState.isMaximized ? '0' : `${windowState.position.x}px`;
		const top = windowState.isMaximized ? '0' : `${windowState.position.y}px`;
		const width = windowState.isMaximized ? '100%' : `${windowState.size.width}px`;
		const height = windowState.isMaximized ? '100%' : `${windowState.size.height}px`;
		const zIndex = windowState.zIndex;
		return `left: ${left}; top: ${top}; width: ${width}; height: ${height}; z-index: ${zIndex};`;
	});

</script>

<div
	class={[
		'window',
		windowState.isActive ? 'active' : '',
		windowState.isMaximized ? 'maximized' : '',
		windowState.isMinimized ? 'minimized' : '',
		isResizing ? 'resizing' : ''
	]}
	style={windowStyle}
	onclick={() => windowManager.activateWindow(windowState.id)}
	role="button"
	tabindex="0"
>
	<div
		class="window-header"
		onmousedown={handleMouseDown}
		ondblclick={handleDoubleClick}
		role="button"
		tabindex="0"
	>
		<div class="window-title">{windowState.title}</div>
		<div class="window-controls">
			<WindowControlButton controlType="minimize" onClick={minimize} />
			<WindowControlButton
				controlType={windowState.isMaximized ? 'restore' : 'maximize'}
				onClick={maximize}
			/>
			<WindowControlButton controlType="close" onClick={close} />
		</div>
	</div>

	<div class="window-content">
		{#if windowState.isLoading}
			<div class="loading">Betöltés...</div>
		{:else if windowState.component}
			{@const Component = windowState.component}
			<Component />
		{:else}
			<div class="error">Nem sikerült betölteni a komponenst</div>
		{/if}
	</div>

	<!-- Resize handles -->
	{#if !windowState.isMaximized}
		<div
			class="resize-handle resize-n"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'n')}
			role="button"
			tabindex="0"
			aria-label="Resize window"
		></div>
		<div
			class="resize-handle resize-s"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 's')}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-e"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'e')}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-w"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'w')}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-ne"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'ne')}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-nw"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'nw')}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-se"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'se')}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-sw"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'sw')}
			role="button"
			tabindex="0"
		></div>
	{/if}
</div>

<style>
	.window {
		display: flex;
		position: absolute;
		flex-direction: column;
		transition: box-shadow 0.2s;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		border-radius: var(--default-border-radius, 8px);
		/*background: white;*/
	}

	.window.minimized {
		display: none;
	}

	:global(.window:not(.active)) {
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	:global(.window.active) {
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
	}

	.window.maximized {
		border-radius: 0;
	}

	.window-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: move;
		border-bottom: 1px solid #d0d0d0;
		border-radius: 8px 8px 0 0;
		background: #d9d9d9;
		padding: 8px 12px;
		user-select: none;
	}

	.window.maximized .window-header {
		border-radius: 0;
	}

	.window:not(.active) .window-header {
		background: linear-gradient(180deg, #fafafa 0%, #f0f0f0 100%);
	}

	.window-title {
		color: #333;
		font-weight: 600;
		font-size: 14px;
	}

	.window:not(.active) .window-title {
		color: #888;
	}

	.window-controls {
		display: flex;
		gap: 8px;
	}

	.window-content {
		flex: 1;
		backdrop-filter: blur(10px); /* Blur effekt mértéke (px-ben) */
		border-bottom-right-radius: var(--default-border-radius, 8px);
		border-bottom-left-radius: var(--default-border-radius, 8px);
		background-color: rgba(255, 255, 255, 0.95);
		padding: 16px;
		overflow: auto;
	}

	.loading,
	.error {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		color: #666;
	}

	.error {
		color: #d32f2f;
	}

	/* Resize handles */
	.resize-handle {
		position: absolute;
		z-index: 10;
		user-select: none;
	}

	/* Sarkok - ezek magasabb prioritásúak, ezért előbb vannak */
	.resize-ne,
	.resize-nw,
	.resize-se,
	.resize-sw {
		z-index: 12;
		width: 16px;
		height: 16px;
	}

	.resize-ne {
		top: 0;
		right: 0;
		cursor: nesw-resize;
	}

	.resize-nw {
		top: 0;
		left: 0;
		cursor: nwse-resize;
	}

	.resize-se {
		right: 0;
		bottom: 0;
		cursor: nwse-resize;
	}

	.resize-sw {
		bottom: 0;
		left: 0;
		cursor: nesw-resize;
	}

	/* Élek - kisebb z-index, hogy a sarkok felülírják őket */
	.resize-n,
	.resize-s {
		right: 16px;
		left: 16px;
		z-index: 11;
		cursor: ns-resize;
		height: 6px;
	}

	.resize-n {
		top: 0;
	}

	.resize-s {
		bottom: 0;
	}

	.resize-e,
	.resize-w {
		top: 16px;
		bottom: 16px;
		z-index: 11;
		cursor: ew-resize;
		width: 6px;
	}

	.resize-e {
		right: 0;
	}

	.resize-w {
		left: 0;
	}
</style>
