<script lang="ts">
	import { authClient } from '$lib/auth/client';
	import { sendWelcomeEmail } from '$lib/auth/email.remote';
	import { writable, derived } from 'svelte/store';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	// Form state stores
	const name = writable('');
	const email = writable('');
	const password = writable('');
	const confirmPassword = writable('');
	const isLoading = writable(false);

	// Error state store with typed interface
	interface ValidationErrors {
		name: string;
		email: string;
		password: string;
		confirmPassword: string;
		general: string;
	}

	const errors = writable<ValidationErrors>({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
		general: ''
	});

	// Derived store to check if form is valid
	const isFormValid = derived(
		[name, email, password, confirmPassword, errors],
		([$name, $email, $password, $confirmPassword, $errors]) => {
			return (
				$name.trim() !== '' &&
				$email.trim() !== '' &&
				$password.trim() !== '' &&
				$confirmPassword.trim() !== '' &&
				!$errors.name &&
				!$errors.email &&
				!$errors.password &&
				!$errors.confirmPassword
			);
		}
	);

	// Helper function to clear all errors
	const clearErrors = () => {
		errors.set({
			name: '',
			email: '',
			password: '',
			confirmPassword: '',
			general: ''
		});
	};

	// Helper function to set specific field error
	const setFieldError = (field: keyof ValidationErrors, message: string) => {
		errors.update((current) => ({
			...current,
			[field]: message
		}));
	};

	// Validation functions
	const validateName = (nameValue: string): string => {
		if (!nameValue.trim()) {
			return 'A név megadása kötelező';
		}

		if (nameValue.trim().length < 2) {
			return 'A névnek legalább 2 karakter hosszúnak kell lennie';
		}

		return '';
	};

	const validateEmail = (emailValue: string): string => {
		if (!emailValue.trim()) {
			return 'Az email cím megadása kötelező';
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailValue)) {
			return 'Kérjük adjon meg egy érvényes email címet';
		}

		return '';
	};

	const validatePassword = (passwordValue: string): string => {
		if (!passwordValue) {
			return 'A jelszó megadása kötelező';
		}

		if (passwordValue.length < 8) {
			return 'A jelszónak legalább 8 karakter hosszúnak kell lennie';
		}

		const hasUpperCase = /[A-Z]/.test(passwordValue);
		const hasLowerCase = /[a-z]/.test(passwordValue);
		const hasNumbers = /\d/.test(passwordValue);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);

		if (!hasUpperCase) {
			return 'A jelszónak tartalmaznia kell legalább egy nagybetűt';
		}

		if (!hasLowerCase) {
			return 'A jelszónak tartalmaznia kell legalább egy kisbetűt';
		}

		if (!hasNumbers) {
			return 'A jelszónak tartalmaznia kell legalább egy számot';
		}

		if (!hasSpecialChar) {
			return 'A jelszónak tartalmaznia kell legalább egy speciális karaktert';
		}

		return '';
	};

	const validatePasswordMatch = (passwordValue: string, confirmPasswordValue: string): string => {
		if (!confirmPasswordValue) {
			return 'Kérjük erősítse meg a jelszót';
		}

		if (passwordValue !== confirmPasswordValue) {
			return 'A jelszavak nem egyeznek';
		}

		return '';
	};

	// Real-time validation handlers
	const handleNameValidation = () => {
		const nameError = validateName($name);
		setFieldError('name', nameError);
	};

	const handleEmailValidation = () => {
		const emailError = validateEmail($email);
		setFieldError('email', emailError);
	};

	const handlePasswordValidation = () => {
		const passwordError = validatePassword($password);
		setFieldError('password', passwordError);

		// Also revalidate confirm password if it has a value
		if ($confirmPassword) {
			handleConfirmPasswordValidation();
		}
	};

	const handleConfirmPasswordValidation = () => {
		const confirmPasswordError = validatePasswordMatch($password, $confirmPassword);
		setFieldError('confirmPassword', confirmPasswordError);
	};

	// Validate all fields
	const validateAllFields = (): boolean => {
		const nameError = validateName($name);
		const emailError = validateEmail($email);
		const passwordError = validatePassword($password);
		const confirmPasswordError = validatePasswordMatch($password, $confirmPassword);

		errors.set({
			name: nameError,
			email: emailError,
			password: passwordError,
			confirmPassword: confirmPasswordError,
			general: ''
		});

		return !nameError && !emailError && !passwordError && !confirmPasswordError;
	};

	// Success state for showing verification message
	let registrationSuccess = false;
	let registeredEmail = '';

	const handleSignUp = async () => {
		// Clear any previous general errors
		setFieldError('general', '');

		// Validate all fields before submission
		if (!validateAllFields()) {
			return;
		}

		$isLoading = true;

		try {
			await authClient.signUp.email(
				{
					name: $name,
					email: $email,
					password: $password,
					callbackURL: '/admin'
				},
				{
					async onSuccess() {
						// Registration successful - show verification message
						console.log('Registration successful, verification email sent');
						registrationSuccess = true;
						registeredEmail = $email;

						// Note: Welcome email will be sent after email verification is completed
						// This prevents sending both verification and welcome emails at the same time
						console.log('Welcome email will be sent after email verification');
					},
					onError(context) {
						// Handle registration errors with comprehensive error mapping
						const errorMessage = context.error.message || '';
						const errorCode = context.error.code || '';

						// Handle duplicate email registration errors
						if (
							errorMessage.toLowerCase().includes('email') &&
							(errorMessage.toLowerCase().includes('already') ||
								errorMessage.toLowerCase().includes('exists') ||
								errorMessage.toLowerCase().includes('duplicate') ||
								errorCode === 'EMAIL_ALREADY_EXISTS')
						) {
							setFieldError(
								'general',
								'Ezzel az email címmel már létezik fiók. Kérjük próbáljon bejelentkezni helyette.'
							);
							return;
						}

						// Handle network errors with retry suggestions
						if (
							errorMessage.toLowerCase().includes('network') ||
							errorMessage.toLowerCase().includes('fetch') ||
							errorMessage.toLowerCase().includes('connection') ||
							errorCode === 'NETWORK_ERROR'
						) {
							setFieldError(
								'general',
								'Hálózati hiba miatt nem sikerült létrehozni a fiókot. Kérjük ellenőrizze az internetkapcsolatot és próbálja újra.'
							);
							return;
						}

						// Handle server validation errors from Better Auth responses
						if (
							errorMessage.toLowerCase().includes('validation') ||
							errorMessage.toLowerCase().includes('invalid') ||
							errorCode === 'VALIDATION_ERROR'
						) {
							// Check if it's a specific field validation error
							if (errorMessage.toLowerCase().includes('name')) {
								setFieldError('name', 'Please enter a valid name.');
							} else if (errorMessage.toLowerCase().includes('email')) {
								setFieldError('email', 'Please enter a valid email address.');
							} else if (errorMessage.toLowerCase().includes('password')) {
								setFieldError('password', 'Password does not meet requirements.');
							} else {
								setFieldError('general', 'Please check your input and try again.');
							}
							return;
						}

						// Handle server errors
						if (
							errorMessage.toLowerCase().includes('server') ||
							errorMessage.toLowerCase().includes('internal') ||
							errorCode === 'INTERNAL_SERVER_ERROR'
						) {
							setFieldError('general', 'Server error occurred. Please try again in a few moments.');
							return;
						}

						// Handle rate limiting
						if (
							errorMessage.toLowerCase().includes('rate') ||
							errorMessage.toLowerCase().includes('limit') ||
							errorCode === 'RATE_LIMITED'
						) {
							setFieldError(
								'general',
								'Too many registration attempts. Please wait a moment and try again.'
							);
							return;
						}

						// Fallback for any other specific error messages
						if (errorMessage) {
							setFieldError('general', errorMessage);
						} else {
							setFieldError('general', 'Registration failed. Please try again.');
						}
					}
				}
			);
		} catch (error) {
			// Fallback error handling for unexpected scenarios
			console.error('Unexpected registration error:', error);

			// Provide specific error messages based on error type
			if (error instanceof TypeError && error.message.includes('fetch')) {
				setFieldError(
					'general',
					'Network connection failed. Please check your internet connection and try again.'
				);
			} else if (error instanceof Error) {
				// Log the actual error for debugging but show user-friendly message
				console.error('Registration error details:', error.message);
				setFieldError(
					'general',
					'An unexpected error occurred during registration. Please try again later.'
				);
			} else {
				setFieldError('general', 'An unexpected error occurred. Please try again later.');
			}
		} finally {
			$isLoading = false;
		}
	};

	const handleGoogleSignUp = async () => {
		// TODO: Implement Google OAuth registration in task 4
		console.log('Google registration attempt');
		alert('Google registration will be implemented in task 4');
	};
</script>

<Card.Root class="mx-auto max-w-sm">
	<Card.Header>
		<Card.Title class="text-2xl">
			{registrationSuccess ? 'Ellenőrizze az emailjét' : 'Fiók létrehozása'}
		</Card.Title>
		<Card.Description>
			{registrationSuccess
				? 'Megerősítő emailt küldtünk az Ön email címére'
				: 'Adja meg az adatait a fiók létrehozásához'}
		</Card.Description>
	</Card.Header>
	<Card.Content>
		{#if registrationSuccess}
			<div class="space-y-4 text-center">
				<div
					class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
				>
					<svg
						class="h-6 w-6 text-green-600 dark:text-green-400"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<div class="space-y-2">
					<h3 class="text-lg font-medium">Fiók sikeresen létrehozva!</h3>
					<p class="text-sm text-gray-600 dark:text-gray-400">
						Megerősítő emailt küldtünk a <strong>{registeredEmail}</strong> címre.
					</p>
				</div>

				<div class="rounded-md bg-blue-50 p-4 text-sm dark:bg-blue-950">
					<div class="flex items-start gap-3">
						<div class="shrink-0">
							<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="text-blue-800 dark:text-blue-200">
							<p class="mb-2 font-medium">Következő lépések:</p>
							<ol class="list-inside list-decimal space-y-1 text-xs">
								<li>Ellenőrizze a postafiókját (beleértve a spam mappát is)</li>
								<li>Kattintson a megerősítő linkre az emailben</li>
								<li>Ezután bejelentkezhet a fiókjába</li>
							</ol>
							<p class="mt-2 text-xs font-medium">
								⚠️ A bejelentkezéshez kötelező az email cím megerősítése!
							</p>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<Button class="w-full" onclick={() => (window.location.href = '/resend-verification')}>
						Nem kapta meg az emailt?
					</Button>
					<Button
						variant="outline"
						class="w-full"
						onclick={() => (window.location.href = '/admin/sign-in?registered=true')}
					>
						Vissza a bejelentkezéshez
					</Button>
				</div>

				<p class="text-xs text-gray-500">Ellenőrizze a spam mappát is, ha nem látja az emailt.</p>
			</div>
		{:else}
			<div class="grid gap-4">
				<!-- Email verification requirement notice -->
				<div class="rounded-md bg-amber-50 p-3 text-sm dark:bg-amber-950">
					<div class="flex items-start gap-2">
						<svg
							class="mt-0.5 h-4 w-4 shrink-0 text-amber-400"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
								clip-rule="evenodd"
							/>
						</svg>
						<div class="text-amber-800 dark:text-amber-200">
							<p class="font-medium">Email megerősítés szükséges</p>
							<p class="mt-1 text-xs">
								A regisztráció után megerősítő emailt fog kapni. A bejelentkezéshez kötelező az
								email cím megerősítése.
							</p>
						</div>
					</div>
				</div>
				{#if $errors.general}
					<div
						class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
					>
						<div class="flex items-center gap-2">
							<svg class="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{$errors.general}</span>
						</div>
					</div>
				{/if}

				<div class="grid gap-2">
					<Label for="name">Teljes név</Label>
					<Input
						id="name"
						type="text"
						placeholder="Kovács János"
						required
						bind:value={$name}
						onblur={handleNameValidation}
						oninput={() => {
							// Clear error on input to provide immediate feedback
							if ($errors.name) {
								setFieldError('name', '');
							}
						}}
						class={$errors.name
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: $name && !$errors.name
								? 'border-green-500'
								: ''}
					/>
					{#if $errors.name}
						<div class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
							<svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zM9.25 15a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0V15z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{$errors.name}</span>
						</div>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="email">Email cím</Label>
					<Input
						id="email"
						type="email"
						placeholder="pelda@email.com"
						required
						bind:value={$email}
						onblur={handleEmailValidation}
						oninput={() => {
							// Clear error on input to provide immediate feedback
							if ($errors.email) {
								setFieldError('email', '');
							}
						}}
						class={$errors.email
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: $email && !$errors.email
								? 'border-green-500'
								: ''}
					/>
					{#if $errors.email}
						<div class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
							<svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zM9.25 15a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0V15z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{$errors.email}</span>
						</div>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="password">Jelszó</Label>
					<Input
						id="password"
						type="password"
						required
						bind:value={$password}
						onblur={handlePasswordValidation}
						oninput={() => {
							// Clear error on input to provide immediate feedback
							if ($errors.password) {
								setFieldError('password', '');
							}
						}}
						class={$errors.password
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: $password && !$errors.password
								? 'border-green-500'
								: ''}
					/>
					{#if $errors.password}
						<div class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
							<svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zM9.25 15a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0V15z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{$errors.password}</span>
						</div>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="confirmPassword">Jelszó megerősítése</Label>
					<Input
						id="confirmPassword"
						type="password"
						required
						bind:value={$confirmPassword}
						onblur={handleConfirmPasswordValidation}
						oninput={() => {
							// Clear error on input to provide immediate feedback
							if ($errors.confirmPassword) {
								setFieldError('confirmPassword', '');
							}
						}}
						class={$errors.confirmPassword
							? 'border-red-500 focus:border-red-500 focus:ring-red-500'
							: $confirmPassword && !$errors.confirmPassword
								? 'border-green-500'
								: ''}
					/>
					{#if $errors.confirmPassword}
						<div class="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
							<svg class="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zM9.25 15a.75.75 0 011.5 0v.01a.75.75 0 01-1.5 0V15z"
									clip-rule="evenodd"
								/>
							</svg>
							<span>{$errors.confirmPassword}</span>
						</div>
					{/if}
				</div>

				<Button
					type="button"
					class="w-full"
					onclick={handleSignUp}
					disabled={$isLoading || !$isFormValid}
				>
					{$isLoading ? 'Fiók létrehozása...' : 'Fiók létrehozása'}
				</Button>

				<Button
					variant="outline"
					class="w-full"
					disabled={$isLoading}
					onclick={async () => {
						await authClient.signIn.social({
							provider: 'google',
							callbackURL: '/admin'
						});
					}}
				>
					Regisztráció Google-lel
				</Button>
			</div>

			<div class="mt-4 text-center text-sm">
				Már van fiókja?
				<a href="/admin/sign-in" class="underline">Bejelentkezés</a>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
