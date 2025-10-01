<!-- src/lib/components/Window.svelte -->
<script lang="ts">
	import { getWindowManager, type WindowState } from '$lib/stores/windowStore.svelte';

	let { windowState }: { windowState: WindowState } = $props();

	const windowManager = getWindowManager();

	let dragStartX = 0;
	let dragStartY = 0;
	let isDragging = false;

	function handleMouseDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.window-controls')) return;

		windowManager.activateWindow(windowState.id);
		isDragging = true;
		dragStartX = e.clientX - windowState.position.x;
		dragStartY = e.clientY - windowState.position.y;

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
</style>
