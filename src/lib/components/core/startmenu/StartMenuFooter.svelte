<script lang="ts">
	import { authClient } from '$lib/auth/client';
	const session = authClient.useSession();
	import UniversalIcon from '$lib/components/UniversalIcon.svelte';
	import * as Avatar from '$lib/components/ui/avatar/index';
	import { goto } from '$app/navigation';
</script>

<div class="footer">
	<div class="footer-left">
		{#if $session.data}
			<Avatar.Root>
				<Avatar.Image src={$session.data.user.image} referrerpolicy="no-referrer" alt="" />
				<Avatar.Fallback>X</Avatar.Fallback>
			</Avatar.Root>
			<div>
				{$session.data.user.name}<br />
				{$session.data.user.email}
			</div>
		{/if}
	</div>
	<div class="footer-right">
		<button
			class="btn-click-effect"
			onclick={() => {
				authClient.signOut({
					fetchOptions: {
						onSuccess: () => {
							window.location.href = '/admin/sign-in';
						}
					}
				});
			}}
		>
			<UniversalIcon icon="Power" size={16} class="btn-power" />
		</button>
	</div>
</div>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--color-border);
		background-color: var(--primary-500-alpha-80);
		padding: 10px 0 0 0;
		color: var(--neutral-100);
		font-size: 0.8rem;

		.footer-left {
			display: flex;
			align-items: center;
			gap: 10px;
		}
	}
</style>
