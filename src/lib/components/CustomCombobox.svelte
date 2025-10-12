<script lang="ts">
	import { Combobox } from 'bits-ui';
	import CaretUpDown from 'phosphor-svelte/lib/CaretUpDown';
	import Check from 'phosphor-svelte/lib/Check';
	import CaretDoubleUp from 'phosphor-svelte/lib/CaretDoubleUp';
	import CaretDoubleDown from 'phosphor-svelte/lib/CaretDoubleDown';

	type ComboboxItem = {
		value: string;
		label: string;
	};

	type Props = {
		items?: ComboboxItem[];
		value?: string | undefined;
		placeholder?: string;
		name?: string;
		ariaLabel?: string;
		onChange?: (value: string | undefined) => void;
		disabled?: boolean;
		searchable?: boolean;
		type?: 'single' | 'multiple';
	};

	let {
		items = [],
		value = $bindable(undefined),
		placeholder = 'Keresés...',
		name = 'combobox',
		ariaLabel = 'Válassz egy opciót',
		onChange,
		disabled = false,
		searchable = true,
		type = 'single'
	}: Props = $props();

	let inputValue = $state('');
	let isOpen = $state(false);
	let inputElement: HTMLInputElement | null = $state(null);

	// Frissítjük az input értékét amikor a value változik
	$effect(() => {
		if (!isOpen && inputElement) {
			const selectedItem = items.find((item) => item.value === value);
			inputElement.value = selectedItem?.label ?? '';
		}
	});

	const filteredItems = $derived(
		!searchable || inputValue === ''
			? items
			: items.filter((item) => item.label.toLowerCase().includes(inputValue.toLowerCase()))
	);

	function handleValueChange(newValue: string | null | undefined) {
		value = newValue ?? undefined;
		if (onChange) {
			onChange(value);
		}
	}

	function handleOpenChange(open: boolean) {
		isOpen = open;
		if (!open) {
			inputValue = '';
			// Visszaállítjuk a kiválasztott item labelét
			if (inputElement) {
				const selectedItem = items.find((item) => item.value === value);
				inputElement.value = selectedItem?.label ?? '';
			}
		}
	}
</script>

<Combobox.Root
	bind:value
	bind:open={isOpen}
	{type}
	{name}
	{disabled}
	onValueChange={handleValueChange}
	onOpenChange={handleOpenChange}
	items={filteredItems}
>
	<div class="combobox-input-wrapper">
		<Combobox.Input
			bind:ref={inputElement}
			oninput={(e) => {
				if (searchable) {
					inputValue = e.currentTarget.value;
				}
			}}
			onclick={() => {
				if (!searchable && !disabled) {
					isOpen = !isOpen;
				}
			}}
			class={`combobox-input${!searchable ? ' non-searchable' : ''}`}
			{placeholder}
			aria-label={ariaLabel}
			{disabled}
			readonly={!searchable}
		/>
		<Combobox.Trigger class="combobox-trigger" {disabled}>
			<CaretUpDown class="size-5" />
		</Combobox.Trigger>
	</div>
	<Combobox.Portal>
		<Combobox.Content class="combobox-content" sideOffset={8}>
			<Combobox.ScrollUpButton class="combobox-scroll-button">
				<CaretDoubleUp class="size-4" />
			</Combobox.ScrollUpButton>
			<Combobox.Viewport class="combobox-viewport">
				{#each filteredItems as item, i (i + item.value)}
					<Combobox.Item
						class="combobox-item"
						value={item.value}
						label={item.label}
						disabled={!multiple && item.value === value}
					>
						{#snippet children({ selected })}
							<span class="combobox-item-label">{item.label}</span>
							{#if selected}
								<Check class="combobox-item-check" />
							{/if}
						{/snippet}
					</Combobox.Item>
				{:else}
					<div class="combobox-empty">
						<span>Nincs találat</span>
					</div>
				{/each}
			</Combobox.Viewport>
			<Combobox.ScrollDownButton class="combobox-scroll-button">
				<CaretDoubleDown class="size-4" />
			</Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>

<style>
	.combobox-input-wrapper {
		display: flex;
		position: relative;
		align-items: center;
		width: 100%;
	}

	:global(.combobox-input) {
		all: unset;
		flex: 1;
		transition: all 0.2s ease;
		border: 1px solid var(--neutral-900-alpha-20);
		border-radius: 10px;
		background-color: var(--neutral-50);
		padding: 0 40px 0 12px;
		height: 36px;
		color: var(--neutral-800);
		font-size: 0.875rem;
	}

	:global(.combobox-input:focus) {
		outline: none;
		border-color: var(--neutral-900-alpha-30);
		background-color: var(--neutral-100);
	}

	:global(.combobox-input::placeholder) {
		color: var(--neutral-500);
	}

	:global(.combobox-input:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
		border-color: var(--neutral-900-alpha-10);
		background-color: var(--neutral-900-alpha-10);
		color: var(--neutral-500);
	}

	:global(.combobox-input.non-searchable) {
		cursor: pointer;
		user-select: none;
	}

	:global(.combobox-trigger) {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		justify-content: center;
		align-items: center;
		transition: color 0.2s ease;
		cursor: pointer;
		border: none;
		background: transparent;
		padding: 0 10px;
		height: 100%;
		color: var(--neutral-600);
	}

	:global(.combobox-trigger:hover) {
		color: var(--neutral-800);
	}

	:global(.combobox-trigger:disabled) {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(.combobox-content) {
		z-index: 1000;
		animation: slideDown 0.15s ease-out;
		outline: none;
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--neutral-900-alpha-10);
		border-radius: 12px;
		background-color: var(--panel-bg-color);
		padding: 6px;
		min-width: var(--bits-combobox-anchor-width);
		max-height: var(--bits-combobox-content-available-height);
	}

	:global(.combobox-viewport) {
		max-height: 300px;
		overflow-x: hidden;
		overflow-y: auto;
	}

	:global(.combobox-viewport::-webkit-scrollbar) {
		width: 8px;
	}

	:global(.combobox-viewport::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.combobox-viewport::-webkit-scrollbar-thumb) {
		border-radius: 4px;
		background-color: var(--neutral-900-alpha-20);
	}

	:global(.combobox-viewport::-webkit-scrollbar-thumb:hover) {
		background-color: var(--neutral-900-alpha-30);
	}

	:global(.combobox-scroll-button) {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: color 0.2s ease;
		cursor: pointer;
		width: 100%;
		height: 28px;
		color: var(--neutral-600);
	}

	:global(.combobox-scroll-button:hover) {
		color: var(--neutral-800);
	}

	:global(.combobox-item) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
		transition: background-color 0.15s ease;
		cursor: pointer;
		outline: none;
		border-radius: 8px;
		padding: 8px 12px;
		color: var(--panel-text-color);
		font-size: 0.875rem;
		user-select: none;
	}

	:global(.combobox-item:hover) {
		background-color: var(--neutral-900-alpha-10);
	}

	:global(.combobox-item[data-selected]) {
		background-color: var(--primary-500-alpha-10);
	}

	:global(.combobox-item-label) {
		flex: 1;
	}

	:global(.combobox-item-check) {
		flex-shrink: 0;
		width: 16px;
		height: 16px;
		color: var(--primary-600);
	}

	:global(.combobox-empty) {
		padding: 16px 12px;
		color: var(--neutral-500);
		font-size: 0.875rem;
		text-align: center;
	}

	@keyframes slideDown {
		from {
			transform: translateY(-4px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	/* Dark mode - használjuk :root.dark vagy :is(.dark *) szelektort a Portal miatt */
	:global(:is(.dark *) .combobox-input) {
		background-color: var(--neutral-800);
		color: var(--neutral-300);
	}

	:global(:is(.dark *) .combobox-input:focus) {
		border-color: var(--neutral-50-alpha-10);
		background-color: var(--neutral-700);
	}

	:global(:is(.dark *) .combobox-trigger) {
		color: var(--neutral-400);
	}

	:global(:is(.dark *) .combobox-trigger:hover) {
		color: var(--neutral-200);
	}

	:global(:is(.dark *) .combobox-content) {
		border-color: var(--neutral-50-alpha-10);
		background-color: var(--neutral-800);
	}

	:global(:is(.dark *) .combobox-viewport::-webkit-scrollbar-thumb) {
		background-color: var(--neutral-50-alpha-20);
	}

	:global(:is(.dark *) .combobox-viewport::-webkit-scrollbar-thumb:hover) {
		background-color: var(--neutral-50-alpha-30);
	}

	:global(:is(.dark *) .combobox-scroll-button) {
		color: var(--neutral-400);
	}

	:global(:is(.dark *) .combobox-scroll-button:hover) {
		color: var(--neutral-200);
	}

	:global(:is(.dark *) .combobox-item) {
		color: var(--neutral-200);
	}

	:global(:is(.dark *) .combobox-item:hover) {
		background-color: var(--neutral-50-alpha-10);
	}

	:global(:is(.dark *) .combobox-item:hover) {
		background-color: var(--neutral-50-alpha-20);
	}

	:global(:is(.dark *) .combobox-item[data-selected]) {
		background-color: var(--primary-500-alpha-30);
	}

	:global(:is(.dark *) .combobox-item-check) {
		color: var(--primary-400);
	}

	:global(:is(.dark *) .combobox-empty) {
		color: var(--neutral-400);
	}
</style>
