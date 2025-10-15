<!--
 Ablak komponens.
 Ez a komponens felel az egyes ablakok felépítésért, műveletekért.
 -->
<script lang="ts">
	import { setContext } from 'svelte';
	import { type AppContext, APP_CONTEXT_KEY } from '$lib/services/appContext';
	import { getWindowManager, type WindowState } from '$lib/stores/windowStore.svelte';
	import WindowControlButton from './WindowControlButton.svelte';

	let { windowState }: { windowState: WindowState } = $props();
	const windowManager = getWindowManager();

	// App kontextus beállítás a gyerek komponensekhez.
	const appContext: AppContext = {
		parameters: windowState.parameters || {},
		windowId: windowState.id
	};
	setContext(APP_CONTEXT_KEY, appContext);

	// Minimum és maximum ablak méretek
	const MIN_WINDOW_WIDTH = windowState.minSize.width;
	const MIN_WINDOW_HEIGHT = windowState.minSize.height;
	const MAX_WINDOW_WIDTH = windowState.maxSize.width;
	const MAX_WINDOW_HEIGHT = windowState.maxSize.height;
	const WORKSPACE_PADDING = 0;

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

	/**
	 * Ablak mozgatás kezelése (gomb lenyomás)
	 * @param e Egér esemény
	 */
	function handleMouseDown(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.window-controls')) return;

		e.preventDefault();
		windowManager.activateWindow(windowState.id);
		isDragging = true;
		dragStartX = e.clientX - windowState.position.x;
		dragStartY = e.clientY - windowState.position.y;

		// Szövegkijeölés tiltása mozgatás közben
		document.body.style.userSelect = 'none';

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
	}

	/**
	 * Ablak mozgás kezelése (mozgatás)
	 * @param e Egér esemény
	 */
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

		// Korlátozás a workspace határain belülre (padding figyelembevételével)
		newX = Math.max(
			WORKSPACE_PADDING,
			Math.min(newX, workspaceWidth - windowState.size.width - WORKSPACE_PADDING)
		);
		newY = Math.max(
			WORKSPACE_PADDING,
			Math.min(newY, workspaceHeight - windowState.size.height - WORKSPACE_PADDING)
		);

		windowManager.updatePosition(windowState.id, {
			x: newX,
			y: newY
		});
	}

	/**
	 * Ablak mozgás befejezése (gomb elengedés)
	 */
	function handleMouseUp() {
		isDragging = false;

		// Visszaállítjuk a szövegkijelölést
		document.body.style.userSelect = '';

		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);
	}

	/**
	 * Dupla klikkelés az ablak fejlécén
	 * @param e
	 */
	function handleDoubleClick(e: MouseEvent) {
		if ((e.target as HTMLElement).closest('.window-controls')) return;
		if (!windowState.maximizable) return;
		maximize();
	}

	/**
	 * Ablak bezárás gomb esemény
	 */
	function close() {
		windowManager.closeWindow(windowState.id);
	}

	/**
	 * Ablak lekicsinyítés gomb esemény
	 */
	function minimize() {
		windowManager.minimizeWindow(windowState.id);
	}

	/**
	 * Ablak maximalizálás esemény
	 */
	function maximize() {
		windowManager.maximizeWindow(windowState.id);
	}

	/**
	 * Súgó gomb esemény
	 * @param helpId Súgó azonosító
	 */
	function help(helpId: number | undefined) {
		const helpApp = {
			title: 'Súgó',
			appName: 'help',
			icon: 'icon.svg',
			minSize: { width: 300, height: 300 },
			defaultSize: { width: 500, height: 500, maximized: false },
			allowMultiple: true
		};

		windowManager.openWindow(helpApp.appName, helpApp.title, helpApp, {
			helpId
		});
	}

	/**
	 * Ablak méretezés kezdet
	 * @param e Egér esemény
	 * @param direction Méretezés irány
	 */
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

	/**
	 * Kurzor változása méretezés során
	 * @param direction Méretezés irány
	 */
	function getCursorForDirection(direction: string): string {
		if (direction === 'n' || direction === 's') return 'ns-resize';
		if (direction === 'e' || direction === 'w') return 'ew-resize';
		if (direction === 'ne' || direction === 'sw') return 'nesw-resize';
		if (direction === 'nw' || direction === 'se') return 'nwse-resize';
		return 'default';
	}

	/**
	 * Ablak méretezés folyamatban
	 * @param e Egér esemény
	 */
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
			// Jobb oldal: ne menjen túl a workspace jobb szélén és a max méreten (padding figyelembevételével)
			const maxWidth = Math.min(
				workspaceWidth - resizeStartLeft - WORKSPACE_PADDING,
				MAX_WINDOW_WIDTH
			);
			newWidth = Math.max(MIN_WINDOW_WIDTH, Math.min(maxWidth, resizeStartWidth + deltaX));
		} else if (resizeDirection.includes('w')) {
			// Bal oldal: ne menjen túl a workspace bal szélén és a max méreten (padding figyelembevételével)
			const potentialWidth = resizeStartWidth - deltaX;
			const potentialLeft = resizeStartLeft + deltaX;

			if (potentialLeft < WORKSPACE_PADDING) {
				// Ha túlmenne a bal szélen, állítsuk be a maximális méretet (de max méret alatt)
				newWidth = Math.min(
					resizeStartLeft + resizeStartWidth - WORKSPACE_PADDING,
					MAX_WINDOW_WIDTH
				);
				newLeft = WORKSPACE_PADDING;
			} else if (potentialWidth >= MIN_WINDOW_WIDTH && potentialWidth <= MAX_WINDOW_WIDTH) {
				// Normál méretezés, ha a minimum és maximum méret között vagyunk
				newWidth = potentialWidth;
				newLeft = potentialLeft;
			} else if (potentialWidth > MAX_WINDOW_WIDTH) {
				// Ha túllépnénk a maximum méretet, rögzítsük azt
				newWidth = MAX_WINDOW_WIDTH;
				newLeft = resizeStartLeft + resizeStartWidth - MAX_WINDOW_WIDTH;
			} else {
				// Ha elérnénk a minimum méretet, rögzítsük azt és a pozíciót
				newWidth = MIN_WINDOW_WIDTH;
				newLeft = resizeStartLeft + resizeStartWidth - MIN_WINDOW_WIDTH;
			}
		}

		// Függőleges méretezés
		if (resizeDirection.includes('s')) {
			// Alsó oldal: ne menjen túl a workspace alján és a max méreten (padding figyelembevételével)
			const maxHeight = Math.min(
				workspaceHeight - resizeStartTop - WORKSPACE_PADDING,
				MAX_WINDOW_HEIGHT
			);
			newHeight = Math.max(MIN_WINDOW_HEIGHT, Math.min(maxHeight, resizeStartHeight + deltaY));
		} else if (resizeDirection.includes('n')) {
			// Felső oldal: ne menjen túl a workspace tetején és a max méreten (padding figyelembevételével)
			const potentialHeight = resizeStartHeight - deltaY;
			const potentialTop = resizeStartTop + deltaY;

			if (potentialTop < WORKSPACE_PADDING) {
				// Ha túlmenne a felső szélen, állítsuk be a maximális méretet (de max méret alatt)
				newHeight = Math.min(
					resizeStartTop + resizeStartHeight - WORKSPACE_PADDING,
					MAX_WINDOW_HEIGHT
				);
				newTop = WORKSPACE_PADDING;
			} else if (potentialHeight >= MIN_WINDOW_HEIGHT && potentialHeight <= MAX_WINDOW_HEIGHT) {
				// Normál méretezés, ha a minimum és maximum méret között vagyunk
				newHeight = potentialHeight;
				newTop = potentialTop;
			} else if (potentialHeight > MAX_WINDOW_HEIGHT) {
				// Ha túllépnénk a maximum méretet, rögzítsük azt
				newHeight = MAX_WINDOW_HEIGHT;
				newTop = resizeStartTop + resizeStartHeight - MAX_WINDOW_HEIGHT;
			} else {
				// Ha elérnénk a minimum méretet, rögzítsük azt és a pozíciót
				newHeight = MIN_WINDOW_HEIGHT;
				newTop = resizeStartTop + resizeStartHeight - MIN_WINDOW_HEIGHT;
			}
		}

		windowManager.updateSize(windowState.id, { width: newWidth, height: newHeight });
		windowManager.updatePosition(windowState.id, { x: newLeft, y: newTop });
	}

	/**
	 * Maximális elérhető méret ellenőrzése
	 * Ha automatikus/manuális méretezés során elérte az ablak a maximalizált állapotot, akkor az állapotát is átállítjuk.
	 */
	function checkIfMaximized() {
		// Workspace méretek
		const workspace = document.getElementById('workspace');
		if (!workspace) return false;

		const workspaceRect = workspace.getBoundingClientRect();
		const workspaceWidth = workspaceRect.width;
		const workspaceHeight = workspaceRect.height;

		// Maximális elérhető méret (padding figyelembevételével)
		const maxWidth = workspaceWidth - 2 * WORKSPACE_PADDING;
		const maxHeight = workspaceHeight - 2 * WORKSPACE_PADDING;

		// Ellenőrizzük, hogy az ablak pozíciója és mérete megfelel-e a maximalizált állapotnak
		const isAtMaxPosition =
			windowState.position.x <= WORKSPACE_PADDING && windowState.position.y <= WORKSPACE_PADDING;
		const isAtMaxSize =
			windowState.size.width >= maxWidth - 5 && // 5px tolerancia
			windowState.size.height >= maxHeight - 5;

		return isAtMaxPosition && isAtMaxSize;
	}

	/**
	 * Ablak méretezés befejezése
	 */
	function handleResizeEnd() {
		isResizing = false;
		resizeDirection = '';

		// Visszaállítjuk a szövegkijelölést és a kurzort
		document.body.style.userSelect = '';
		document.body.style.cursor = '';

		document.removeEventListener('mousemove', handleResizeMove);
		document.removeEventListener('mouseup', handleResizeEnd);

		// Ellenőrizzük, hogy elérte-e a maximális méretet
		if (!windowState.isMaximized && checkIfMaximized()) {
			windowManager.maximizeWindow(windowState.id);
		}
	}

	/**
	 * Ablak éleken dupla kattintás
	 * @param e Egér esemény
	 * @param direction Éle irány
	 */
	function handleEdgeDoubleClick(e: MouseEvent, direction: string) {
		if (windowState.isMaximized) return;

		e.preventDefault();
		e.stopPropagation();

		// Workspace méretek
		const workspace = document.getElementById('workspace');
		if (!workspace) return;

		const workspaceRect = workspace.getBoundingClientRect();
		const workspaceWidth = workspaceRect.width;
		const workspaceHeight = workspaceRect.height;

		let newWidth = windowState.size.width;
		let newHeight = windowState.size.height;
		let newLeft = windowState.position.x;
		let newTop = windowState.position.y;

		switch (direction) {
			case 'e': // Jobb él - nyújtás jobbra a workspace jobb széléig (max méret alatt)
				newWidth = Math.min(
					workspaceWidth - windowState.position.x - WORKSPACE_PADDING,
					MAX_WINDOW_WIDTH
				);
				break;
			case 'w': // Bal él - nyújtás balra a workspace bal széléig (max méret alatt)
			{
				const targetWidth = windowState.position.x + windowState.size.width - WORKSPACE_PADDING;
				newWidth = Math.min(targetWidth, MAX_WINDOW_WIDTH);
				// Pozíciót csak akkor változtatjuk, ha nem a max méret korlátozza
				if (newWidth === targetWidth) {
					newLeft = WORKSPACE_PADDING;
				} else {
					// Ha max méret korlátozza, számítsuk ki az új bal pozíciót
					newLeft = windowState.position.x + windowState.size.width - newWidth;
				}
			}
			break;
			case 's': // Alsó él - nyújtás lefelé a workspace aljáig (max méret alatt)
				newHeight = Math.min(
					workspaceHeight - windowState.position.y - WORKSPACE_PADDING,
					MAX_WINDOW_HEIGHT
				);
				break;
			case 'n': // Felső él - nyújtás felfelé a workspace tetejéig (max méret alatt)
			{
				const targetHeight = windowState.position.y + windowState.size.height - WORKSPACE_PADDING;
				newHeight = Math.min(targetHeight, MAX_WINDOW_HEIGHT);
				// Pozíciót csak akkor változtatjuk, ha nem a max méret korlátozza
				if (newHeight === targetHeight) {
					newTop = WORKSPACE_PADDING;
				} else {
					// Ha max méret korlátozza, számítsuk ki az új felső pozíciót
					newTop = windowState.position.y + windowState.size.height - newHeight;
				}
			}
			break;
			case 'ne': // Jobb felső sarok - nyújtás jobbra és felfelé (max méret alatt)
			{
				newWidth = Math.min(
					workspaceWidth - windowState.position.x - WORKSPACE_PADDING,
					MAX_WINDOW_WIDTH
				);
				const targetHeight = windowState.position.y + windowState.size.height - WORKSPACE_PADDING;
				newHeight = Math.min(targetHeight, MAX_WINDOW_HEIGHT);
				// Pozíciót csak akkor változtatjuk, ha nem a max méret korlátozza
				if (newHeight === targetHeight) {
					newTop = WORKSPACE_PADDING;
				} else {
					newTop = windowState.position.y + windowState.size.height - newHeight;
				}
			}
			break;
			case 'nw': // Bal felső sarok - nyújtás balra és felfelé (max méret alatt)
			{
				const targetWidth = windowState.position.x + windowState.size.width - WORKSPACE_PADDING;
				newWidth = Math.min(targetWidth, MAX_WINDOW_WIDTH);
				const targetHeight = windowState.position.y + windowState.size.height - WORKSPACE_PADDING;
				newHeight = Math.min(targetHeight, MAX_WINDOW_HEIGHT);
				// Pozíciókat csak akkor változtatjuk, ha nem a max méret korlátozza
				if (newWidth === targetWidth) {
					newLeft = WORKSPACE_PADDING;
				} else {
					newLeft = windowState.position.x + windowState.size.width - newWidth;
				}
				if (newHeight === targetHeight) {
					newTop = WORKSPACE_PADDING;
				} else {
					newTop = windowState.position.y + windowState.size.height - newHeight;
				}
			}
			break;
			case 'se': // Jobb alsó sarok - nyújtás jobbra és lefelé (max méret alatt)
				newWidth = Math.min(
					workspaceWidth - windowState.position.x - WORKSPACE_PADDING,
					MAX_WINDOW_WIDTH
				);
				newHeight = Math.min(
					workspaceHeight - windowState.position.y - WORKSPACE_PADDING,
					MAX_WINDOW_HEIGHT
				);
				break;
			case 'sw': // Bal alsó sarok - nyújtás balra és lefelé (max méret alatt)
			{
				const targetWidth = windowState.position.x + windowState.size.width - WORKSPACE_PADDING;
				newWidth = Math.min(targetWidth, MAX_WINDOW_WIDTH);
				newHeight = Math.min(
					workspaceHeight - windowState.position.y - WORKSPACE_PADDING,
					MAX_WINDOW_HEIGHT
				);
				// Pozíciót csak akkor változtatjuk, ha nem a max méret korlátozza
				if (newWidth === targetWidth) {
					newLeft = WORKSPACE_PADDING;
				} else {
					newLeft = windowState.position.x + windowState.size.width - newWidth;
				}
			}
			break;
		}

		// Minimum méretek ellenőrzése
		newWidth = Math.max(MIN_WINDOW_WIDTH, newWidth);
		newHeight = Math.max(MIN_WINDOW_HEIGHT, newHeight);

		windowManager.updateSize(windowState.id, { width: newWidth, height: newHeight });
		windowManager.updatePosition(windowState.id, { x: newLeft, y: newTop });

		// Ellenőrizzük, hogy elérte-e a maximális méretet a dupla kattintás után
		setTimeout(() => {
			if (!windowState.isMaximized && checkIfMaximized()) {
				windowManager.maximizeWindow(windowState.id);
			}
		}, 10); // Kis késleltetés, hogy a DOM frissüljön
	}

	// AKADÁLYMENTES MŰKÖDÉSHEZ SZÜKSÉGES ESEMÉNYEK - START
	function handleWindowKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			windowManager.activateWindow(windowState.id);
		}
	}

	function handleHeaderKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			// Dupla kattintás hatása (maximize)
			maximize();
		}
	}

	function handleResizeKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			// Billentyűzetről nem indítunk resize-t, csak aktiváljuk az ablakot
			windowManager.activateWindow(windowState.id);
		}
	}
	// AKADÁLYMENTES MŰKÖDÉSHEZ SZÜKSÉGES ESEMÉNYEK - STOP

	/**
	 * Ablak stílus számítása
	 */
	let windowStyle = $derived.by(() => {
		const left = windowState.isMaximized
			? 'var(--startmenu-margin)'
			: `${windowState.position.x}px`;
		const top = windowState.isMaximized ? 'var(--startmenu-margin)' : `${windowState.position.y}px`;
		const width = windowState.isMaximized
			? 'calc(100% - var(--startmenu-margin) *2 )'
			: `${windowState.size.width}px`;
		const height = windowState.isMaximized
			? 'calc(100% - var(--startmenu-margin) * 2)'
			: `${windowState.size.height}px`;
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
	onkeydown={handleWindowKeydown}
	role="button"
	tabindex="0"
>
	<div
		class="window-header"
		onmousedown={handleMouseDown}
		ondblclick={handleDoubleClick}
		onkeydown={handleHeaderKeydown}
		role="button"
		tabindex="0"
	>
		<div class="window-title">{windowState.title}</div>
		<div class="window-controls">
			{#if windowState.helpId}
				<WindowControlButton controlType="help" onClick={() => help(windowState.helpId)} />
			{/if}
			<WindowControlButton controlType="minimize" onClick={minimize} />
			{#if windowState.maximizable}
				<WindowControlButton
					controlType={windowState.isMaximized ? 'restore' : 'maximize'}
					onClick={maximize}
				/>
			{/if}
			<WindowControlButton controlType="close" onClick={close} />
		</div>
	</div>

	<div class="window-content">
		<div>
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

	<!-- Resize handles -->
	{#if !windowState.isMaximized}
		<div
			class="resize-handle resize-n"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'n')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'n')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
			aria-label="Resize window"
		></div>
		<div
			class="resize-handle resize-s"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 's')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 's')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-e"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'e')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'e')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-w"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'w')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'w')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-ne"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'ne')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'ne')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-nw"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'nw')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'nw')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-se"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'se')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'se')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
			role="button"
			tabindex="0"
		></div>
		<div
			class="resize-handle resize-sw"
			onmousedown={(e: MouseEvent) => handleResizeStart(e, 'sw')}
			ondblclick={(e: MouseEvent) => handleEdgeDoubleClick(e, 'sw')}
			onkeydown={(e: KeyboardEvent) => handleResizeKeydown(e)}
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
		backdrop-filter: blur(12px) saturate(180%);
		transition:
			box-shadow 0.2s,
			border 0.2s;
		box-shadow: var(--shadow-lg);
		border-radius: var(--radius-md, 8px);
		background-color: var(--color-window-background-alpha-90);
	}

	.window.minimized {
		display: none;
	}

	.window.maximized {
		border-radius: 0;
	}

	:global(.window.active) {
		/*border: 2px solid var(--color-primary-alpha-20);*/
	}

	:global(.window:not(.active)) {
		box-shadow: none;
	}

	.window-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		cursor: move;
		/*border-bottom: 1px solid var(--color-primary-alpha-20);*/
		border-radius: calc(var(--default-border-radius, 8px) - 2px)
			calc(var(--default-border-radius, 8px) - 2px) 0 0;
		/*background-color: var(--color-primary-alpha-70);*/
		/*background: var(--color-background);*/
		padding: 8px 12px;
		color: var(--color-primary-alpha-90);
		user-select: none;
		&:hover {
		}
	}

	:global {
		.dark {
			.window-header {
				/*background-color: var(--color-primary-alpha-5);*/
			}
		}
	}

	.window.maximized .window-header {
		cursor: default;
	}

	.window:not(.active) .window-header {
		border-bottom-color: var(--color-border);
		/*background-color: transparent;*/
	}

	.window-title {
		font-weight: 600;
		font-size: 14px;
	}

	.window:not(.active) .window-title {
		color: var(--color-foreground);
	}
	.window-controls {
		display: flex;
		gap: 8px;
	}

	.window:not(.active) .window-controls {
		filter: grayscale(1);
	}

	.window-content {
		flex: 1;
		padding: 16px;
		overflow: hidden;

		& > div {
			height: 100%;
			overflow: auto;
		}
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
