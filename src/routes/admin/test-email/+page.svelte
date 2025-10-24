<script lang="ts">
	import { sendTestEmail } from '$lib/auth/test-email.remote';
	import { getEmailConfig } from '$lib/auth/debug-email.remote';
	import { testResendAPI } from '$lib/auth/test-resend-api.remote';
	import { testSMTPConnection } from '$lib/auth/test-smtp.remote';
	import { debugNodemailer } from '$lib/auth/debug-nodemailer.remote';
	import { reinitializeEmail } from '$lib/auth/reinit-email.remote';
	import { testEnvValidation } from '$lib/auth/test-env-validation.remote';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	let email = $state('szigeti.developer@gmail.com');
	let name = $state('Test User');
	let isLoading = $state(false);
	let result = $state<any>(null);
	let error = $state<string>('');
	let apiTestResult = $state<any>(null);
	let isApiTesting = $state(false);
	let smtpTestResult = $state<any>(null);
	let isSMTPTesting = $state(false);
	let nodemailerDebugResult = $state<any>(null);
	let isNodemailerDebugging = $state(false);
	let reinitResult = $state<any>(null);
	let isReinitializing = $state(false);
	let envValidationResult = $state<any>(null);
	let isEnvValidating = $state(false);

	// Load debug config
	const configPromise = getEmailConfig();

	// Get current provider from config
	let currentProvider = $state('loading...');
	configPromise
		.then((config) => {
			// Determine provider from environment variables
			currentProvider = config.environmentVariables.EMAIL_PROVIDER || 'resend';
		})
		.catch(() => {
			currentProvider = 'resend'; // fallback
		});

	const handleSendTest = async () => {
		if (!email) {
			error = 'Email is required';
			return;
		}

		isLoading = true;
		error = '';
		result = null;

		try {
			const response = await sendTestEmail({ email, name });
			result = response;
			console.log('Test email result:', response);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Unknown error occurred';
			console.error('Test email error:', err);
		} finally {
			isLoading = false;
		}
	};

	const handleApiTest = async () => {
		isApiTesting = true;
		apiTestResult = null;

		try {
			const response = await testResendAPI();
			apiTestResult = response;
			console.log('API test result:', response);
		} catch (err) {
			apiTestResult = {
				success: false,
				error: err instanceof Error ? err.message : 'Unknown error occurred'
			};
			console.error('API test error:', err);
		} finally {
			isApiTesting = false;
		}
	};

	const handleSMTPTest = async () => {
		isSMTPTesting = true;
		smtpTestResult = null;

		try {
			const response = await testSMTPConnection();
			smtpTestResult = response;
			console.log('SMTP test result:', response);
		} catch (err) {
			smtpTestResult = {
				success: false,
				error: err instanceof Error ? err.message : 'Unknown error occurred'
			};
			console.error('SMTP test error:', err);
		} finally {
			isSMTPTesting = false;
		}
	};

	const handleNodemailerDebug = async () => {
		isNodemailerDebugging = true;
		nodemailerDebugResult = null;

		try {
			const response = await debugNodemailer();
			nodemailerDebugResult = response;
			console.log('Nodemailer debug result:', response);
		} catch (err) {
			nodemailerDebugResult = {
				success: false,
				error: err instanceof Error ? err.message : 'Unknown error occurred'
			};
			console.error('Nodemailer debug error:', err);
		} finally {
			isNodemailerDebugging = false;
		}
	};

	const handleReinitialize = async () => {
		isReinitializing = true;
		reinitResult = null;

		try {
			const response = await reinitializeEmail();
			reinitResult = response;
			console.log('Reinitialize result:', response);

			// Refresh config after reinitialize
			if (response.success) {
				// Reload the page to get fresh config
				window.location.reload();
			}
		} catch (err) {
			reinitResult = {
				success: false,
				error: err instanceof Error ? err.message : 'Unknown error occurred'
			};
			console.error('Reinitialize error:', err);
		} finally {
			isReinitializing = false;
		}
	};

	const handleEnvValidation = async () => {
		isEnvValidating = true;
		envValidationResult = null;

		try {
			const response = await testEnvValidation();
			envValidationResult = response;
			console.log('Env validation result:', response);
		} catch (err) {
			envValidationResult = {
				success: false,
				error: err instanceof Error ? err.message : 'Unknown error occurred'
			};
			console.error('Env validation error:', err);
		} finally {
			isEnvValidating = false;
		}
	};
</script>

<div class="container mx-auto max-w-md p-4">
	<Card.Root>
		<Card.Header>
			<Card.Title>Email Teszt</Card.Title>
			<Card.Description>
				Tesztelj egy üdvözlő email küldést a jelenleg beállított szolgáltatással
			</Card.Description>
			<div class="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
				<strong>Aktív Provider:</strong> <code>{currentProvider}</code>
				<br />
				{#if currentProvider === 'resend'}
					<strong>Figyelem:</strong> Resend ingyenes fiókkal csak a regisztrált email címedre
					küldhetsz. Verifikált cím: <code>szigeti.developer@gmail.com</code>
				{:else if currentProvider === 'smtp'}
					<strong>SMTP beállítva:</strong> Gmail vagy más SMTP szerver használatban.
				{:else}
					<strong>Provider:</strong> {currentProvider} szolgáltató használatban.
				{/if}
			</div>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<Label for="email">Email cím</Label>
				<Input id="email" type="email" placeholder="test@example.com" bind:value={email} />
			</div>

			<div class="space-y-2">
				<Label for="name">Név</Label>
				<Input id="name" type="text" placeholder="Test User" bind:value={name} />
			</div>

			<div class="space-y-2">
				<!-- Fő teszt gomb - mindig az aktuális providert használja -->
				<Button onclick={handleSendTest} disabled={isLoading || !email} class="w-full">
					{isLoading ? 'Küldés...' : `Teszt Email Küldése (${currentProvider})`}
				</Button>

				<!-- Provider-specifikus tesztek -->
				<div class="grid grid-cols-2 gap-2">
					<Button onclick={handleApiTest} disabled={isApiTesting} variant="outline" size="sm">
						{isApiTesting ? 'Resend...' : 'Resend Teszt'}
					</Button>

					<Button onclick={handleSMTPTest} disabled={isSMTPTesting} variant="outline" size="sm">
						{isSMTPTesting ? 'SMTP...' : 'SMTP Teszt'}
					</Button>
				</div>

				<!-- Debug, Reinit és Env Validation gombok -->
				<div class="grid grid-cols-3 gap-2">
					<Button
						onclick={handleNodemailerDebug}
						disabled={isNodemailerDebugging}
						variant="outline"
						size="sm"
					>
						{isNodemailerDebugging ? 'Debug...' : 'Nodemailer'}
					</Button>

					<Button
						onclick={handleReinitialize}
						disabled={isReinitializing}
						variant="outline"
						size="sm"
					>
						{isReinitializing ? 'Reinit...' : 'Reinit'}
					</Button>

					<Button
						onclick={handleEnvValidation}
						disabled={isEnvValidating}
						variant="outline"
						size="sm"
					>
						{isEnvValidating ? 'Env...' : 'Env Check'}
					</Button>
				</div>
			</div>

			{#if error}
				<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
					<strong>Hiba:</strong>
					{error}
				</div>
			{/if}

			{#if result}
				<div class="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
					<strong>Siker!</strong>
					{result.message}
					{#if result.messageId}
						<br /><strong>Message ID:</strong> {result.messageId}
					{/if}
					{#if result.config}
						<br /><strong>Test Mode:</strong>
						{result.config.testMode ? 'Igen' : 'Nem'}
						<br /><strong>From Email:</strong>
						{result.config.fromEmail}
					{/if}
				</div>
			{/if}

			{#if apiTestResult}
				<div
					class="rounded-md border p-3 text-sm {apiTestResult.success
						? 'border-green-200 bg-green-50 text-green-800'
						: 'border-red-200 bg-red-50 text-red-800'}"
				>
					<strong>API Teszt:</strong>
					{apiTestResult.success ? 'Sikeres' : 'Sikertelen'}
					{#if apiTestResult.messageId}
						<br /><strong>Message ID:</strong> {apiTestResult.messageId}
					{/if}
					{#if apiTestResult.error}
						<br /><strong>Hiba:</strong> {apiTestResult.error}
					{/if}
					{#if apiTestResult.details}
						<br /><strong>Részletek:</strong>
						<pre class="mt-1 text-xs">{JSON.stringify(apiTestResult.details, null, 2)}</pre>
					{/if}
				</div>
			{/if}

			{#if smtpTestResult}
				<div
					class="rounded-md border p-3 text-sm {smtpTestResult.success
						? 'border-green-200 bg-green-50 text-green-800'
						: 'border-red-200 bg-red-50 text-red-800'}"
				>
					<strong>SMTP Teszt:</strong>
					{smtpTestResult.success ? 'Sikeres' : 'Sikertelen'}
					{#if smtpTestResult.messageId}
						<br /><strong>Message ID:</strong> {smtpTestResult.messageId}
					{/if}
					{#if smtpTestResult.config}
						<br /><strong>Host:</strong>
						{smtpTestResult.config.host}:{smtpTestResult.config.port}
						<br /><strong>Username:</strong>
						{smtpTestResult.config.username}
						<br /><strong>Secure:</strong>
						{smtpTestResult.config.secure ? 'Igen' : 'Nem'}
					{/if}
					{#if smtpTestResult.error}
						<br /><strong>Hiba:</strong> {smtpTestResult.error}
					{/if}
					{#if smtpTestResult.details}
						<br /><strong>Részletek:</strong>
						<pre class="mt-1 text-xs">{JSON.stringify(smtpTestResult.details, null, 2)}</pre>
					{/if}
				</div>
			{/if}

			{#if nodemailerDebugResult}
				<div
					class="rounded-md border p-3 text-sm {nodemailerDebugResult.success
						? 'border-green-200 bg-green-50 text-green-800'
						: 'border-red-200 bg-red-50 text-red-800'}"
				>
					<strong>Nodemailer Debug:</strong>
					{nodemailerDebugResult.success ? 'Sikeres' : 'Sikertelen'}
					{#if nodemailerDebugResult.message}
						<br /><strong>Üzenet:</strong> {nodemailerDebugResult.message}
					{/if}
					{#if nodemailerDebugResult.error}
						<br /><strong>Hiba:</strong> {nodemailerDebugResult.error}
					{/if}
					{#if nodemailerDebugResult.details}
						<br /><strong>Részletek:</strong>
						<pre class="mt-1 text-xs">{JSON.stringify(nodemailerDebugResult.details, null, 2)}</pre>
					{/if}
				</div>
			{/if}

			{#if reinitResult}
				<div
					class="rounded-md border p-3 text-sm {reinitResult.success
						? 'border-green-200 bg-green-50 text-green-800'
						: 'border-red-200 bg-red-50 text-red-800'}"
				>
					<strong>Email Service Reinit:</strong>
					{reinitResult.success ? 'Sikeres' : 'Sikertelen'}
					{#if reinitResult.message}
						<br /><strong>Üzenet:</strong> {reinitResult.message}
					{/if}
					{#if reinitResult.state}
						<br /><strong>Állapot:</strong> Initialized: {reinitResult.state.initialized}, Degraded: {reinitResult
							.state.degraded}
					{/if}
					{#if reinitResult.error}
						<br /><strong>Hiba:</strong> {reinitResult.error}
					{/if}
					{#if reinitResult.details}
						<br /><strong>Részletek:</strong>
						<pre class="mt-1 text-xs">{JSON.stringify(reinitResult.details, null, 2)}</pre>
					{/if}
				</div>
			{/if}

			{#if envValidationResult}
				<div
					class="rounded-md border p-3 text-sm {envValidationResult.success
						? 'border-green-200 bg-green-50 text-green-800'
						: 'border-red-200 bg-red-50 text-red-800'}"
				>
					<strong>Environment Validation:</strong>
					{envValidationResult.success ? 'Sikeres' : 'Sikertelen'}
					{#if envValidationResult.message}
						<br /><strong>Üzenet:</strong> {envValidationResult.message}
					{/if}
					{#if envValidationResult.config}
						<br /><strong>Provider:</strong>
						{envValidationResult.config.EMAIL_PROVIDER}
						<br /><strong>Provider Config:</strong>
						<pre class="mt-1 text-xs">{JSON.stringify(
								envValidationResult.config.providerConfig,
								null,
								2
							)}</pre>
					{/if}
					{#if envValidationResult.error}
						<br /><strong>Hiba:</strong> {envValidationResult.error}
					{/if}
					{#if envValidationResult.details}
						<br /><strong>Részletek:</strong>
						<pre class="mt-1 text-xs">{JSON.stringify(envValidationResult.details, null, 2)}</pre>
					{/if}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Debug Information -->
	<Card.Root class="mt-4">
		<Card.Header>
			<Card.Title>Debug Információk</Card.Title>
		</Card.Header>
		<Card.Content>
			{#await configPromise}
				<p>Konfiguráció betöltése...</p>
			{:then config}
				<div class="space-y-4 text-sm">
					<div>
						<h4 class="font-semibold">Environment Változók:</h4>
						<ul class="ml-4 list-inside list-disc">
							<li>EMAIL_PROVIDER: <code>{config.environmentVariables.EMAIL_PROVIDER}</code></li>
							<li>EMAIL_TEST_MODE: <code>{config.environmentVariables.EMAIL_TEST_MODE}</code></li>
							<li>NODE_ENV: <code>{config.environmentVariables.NODE_ENV}</code></li>
							<li>
								RESEND_FROM_EMAIL: <code>{config.environmentVariables.RESEND_FROM_EMAIL}</code>
							</li>
							<li>EMAIL_LOG_LEVEL: <code>{config.environmentVariables.EMAIL_LOG_LEVEL}</code></li>
						</ul>
					</div>

					{#if config.emailManagerConfig}
						<div>
							<h4 class="font-semibold">Email Manager Konfiguráció:</h4>
							<ul class="ml-4 list-inside list-disc">
								<li>Test Mode: <code>{config.emailManagerConfig.testMode}</code></li>
								<li>From Email: <code>{config.emailManagerConfig.fromEmail}</code></li>
								<li>Log Level: <code>{config.emailManagerConfig.logLevel}</code></li>
								<li>Has API Key: <code>{config.emailManagerConfig.hasApiKey}</code></li>
							</ul>
						</div>
					{/if}

					<div>
						<h4 class="font-semibold">Szolgáltatás Állapot:</h4>
						<p>Email Service Available: <code>{config.emailServiceAvailable}</code></p>
					</div>
				</div>
			{:catch err}
				<p class="text-red-600">Hiba a konfiguráció betöltésekor: {err.message}</p>
			{/await}
		</Card.Content>
	</Card.Root>

	<div class="mt-6 text-sm text-gray-600">
		<h3 class="mb-2 font-semibold">Hogyan működik:</h3>
		<ul class="list-inside list-disc space-y-1">
			<li><strong>"Teszt Email Küldése"</strong> - Az aktuálisan beállított providert használja</li>
			<li>
				<strong>"Resend Teszt"</strong> - Mindig Resend API-t tesztel (függetlenül a beállítástól)
			</li>
			<li>
				<strong>"SMTP Teszt"</strong> - Mindig SMTP kapcsolatot tesztel (függetlenül a beállítástól)
			</li>
			<li>
				<strong>"Reinit"</strong> - Újrainicializálja az email szolgáltatást (provider váltás után)
			</li>
			<li>
				<strong>"Env Check"</strong> - Ellenőrzi az environment változók validációját
			</li>
			<li>Ha <code>EMAIL_TEST_MODE=false</code>, akkor ténylegesen elküldi az emailt</li>
			<li>Ha <code>EMAIL_TEST_MODE=true</code>, akkor csak szimulálja a küldést</li>
			<li>Ellenőrizd a konzolt a részletes logokért</li>
		</ul>
	</div>
</div>
