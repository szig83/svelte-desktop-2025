<!-- src/komponensek/Komp2.svelte -->
<script lang="ts">
	let items = $state<string[]>(['Első elem', 'Második elem']);
	let newItem = $state('');

	function addItem() {
		if (newItem.trim()) {
			items.push(newItem);
			newItem = '';
		}
	}

	function removeItem(index: number) {
		items.splice(index, 1);
	}
</script>

<div class="komp2">
	<h2>Komp2 - Lista kezelő</h2>
	<p>Ez a komponens is megőrzi a listát az ablak állapotváltozásai alatt.</p>

	<div class="add-section">
		<input
			bind:value={newItem}
			placeholder="Új elem hozzáadása..."
			onkeydown={(e) => e.key === 'Enter' && addItem()}
		/>
		<button onclick={addItem}>Hozzáad</button>
	</div>

	<ul class="item-list">
		{#each items as item, index}
			<li>
				<span>{item}</span>
				<button onclick={() => removeItem(index)} class="remove">✕</button>
			</li>
		{/each}
	</ul>

	{#if items.length === 0}
		<p class="empty">Nincs még elem a listában.</p>
	{/if}
</div>

<style>
	.komp2 {
		padding: 20px;
	}

	h2 {
		margin-top: 0;
		color: #2196f3;
	}

	.add-section {
		display: flex;
		gap: 8px;
		margin: 24px 0;
	}

	.add-section input {
		flex: 1;
		border: 2px solid #ddd;
		border-radius: 4px;
		padding: 8px 12px;
		font-size: 14px;
	}

	.add-section input:focus {
		outline: none;
		border-color: #2196f3;
	}

	button {
		cursor: pointer;
		border: none;
		border-radius: 4px;
		background: #2196f3;
		padding: 8px 16px;
		color: white;
		font-size: 14px;
	}

	button:hover {
		background: #1976d2;
	}

	.item-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item-list li {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		border-radius: 4px;
		background: #f5f5f5;
		padding: 12px;
	}

	.item-list button.remove {
		background: #f44336;
		padding: 4px 8px;
		font-size: 12px;
	}

	.item-list button.remove:hover {
		background: #d32f2f;
	}

	.empty {
		padding: 24px;
		color: #999;
		text-align: center;
	}
</style>
