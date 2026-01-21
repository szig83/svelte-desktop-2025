<script lang="ts">
	import { authClient } from '$lib/auth/client';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import type { PageData } from './$types';
	import Decor from './Decor.svelte';
	import Logo from '$lib/components/shared/Logo.svelte';
	import '@fontsource-variable/quicksand';

	let { data }: { data: PageData } = $props();

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');
	let showVerificationPrompt = $state(false);

	// Show info notice only if coming from registration or if there's a verification error
	let showInfoNotice = $derived(data.registered || showVerificationPrompt);

	const handleSignIn = async () => {
		isLoading = true;
		errorMessage = '';
		showVerificationPrompt = false;

		await authClient.signIn.email(
			{
				email: email,
				password: password,
				callbackURL: '/admin'
			},
			{
				onError(context) {
					const error = context.error;

					// Check if the error is related to email verification
					if (
						error.message?.toLowerCase().includes('verify') ||
						error.message?.toLowerCase().includes('verification') ||
						error.message?.toLowerCase().includes('confirm') ||
						error.message?.toLowerCase().includes('not verified') ||
						error.code === 'EMAIL_NOT_VERIFIED'
					) {
						showVerificationPrompt = true;
						errorMessage =
							'Az email címe még nincs megerősítve. A bejelentkezéshez először meg kell erősítenie az email címét.';
					} else if (
						error.message?.toLowerCase().includes('invalid') &&
						error.message?.toLowerCase().includes('credentials')
					) {
						errorMessage = 'Helytelen email cím vagy jelszó. Kérjük ellenőrizze az adatokat.';
					} else if (
						error.message?.toLowerCase().includes('user') &&
						error.message?.toLowerCase().includes('not found')
					) {
						errorMessage =
							'Nincs regisztrált fiók ezzel az email címmel. Kérjük először regisztráljon.';
					} else if (
						error.message?.toLowerCase().includes('account') &&
						error.message?.toLowerCase().includes('locked')
					) {
						errorMessage = 'A fiók ideiglenesen zárolva van. Kérjük próbálja újra később.';
					} else if (
						error.message?.toLowerCase().includes('rate') ||
						error.message?.toLowerCase().includes('limit')
					) {
						errorMessage =
							'Túl sok bejelentkezési kísérlet. Kérjük várjon egy kicsit és próbálja újra.';
					} else {
						errorMessage = error.message || 'Bejelentkezési hiba történt. Kérjük próbálja újra.';
					}
				}
			}
		);

		isLoading = false;
	};

	const handleResendVerification = () => {
		window.location.href = `/resend-verification?email=${encodeURIComponent(email)}`;
	};
</script>

<div class="sign-in flex w-[70%] max-w-[1000px] overflow-hidden rounded-2xl shadow-2xl">
	<!-- Bal oldal - Form -->
	<div class="left-side flex w-full flex-col justify-between bg-white p-8 lg:w-2/5 lg:p-10">
		<!-- Logo -->
		<Logo title="Svelte Desktop" />

		<div class="mt-8 grid gap-4">
			<!-- Email verification info notice - only show when relevant -->
			{#if showInfoNotice}
				<div class="rounded-md bg-blue-50 p-3 text-sm dark:bg-blue-950">
					<div class="flex items-start gap-2">
						<svg
							class="mt-0.5 h-4 w-4 shrink-0 text-blue-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="text-blue-800 dark:text-blue-200">
							<p class="font-medium">Email megerősítés szükséges</p>
							<p class="mt-1 text-xs">
								{#if data.registered}
									Sikeres regisztráció! Ellenőrizze a postafiókját a megerősítő email után, majd
									jelentkezzen be.
								{:else}
									A bejelentkezéshez először meg kell erősítenie az email címét a regisztráció után
									kapott emailben található linkkel.
								{/if}
							</p>
						</div>
					</div>
				</div>
			{/if}
			{#if errorMessage}
				<div
					class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
				>
					<div class="flex items-start gap-2">
						<svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="flex-1">
							<span>{errorMessage}</span>
							{#if showVerificationPrompt}
								<div class="mt-3 space-y-2">
									<p class="text-xs text-red-700 dark:text-red-300">
										Ellenőrizze a postafiókját (beleértve a spam mappát is) a megerősítő email után.
									</p>
									<div class="flex flex-col gap-2 sm:flex-row">
										<Button
											size="sm"
											variant="outline"
											class="border-red-300 text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900"
											onclick={handleResendVerification}
										>
											Megerősítő email újraküldése
										</Button>
										<Button
											size="sm"
											variant="ghost"
											class="text-red-700 hover:bg-red-100 dark:text-red-300 dark:hover:bg-red-900"
											onclick={() => (window.location.href = '/admin/sign-up')}
										>
											Új fiók létrehozása
										</Button>
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
			<div class="grid gap-2">
				<Label for="email">Email cím</Label>
				<Input id="email" type="email" placeholder="pelda@email.com" required bind:value={email} />
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Jelszó</Label>
					<a href="/forget-password" class="ml-auto inline-block text-sm underline">
						Elfelejtette a jelszavát?
					</a>
				</div>
				<Input id="password" type="password" required bind:value={password} />
			</div>
			<Button
				type="button"
				class="w-full"
				onclick={handleSignIn}
				disabled={isLoading}
				variant="login"
			>
				{#if isLoading}
					<div class="flex items-center">
						<div class="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
						Bejelentkezés...
					</div>
				{:else}
					Bejelentkezés
				{/if}
			</Button>
			{#if data.socialLoginEnabled}
				<Button
					variant="outline"
					class="w-full"
					onclick={async () => {
						await authClient.signIn.social({
							provider: 'google',
							callbackURL: '/admin'
						});
					}}>Bejelentkezés Google-lel</Button
				>
			{/if}
		</div>
		{#if data.registrationEnabled}
			<div class="mt-4 text-center text-sm">
				Nincs még fiókja?
				<a href="/admin/sign-up" class="underline">Regisztráljon itt</a>
			</div>
		{/if}
	</div>

	<!-- Jobb oldal - Dekoratív háttér -->
	<div class="right-side relative hidden overflow-hidden lg:block lg:w-3/5">
		<Decor />

		<!-- Szöveg tartalom -->
		<div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
			<h1 class="mb-4 text-3xl font-light tracking-wide text-white">
				Üdvözöljünk a <span class="block font-normal text-white">Svelte Desktop</span> rendszerben
			</h1>
			<p class="text-base text-gray-300">Fiókja eléréshez kérjük jelentkezzen be.</p>
		</div>
	</div>
</div>

<style>
	.sign-in .right-side {
		font-family: 'Quicksand Variable', serif;
	}
</style>
