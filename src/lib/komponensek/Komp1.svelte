<script lang="ts">
	let count = $state(0);
	let inputValue = $state('');

	function increment() {
		count++;
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

	<div class="input-section">
		<label>
			Szöveg (ez is megmarad):
			<input bind:value={inputValue} placeholder="Írj valamit..." />
		</label>
		<p>Írt szöveg: <strong>{inputValue || '(üres)'}</strong></p>
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
</style>
