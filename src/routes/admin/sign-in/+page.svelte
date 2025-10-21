<script lang="ts">
	import { authClient } from '$lib/auth/client';
</script>

<button
	on:click={async () => {
		await authClient.signIn.social({
			provider: 'google',
			callbackURL: '/admin'
		});
	}}>Login with Google</button
>
