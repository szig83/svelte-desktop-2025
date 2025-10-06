<script lang="ts">
	import { getAppParameters, getParameter, getWindowId, updateWindowTitleById } from '$lib/services/appContext';

	let count = $state(0);
	let inputValue = $state('');

	// Get parameters passed to this app
	const parameters = getAppParameters();
	const windowId = getWindowId();
	const userId = getParameter<string>('userId', 'unknown');
	const theme = getParameter<string>('theme', 'default');
	const initialCount = getParameter<number>('initialCount', 0);


	// Set initial count from parameters
	count = initialCount;

	function increment() {
		count++;
	}

	function changeTitle() {
		const newTitle = `Beállítások - Számláló: ${count}`;
		updateWindowTitleById(windowId, newTitle);
	}

	function resetTitle() {
		updateWindowTitleById(windowId, 'Beállítások');
	}
</script>

<div class="komp1">
	<h2>Komp1 - Számláló</h2>
	<p>
		Ez a komponens megőrzi az állapotát még akkor is, ha az ablak aktív/inaktív váltáskor újra
		renderelődik a Window komponens!
	</p>

	<div class="counter">
		<button onclick={increment}>Növel</button>
		<span class="count">{count}</span>
	</div>

	<div class="title-controls">
		<h3>Ablak Cím Módosítás</h3>
		<button onclick={changeTitle}>Cím Frissítés Számlálóval</button>
		<button onclick={resetTitle}>Eredeti Cím Visszaállítás</button>
	</div>

	<div class="input-section">
		<label>
			Szöveg (ez is megmarad):
			<input bind:value={inputValue} placeholder="Írj valamit..." />
		</label>
		<p>Írt szöveg: <strong>{inputValue || '(üres)'}</strong></p>
	</div>

	<div class="parameters-section">
		<h3>App Paraméterek</h3>
		<p><strong>Window ID:</strong> {windowId}</p>
		<p><strong>User ID:</strong> {userId}</p>
		<p><strong>Theme:</strong> {theme}</p>
		<p><strong>Initial Count:</strong> {initialCount}</p>
		<details>
			<summary>Összes paraméter</summary>
			<pre>{JSON.stringify(parameters, null, 2)}</pre>
		</details>
	</div>
</div>

<style>
	.komp1 {
		padding: 20px;
	}

	h2 {
		margin-top: 0;
		color: #4caf50;
	}

	.counter {
		display: flex;
		align-items: center;
		gap: 16px;
		margin: 24px 0;
	}

	.count {
		min-width: 50px;
		color: #4caf50;
		font-weight: bold;
		font-size: 32px;
		text-align: center;
	}

	button {
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: #4caf50;
		padding: 10px 20px;
		color: white;
		font-size: 16px;
	}

	button:hover {
		background: #45a049;
	}

	.input-section {
		margin-top: 24px;
	}

	input {
		display: block;
		margin-top: 8px;
		border: 2px solid #ddd;
		border-radius: 4px;
		padding: 8px;
		width: 100%;
		font-size: 14px;
	}

	input:focus {
		outline: none;
		border-color: #4caf50;
	}

	.parameters-section {
		margin-top: 24px;
		padding: 16px;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.parameters-section h3 {
		margin-top: 0;
		color: #333;
	}

	.parameters-section p {
		margin: 8px 0;
	}

	.parameters-section pre {
		background: #fff;
		padding: 8px;
		border-radius: 4px;
		font-size: 12px;
		overflow-x: auto;
	}

	.title-controls {
		margin: 24px 0;
		padding: 16px;
		background: #e8f4f8;
		border-radius: 8px;
		border: 2px solid #4caf50;
	}

	.title-controls h3 {
		margin-top: 0;
		color: #2e7d32;
	}

	.title-controls button {
		margin-right: 8px;
		margin-bottom: 8px;
		background: #2196f3;
	}

	.title-controls button:hover {
		background: #1976d2;
	}
</style>
