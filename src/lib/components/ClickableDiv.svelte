<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		onclick?: (e: MouseEvent) => void;
		onkeydown?: (e: KeyboardEvent) => void;
		children?: Snippet;
		element?: HTMLDivElement;
		[key: string]: any; // Bármilyen további prop
	}
	let { onclick, onkeydown, children, element = $bindable(), ...restProps }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			// Create a synthetic MouseEvent for keyboard activation
			const syntheticEvent = new MouseEvent('click', {
				bubbles: true,
				cancelable: true,
				view: window
			});
			onclick?.(syntheticEvent);
		}
		onkeydown?.(e);
	}

</script>

<div
	bind:this={element}
	{onclick}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
	{...restProps}
>
	{@render children?.()}
</div>
