<!-- src/lib/components/Window.svelte -->
<script lang="ts">
	import { getWindowManager, type WindowState } from '$lib/stores/windowStore.svelte';

	let { windowState }: { windowState: WindowState } = $props();

	const windowManager = getWindowManager();

	let dragStartX = 0;
	let dragStartY = 0;
	let isDragging = false;

	let isResizing = false;
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

		windowManager.updatePosition(windowState.id, {
			x: e.clientX - dragStartX,
			y: e.clientY - dragStartY
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
		if (windowState.isMaximized) return;

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

		document.addEventListener('mousemove', handleResizeMove);
		document.addEventListener('mouseup', handleResizeEnd);
	}

	function handleResizeMove(e: MouseEvent) {
		if (!isResizing) return;

		const deltaX = e.clientX - resizeStartX;
		const deltaY = e.clientY - resizeStartY;

		let newWidth = resizeStartWidth;
		let newHeight = resizeStartHeight;
		let newLeft = resizeStartLeft;
		let newTop = resizeStartTop;

		const minWidth = 300;
		const minHeight = 200;

		// Vízszintes méretezés
		if (resizeDirection.includes('e')) {
			newWidth = Math.max(minWidth, resizeStartWidth + deltaX);
		} else if (resizeDirection.includes('w')) {
			const potentialWidth = resizeStartWidth - deltaX;
			if (potentialWidth >= minWidth) {
				newWidth = potentialWidth;
				newLeft = resizeStartLeft + deltaX;
			}
		}

		// Függőleges méretezés
		if (resizeDirection.includes('s')) {
			newHeight = Math.max(minHeight, resizeStartHeight + deltaY);
		} else if (resizeDirection.includes('n')) {
			const potentialHeight = resizeStartHeight - deltaY;
			if (potentialHeight >= minHeight) {
				newHeight = potentialHeight;
				newTop = resizeStartTop + deltaY;
			}
		}

		windowManager.updateSize(windowState.id, { width: newWidth, height: newHeight });
		windowManager.updatePosition(windowState.id, { x: newLeft, y: newTop });
	}

	function handleResizeEnd() {
		isResizing = false;
		resizeDirection = '';
		
		// Visszaállítjuk a szövegkijelölést
		document.body.style.userSelect = '';
		
		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);
	}
</script>

<div
	class="window"
	class:active={windowState.isActive}
	class:maximized={windowState.isMaximized}
	class:minimized={windowState.isMinimized}
	style:left={windowState.isMaximized ? '0' : `${windowState.position.x}px`}
	style:top={windowState.isMaximized ? '0' : `${windowState.position.y}px`}
	style:width={windowState.isMaximized ? '100vw' : `${windowState.size.width}px`}
	style:height={windowState.isMaximized ? '100vh' : `${windowState.size.height}px`}
	style:z-index={windowState.zIndex}
	onclick={() => windowManager.activateWindow(windowState.id)}
>
	<div class="window-header" onmousedown={handleMouseDown} ondblclick={handleDoubleClick}>
		<div class="window-title">{windowState.title}</div>
		<div class="window-controls">
			<button onclick={minimize} aria-label="Minimize">−</button>
			<button onclick={maximize} aria-label="Maximize">
				{windowState.isMaximized ? '❐' : '□'}
			</button>
			<button onclick={close} class="close" aria-label="Close">×</button>
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
		<div class="resize-handle resize-n" onmousedown={(e) => handleResizeStart(e, 'n')}></div>
		<div class="resize-handle resize-s" onmousedown={(e) => handleResizeStart(e, 's')}></div>
		<div class="resize-handle resize-e" onmousedown={(e) => handleResizeStart(e, 'e')}></div>
		<div class="resize-handle resize-w" onmousedown={(e) => handleResizeStart(e, 'w')}></div>
		<div class="resize-handle resize-ne" onmousedown={(e) => handleResizeStart(e, 'ne')}></div>
		<div class="resize-handle resize-nw" onmousedown={(e) => handleResizeStart(e, 'nw')}></div>
		<div class="resize-handle resize-se" onmousedown={(e) => handleResizeStart(e, 'se')}></div>
		<div class="resize-handle resize-sw" onmousedown={(e) => handleResizeStart(e, 'sw')}></div>
	{/if}
</div>

<style>
	.window {
		display: flex;
		position: fixed;
		flex-direction: column;
		transition: box-shadow 0.2s;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
		border-radius: 8px;
		background: white;
	}

	.window.minimized {
		display: none;
	}

	.window:not(.active) {
		opacity: 0.95;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.window.active {
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
		background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
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

	.window-controls button {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: background 0.2s;
		cursor: pointer;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border: none;
		border-radius: 4px;
		background: #fff;
		width: 28px;
		height: 28px;
		font-size: 18px;
	}

	.window-controls button:hover {
		background: #e8e8e8;
	}

	.window-controls button.close:hover {
		background: #ff5f57;
		color: white;
	}

	.window-content {
		flex: 1;
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

	/* Élek */
	.resize-n,
	.resize-s {
		right: 8px;
		left: 8px;
		cursor: ns-resize;
		height: 8px;
	}

	.resize-n {
		top: -4px;
	}

	.resize-s {
		bottom: -4px;
	}

	.resize-e,
	.resize-w {
		top: 8px;
		bottom: 8px;
		cursor: ew-resize;
		width: 8px;
	}

	.resize-e {
		right: -4px;
	}

	.resize-w {
		left: -4px;
	}

	/* Sarkok */
	.resize-ne,
	.resize-nw,
	.resize-se,
	.resize-sw {
		width: 12px;
		height: 12px;
	}

	.resize-ne {
		top: -4px;
		right: -4px;
		cursor: nesw-resize;
	}

	.resize-nw {
		top: -4px;
		left: -4px;
		cursor: nwse-resize;
	}

	.resize-se {
		right: -4px;
		bottom: -4px;
		cursor: nwse-resize;
	}

	.resize-sw {
		bottom: -4px;
		left: -4px;
		cursor: nesw-resize;
	}
</style>
