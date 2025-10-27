<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	let verificationStatus: 'loading' | 'success' | 'error' | 'expired' | 'invalid' = 'loading';
	let errorMessage = '';
	let isRedirecting = false;

	onMount(async () => {
		const token = $page.url.searchParams.get('token');
		const callbackURL = $page.url.searchParams.get('callbackURL');

		if (!token) {
			verificationStatus = 'invalid';
			errorMessage = 'Hiányzó megerősítési token';
			return;
		}

		try {
			// Better Auth automatically handles email verification through the API
			const response = await fetch(
				`/api/auth/verify-email?token=${encodeURIComponent(token)}${callbackURL ? `&callbackURL=${encodeURIComponent(callbackURL)}` : ''}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);

			if (response.ok) {
				verificationStatus = 'success';
				// Redirect after 3 seconds
				setTimeout(() => {
					isRedirecting = true;
					goto(callbackURL || '/admin/sign-in');
				}, 3000);
			} else {
				const errorData = await response.json().catch(() => ({}));

				if (response.status === 400) {
					verificationStatus = 'expired';
					errorMessage = 'A megerősítési link lejárt';
				} else if (response.status === 404) {
					verificationStatus = 'invalid';
					errorMessage = 'Érvénytelen megerősítési token';
				} else {
					verificationStatus = 'error';
					errorMessage = errorData.message || 'Hiba történt a megerősítés során';
				}
			}
		} catch (error) {
			console.error('Verification error:', error);
			verificationStatus = 'error';
			errorMessage = 'Hálózati hiba történt';
		}
	});

	function handleResendVerification() {
		goto('/resend-verification');
	}

	function handleGoToSignIn() {
		goto('/admin/sign-in');
	}
</script>

<svelte:head>
	<title>Email megerősítés - Desktop Environment</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="mb-2 text-3xl font-bold text-gray-900">Email megerősítés</h1>
			<p class="text-gray-600">Desktop Environment</p>
		</div>

		<Card.Root>
			<Card.Header class="text-center">
				{#if verificationStatus === 'loading'}
					<Card.Title class="text-blue-600">Megerősítés folyamatban...</Card.Title>
					<Card.Description
						>Kérjük várjon, amíg ellenőrizzük a megerősítési tokent.</Card.Description
					>
				{:else if verificationStatus === 'success'}
					<Card.Title class="text-green-600">✓ Sikeres megerősítés!</Card.Title>
					<Card.Description>Az email címe sikeresen megerősítésre került.</Card.Description>
				{:else if verificationStatus === 'expired'}
					<Card.Title class="text-orange-600">⚠ Lejárt link</Card.Title>
					<Card.Description>A megerősítési link lejárt.</Card.Description>
				{:else if verificationStatus === 'invalid'}
					<Card.Title class="text-red-600">✗ Érvénytelen link</Card.Title>
					<Card.Description
						>A megerősítési link érvénytelen vagy már felhasználásra került.</Card.Description
					>
				{:else if verificationStatus === 'error'}
					<Card.Title class="text-red-600">✗ Hiba történt</Card.Title>
					<Card.Description>Nem sikerült megerősíteni az email címet.</Card.Description>
				{/if}
			</Card.Header>

			<Card.Content class="space-y-4">
				{#if verificationStatus === 'loading'}
					<div class="flex justify-center">
						<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
					</div>
				{:else if verificationStatus === 'success'}
					<div class="space-y-4 text-center">
						<p class="text-gray-700">Mostantól bejelentkezhet a fiókjába.</p>
						{#if isRedirecting}
							<p class="text-sm text-gray-500">Átirányítás a bejelentkezési oldalra...</p>
							<div class="flex justify-center">
								<div class="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
							</div>
						{:else}
							<p class="text-sm text-gray-500">Automatikus átirányítás 3 másodperc múlva...</p>
						{/if}
						<Button onclick={handleGoToSignIn} class="w-full">Bejelentkezés most</Button>
					</div>
				{:else if verificationStatus === 'expired' || verificationStatus === 'invalid'}
					<div class="space-y-4 text-center">
						<p class="text-gray-700">
							{errorMessage}
						</p>
						<div class="space-y-2">
							<Button onclick={handleResendVerification} class="w-full">
								Új megerősítő email kérése
							</Button>
							<Button variant="outline" onclick={handleGoToSignIn} class="w-full">
								Vissza a bejelentkezéshez
							</Button>
						</div>
					</div>
				{:else if verificationStatus === 'error'}
					<div class="space-y-4 text-center">
						<p class="text-gray-700">
							{errorMessage}
						</p>
						<div class="space-y-2">
							<Button onclick={() => window.location.reload()} class="w-full">
								Újrapróbálkozás
							</Button>
							<Button variant="outline" onclick={handleResendVerification} class="w-full">
								Új megerősítő email kérése
							</Button>
							<Button variant="outline" onclick={handleGoToSignIn} class="w-full">
								Vissza a bejelentkezéshez
							</Button>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<div class="text-center">
			<p class="text-sm text-gray-500">
				Problémája van? <a href="/admin/sign-in" class="text-blue-600 hover:text-blue-500"
					>Lépjen kapcsolatba velünk</a
				>
			</p>
		</div>
	</div>
</div>
