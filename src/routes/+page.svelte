<!-- src/routes/+page.svelte -->
<script lang="ts">
	import { getWindowManager } from '$lib/stores/windowStore.svelte';

	const windowManager = getWindowManager();

	function openKomp1() {
		windowManager.openWindow('Komp1', 'Első komponens');
	}

	function openKomp2() {
		windowManager.openWindow('Komp2', 'Második komponens');
	}

	function openKomp3() {
		windowManager.openWindow('Komp3', 'Harmadik komponens');
	}
</script>

<div class="main-content">
	<h1>Window Manager Demo</h1>
	<p>Nyiss meg különböző ablakokat:</p>

	<div class="button-group">
		<button onclick={openKomp1}>Komp1 megnyitása</button>
		<button onclick={openKomp2}>Komp2 megnyitása</button>
		<button onclick={openKomp3}>Komp3 megnyitása</button>
	</div>

	<div class="info">
		<h2>Funkciók:</h2>
		<ul>
			<li>✓ Ablakok mozgatása (header drag)</li>
			<li>✓ Minimize/Maximize/Close gombok</li>
			<li>✓ Aktív ablak kezelés (kattintással)</li>
			<li>✓ Z-index automatikus kezelés</li>
			<li>✓ Taskbar a minimalizált ablakokhoz</li>
			<li>✓ Komponens állapot megőrzés (újrarenderelés nélkül)</li>
			<li>✓ Ha már nyitva van egy ablak, azt aktiválja</li>
		</ul>
	</div>
</div>

<style>
	.main-content {
		padding: 40px;
		max-width: 800px;
	}

	h1 {
		margin-bottom: 16px;
		color: #333;
	}

	.button-group {
		display: flex;
		gap: 12px;
		margin: 24px 0;
	}

	button {
		transition: background 0.2s;
		cursor: pointer;
		border: none;
		border-radius: 6px;
		background: #4caf50;
		padding: 12px 24px;
		color: white;
		font-weight: 600;
		font-size: 14px;
	}

	button:hover {
		background: #45a049;
	}

	.info {
		margin-top: 40px;
		border-radius: 8px;
		background: #f5f5f5;
		padding: 24px;
	}

	.info h2 {
		margin-top: 0;
		color: #555;
	}

	.info ul {
		padding: 0;
		list-style: none;
	}

	.info li {
		padding: 8px 0;
		color: #666;
	}
</style>
