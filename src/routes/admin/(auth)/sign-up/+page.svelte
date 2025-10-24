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
			return 'Name is required';
		}

		if (nameValue.trim().length < 2) {
			return 'Name must be at least 2 characters long';
		}

		return '';
	};

	const validateEmail = (emailValue: string): string => {
		if (!emailValue.trim()) {
			return 'Email is required';
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailValue)) {
			return 'Please enter a valid email address';
		}

		return '';
	};

	const validatePassword = (passwordValue: string): string => {
		if (!passwordValue) {
			return 'Password is required';
		}

		if (passwordValue.length < 8) {
			return 'Password must be at least 8 characters long';
		}

		const hasUpperCase = /[A-Z]/.test(passwordValue);
		const hasLowerCase = /[a-z]/.test(passwordValue);
		const hasNumbers = /\d/.test(passwordValue);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);

		if (!hasUpperCase) {
			return 'Password must contain at least one uppercase letter';
		}

		if (!hasLowerCase) {
			return 'Password must contain at least one lowercase letter';
		}

		if (!hasNumbers) {
			return 'Password must contain at least one number';
		}

		if (!hasSpecialChar) {
			return 'Password must contain at least one special character';
		}

		return '';
	};

	const validatePasswordMatch = (passwordValue: string, confirmPasswordValue: string): string => {
		if (!confirmPasswordValue) {
			return 'Please confirm your password';
		}

		if (passwordValue !== confirmPasswordValue) {
			return 'Passwords do not match';
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
						// Registration successful - send welcome email
						console.log('Registration successful, sending welcome email...');

						try {
							await sendWelcomeEmail({
								name: $name,
								email: $email
							});
							console.log('Welcome email sent successfully');
						} catch (emailError) {
							// Don't fail the registration if email fails
							console.error('Failed to send welcome email:', emailError);
						}
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
								'An account with this email address already exists. Please try signing in instead.'
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
								'Unable to create account due to network issues. Please check your internet connection and try again.'
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
		<Card.Title class="text-2xl">Create Account</Card.Title>
		<Card.Description>Enter your details below to create your account</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
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
				<Label for="name">Full Name</Label>
				<Input
					id="name"
					type="text"
					placeholder="John Doe"
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
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="m@example.com"
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
				<Label for="password">Password</Label>
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
				<Label for="confirmPassword">Confirm Password</Label>
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
				{$isLoading ? 'Creating Account...' : 'Create Account'}
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
				Sign up with Google
			</Button>
		</div>

		<div class="mt-4 text-center text-sm">
			Already have an account?
			<a href="/admin/sign-in" class="underline">Sign in</a>
		</div>
	</Card.Content>
</Card.Root>
