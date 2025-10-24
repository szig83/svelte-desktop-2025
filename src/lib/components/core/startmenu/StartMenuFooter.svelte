<script lang="ts">
	import { authClient } from '$lib/auth/client';
	const session = authClient.useSession();
	import { UniversalIcon } from '$lib/components/shared';
	import * as Avatar from '$lib/components/ui/avatar/index';
	import { Button } from '$lib/components/ui/button';

	let fallbackImageText = $derived.by(() => {
		if ($session.data) {
			const firstName = $session.data.user.name.split(' ')[0];
			const lastName = $session.data.user.name.split(' ')[1];
			return (
				firstName.charAt(0).toUpperCase() +
				(lastName && lastName.length > 0 ? lastName.charAt(0).toUpperCase() : '')
			);
		}
		return '';
	});
</script>

<div class="footer">
	<div class="footer-left">
		{#if $session.data}
			<Avatar.Root class="size-11">
				<Avatar.Image src={$session.data.user.image} referrerpolicy="no-referrer" alt="" />
				<Avatar.Fallback class="text-xl">{fallbackImageText}</Avatar.Fallback>
			</Avatar.Root>
			<div>
				{$session.data.user.name}<br />
				{$session.data.user.email}
			</div>
		{/if}
	</div>
	<div class="footer-right">
		<Button
			variant="destructive"
			class="btn-click-effect mx-2 flex items-center gap-2"
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
			<UniversalIcon icon="Power" size={16} class="btn-power" /> Kijelentkezés
		</Button>
	</div>
</div>

<style>
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid var(--color-border);
		background-color: var(--primary-500-alpha-80);
		padding: 20px 0 0 0;
		color: var(--neutral-100);
		font-size: 0.8rem;

		.footer-left {
			display: flex;
			align-items: center;
			gap: 10px;
		}
	}
</style>
