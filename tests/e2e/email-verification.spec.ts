import { test, expect } from '@playwright/test';

test.describe('Email Verification E2E Flow', () => {
	test.beforeEach(async ({ page }) => {
		// Mock email sending to avoid actual email delivery during tests
		await page.route('**/api/auth/send-verification-email', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ success: true, message: 'Verification email sent' })
			});
		});

		await page.route('**/api/auth/verify-email*', async (route) => {
			const url = new URL(route.request().url());
			const token = url.searchParams.get('token');

			// Simulate different token scenarios
			if (token === 'valid-token') {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({ success: true })
				});
			} else if (token === 'expired-token') {
				await route.fulfill({
					status: 400,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'Token expired' })
				});
			} else if (token === 'invalid-token') {
				await route.fulfill({
					status: 404,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'Token not found' })
				});
			} else {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'Server error' })
				});
			}
		});
	});

	test.describe('Email Verification Page', () => {
		test('should show loading state initially', async ({ page }) => {
			await page.goto('/verify-email?token=valid-token');

			// Should show loading state first
			await expect(page.locator('text=Megerősítés folyamatban...')).toBeVisible();
			await expect(page.locator('.animate-spin')).toBeVisible();
		});

		test('should show success message for valid token', async ({ page }) => {
			await page.goto('/verify-email?token=valid-token');

			// Wait for verification to complete
			await expect(page.locator('text=✓ Sikeres megerősítés!')).toBeVisible();
			await expect(
				page.locator('text=Az email címe sikeresen megerősítésre került.')
			).toBeVisible();
			await expect(page.locator('text=Mostantól bejelentkezhet a fiókjába.')).toBeVisible();

			// Should have sign in button
			await expect(page.locator('button:has-text("Bejelentkezés most")')).toBeVisible();

			// Should show countdown for auto-redirect
			await expect(page.locator('text=Automatikus átirányítás 3 másodperc múlva...')).toBeVisible();
		});

		test('should show expired message for expired token', async ({ page }) => {
			await page.goto('/verify-email?token=expired-token');

			await expect(page.locator('text=⚠ Lejárt link')).toBeVisible();
			await expect(page.locator('text=A megerősítési link lejárt.')).toBeVisible();

			// Should have resend and sign in buttons
			await expect(page.locator('button:has-text("Új megerősítő email kérése")')).toBeVisible();
			await expect(page.locator('button:has-text("Vissza a bejelentkezéshez")')).toBeVisible();
		});

		test('should show invalid message for invalid token', async ({ page }) => {
			await page.goto('/verify-email?token=invalid-token');

			await expect(page.locator('text=✗ Érvénytelen link')).toBeVisible();
			await expect(
				page.locator('text=A megerősítési link érvénytelen vagy már felhasználásra került.')
			).toBeVisible();

			// Should have resend and sign in buttons
			await expect(page.locator('button:has-text("Új megerősítő email kérése")')).toBeVisible();
			await expect(page.locator('button:has-text("Vissza a bejelentkezéshez")')).toBeVisible();
		});

		test('should show error message for missing token', async ({ page }) => {
			await page.goto('/verify-email');

			await expect(page.locator('text=✗ Érvénytelen link')).toBeVisible();
			await expect(page.locator('text=Hiányzó megerősítési token')).toBeVisible();
		});

		test('should handle server error gracefully', async ({ page }) => {
			await page.goto('/verify-email?token=server-error-token');

			await expect(page.locator('text=✗ Hiba történt')).toBeVisible();
			await expect(page.locator('text=Nem sikerült megerősíteni az email címet.')).toBeVisible();

			// Should have retry, resend and sign in buttons
			await expect(page.locator('button:has-text("Újrapróbálkozás")')).toBeVisible();
			await expect(page.locator('button:has-text("Új megerősítő email kérése")')).toBeVisible();
			await expect(page.locator('button:has-text("Vissza a bejelentkezéshez")')).toBeVisible();
		});

		test('should navigate to resend page when clicking resend button', async ({ page }) => {
			await page.goto('/verify-email?token=expired-token');

			await expect(page.locator('button:has-text("Új megerősítő email kérése")')).toBeVisible();
			await page.click('button:has-text("Új megerősítő email kérése")');

			await expect(page).toHaveURL('/resend-verification');
		});

		test('should navigate to sign in when clicking sign in button', async ({ page }) => {
			await page.goto('/verify-email?token=valid-token');

			await expect(page.locator('button:has-text("Bejelentkezés most")')).toBeVisible();
			await page.click('button:has-text("Bejelentkezés most")');

			await expect(page).toHaveURL('/admin/sign-in');
		});
	});

	test.describe('Resend Verification Page', () => {
		test('should display resend verification form', async ({ page }) => {
			await page.goto('/resend-verification');

			await expect(page.locator('h1:has-text("Megerősítő email újraküldése")')).toBeVisible();
			await expect(page.locator('text=Desktop Environment')).toBeVisible();
			await expect(page.locator('label:has-text("Email cím")')).toBeVisible();
			await expect(page.locator('input[type="email"]')).toBeVisible();
			await expect(page.locator('button:has-text("Megerősítő email küldése")')).toBeVisible();
		});

		test('should pre-fill email from URL parameter', async ({ page }) => {
			await page.goto('/resend-verification?email=test@example.com');

			const emailInput = page.locator('input[type="email"]');
			await expect(emailInput).toHaveValue('test@example.com');
		});

		test('should validate email format', async ({ page }) => {
			await page.goto('/resend-verification');

			// Try with invalid email
			await page.fill('input[type="email"]', 'invalid-email');
			await page.click('button:has-text("Megerősítő email küldése")');

			await expect(page.locator('text=Kérjük adjon meg egy érvényes email címet')).toBeVisible();
		});

		test('should require email field', async ({ page }) => {
			await page.goto('/resend-verification');

			// Try to submit without email
			await page.click('button:has-text("Megerősítő email küldése")');

			await expect(page.locator('text=Kérjük adja meg az email címét')).toBeVisible();
		});

		test('should show success message after sending email', async ({ page }) => {
			await page.goto('/resend-verification');

			await page.fill('input[type="email"]', 'test@example.com');
			await page.click('button:has-text("Megerősítő email küldése")');

			// Should show loading state
			await expect(page.locator('text=Küldés...')).toBeVisible();

			// Should show success message
			await expect(page.locator('text=Megerősítő email sikeresen elküldve!')).toBeVisible();
			await expect(page.locator('text=Ellenőrizze a postafiókját.')).toBeVisible();

			// Button should be disabled during cooldown
			await expect(page.locator('button:has-text("Újrapróbálkozás")')).toBeVisible();
		});

		test('should handle rate limiting', async ({ page }) => {
			// Mock rate limited response
			await page.route('**/api/auth/send-verification-email', async (route) => {
				await route.fulfill({
					status: 429,
					contentType: 'application/json',
					headers: { 'Retry-After': '30' },
					body: JSON.stringify({ error: 'Rate limited' })
				});
			});

			await page.goto('/resend-verification');

			await page.fill('input[type="email"]', 'test@example.com');
			await page.click('button:has-text("Megerősítő email küldése")');

			await expect(page.locator('text=Túl sok kérés. Kérjük próbálja újra később.')).toBeVisible();
			await expect(page.locator('text=Újrapróbálkozás 30s múlva')).toBeVisible();
		});

		test('should handle non-existent email', async ({ page }) => {
			// Mock not found response
			await page.route('**/api/auth/send-verification-email', async (route) => {
				await route.fulfill({
					status: 404,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'Email not found' })
				});
			});

			await page.goto('/resend-verification');

			await page.fill('input[type="email"]', 'nonexistent@example.com');
			await page.click('button:has-text("Megerősítő email küldése")');

			await expect(
				page.locator('text=Ez az email cím nincs regisztrálva a rendszerben.')
			).toBeVisible();
		});

		test('should navigate to sign in page', async ({ page }) => {
			await page.goto('/resend-verification');

			await page.click('button:has-text("Vissza a bejelentkezéshez")');

			await expect(page).toHaveURL('/admin/sign-in');
		});

		test('should navigate to sign up page', async ({ page }) => {
			await page.goto('/resend-verification');

			await page.click('text=Regisztráljon itt');

			await expect(page).toHaveURL('/admin/sign-up');
		});
	});

	test.describe('Complete Email Verification Flow', () => {
		test('should complete full verification flow from resend to success', async ({ page }) => {
			// Start at resend page
			await page.goto('/resend-verification');

			// Fill and submit email
			await page.fill('input[type="email"]', 'test@example.com');
			await page.click('button:has-text("Megerősítő email küldése")');

			// Should show success message
			await expect(page.locator('text=Megerősítő email sikeresen elküldve!')).toBeVisible();

			// Navigate to verification page with valid token
			await page.goto('/verify-email?token=valid-token');

			// Should show success
			await expect(page.locator('text=✓ Sikeres megerősítés!')).toBeVisible();

			// Click sign in button
			await page.click('button:has-text("Bejelentkezés most")');

			// Should navigate to sign in
			await expect(page).toHaveURL('/admin/sign-in');
		});

		test('should handle expired token flow with resend', async ({ page }) => {
			// Start with expired token
			await page.goto('/verify-email?token=expired-token');

			// Should show expired message
			await expect(page.locator('text=⚠ Lejárt link')).toBeVisible();

			// Click resend button
			await page.click('button:has-text("Új megerősítő email kérése")');

			// Should navigate to resend page
			await expect(page).toHaveURL('/resend-verification');

			// Fill email and resend
			await page.fill('input[type="email"]', 'test@example.com');
			await page.click('button:has-text("Megerősítő email küldése")');

			// Should show success
			await expect(page.locator('text=Megerősítő email sikeresen elküldve!')).toBeVisible();
		});

		test('should handle network errors gracefully', async ({ page }) => {
			// Mock network error
			await page.route('**/api/auth/verify-email*', async (route) => {
				await route.abort('failed');
			});

			await page.goto('/verify-email?token=any-token');

			await expect(page.locator('text=✗ Hiba történt')).toBeVisible();
			await expect(page.locator('text=Hálózati hiba történt')).toBeVisible();

			// Should have retry button
			await expect(page.locator('button:has-text("Újrapróbálkozás")')).toBeVisible();
		});
	});

	test.describe('Accessibility and UX', () => {
		test('should have proper page titles', async ({ page }) => {
			await page.goto('/verify-email?token=valid-token');
			await expect(page).toHaveTitle('Email megerősítés - Desktop Environment');

			await page.goto('/resend-verification');
			await expect(page).toHaveTitle('Megerősítő email újraküldése - Desktop Environment');
		});

		test('should have proper form labels and accessibility', async ({ page }) => {
			await page.goto('/resend-verification');

			// Check form accessibility
			const emailInput = page.locator('input[type="email"]');
			await expect(emailInput).toHaveAttribute('required');
			await expect(emailInput).toHaveAttribute('placeholder', 'pelda@email.com');

			// Check label association
			const label = page.locator('label[for="email"]');
			await expect(label).toBeVisible();
			await expect(label).toHaveText('Email cím');
		});

		test('should show loading states appropriately', async ({ page }) => {
			await page.goto('/resend-verification');

			await page.fill('input[type="email"]', 'test@example.com');

			// Click submit and check loading state
			const submitPromise = page.click('button:has-text("Megerősítő email küldése")');

			// Should show loading state
			await expect(page.locator('text=Küldés...')).toBeVisible();
			await expect(page.locator('.animate-spin')).toBeVisible();

			await submitPromise;
		});

		test('should handle keyboard navigation', async ({ page }) => {
			await page.goto('/resend-verification');

			// Tab through form elements
			await page.keyboard.press('Tab'); // Email input
			await expect(page.locator('input[type="email"]')).toBeFocused();

			await page.keyboard.press('Tab'); // Submit button
			await expect(page.locator('button:has-text("Megerősítő email küldése")')).toBeFocused();

			// Fill email with keyboard
			await page.keyboard.press('Shift+Tab'); // Back to email input
			await page.keyboard.type('test@example.com');

			// Submit with Enter
			await page.keyboard.press('Enter');

			await expect(page.locator('text=Megerősítő email sikeresen elküldve!')).toBeVisible();
		});
	});
});
