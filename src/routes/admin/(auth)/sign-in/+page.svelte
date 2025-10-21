<script lang="ts">
	import { authClient } from '$lib/auth/client';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex w-full max-w-xs flex-col gap-4 rounded-xl bg-stone-100 p-4">
	<div class="flex w-full flex-col gap-1.5">
		<Label for="email">E-mail</Label>
		<Input type="email" id="email" placeholder="E-mail" />
	</div>
	<div class="flex w-full flex-col gap-1.5">
		<Label for="password">Jelszó</Label>
		<Input type="password" id="password" placeholder="Jelszó" />
	</div>
	<Button
		onclick={async () => {
			await authClient.signIn.social({
				provider: 'google',
				callbackURL: '/admin'
			});
		}}>Google bejelentkezés</Button
	>
</div>
