import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine } from '../engine';
import { builtInTemplates } from '../built-in';
import { EmailTemplateType } from '../../types';

describe('Email Verification Template', () => {
	let engine: TemplateEngine;

	beforeEach(() => {
		engine = new TemplateEngine();
		// Register the email verification template
		engine.registerTemplate(
			EmailTemplateType.EMAIL_VERIFICATION,
			builtInTemplates[EmailTemplateType.EMAIL_VERIFICATION]
		);
	});

	describe('Template Structure', () => {
		it('should have correct required data fields', () => {
			const template = engine.getTemplate(EmailTemplateType.EMAIL_VERIFICATION);

			expect(template).toBeDefined();
			expect(template!.requiredData).toEqual(['name', 'email', 'verificationUrl', 'appName']);
			expect(template!.optionalData).toEqual(['expirationTime']);
		});

		it('should have Hungarian subject line', () => {
			const template = engine.getTemplate(EmailTemplateType.EMAIL_VERIFICATION);

			expect(template!.subject).toBe('Erősítsd meg az email címed - {{appName}}');
		});

		it('should contain verification URL placeholder in both HTML and text', () => {
			const template = engine.getTemplate(EmailTemplateType.EMAIL_VERIFICATION);

			expect(template!.htmlTemplate).toContain('{{verificationUrl}}');
			expect(template!.textTemplate).toContain('{{verificationUrl}}');
		});
	});

	describe('Template Rendering', () => {
		const validData = {
			name: 'Teszt Felhasználó',
			email: 'teszt@example.com',
			verificationUrl: 'https://example.com/verify?token=abc123',
			appName: 'Desktop Environment',
			expirationTime: '24 óra'
		};

		it('should render complete email with all data', async () => {
			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, validData);

			// Check subject
			expect(result.subject).toBe('Erősítsd meg az email címed - Desktop Environment');

			// Check HTML content
			expect(result.html).toContain('Szia Teszt Felhasználó!');
			expect(result.html).toContain('Desktop Environment');
			expect(result.html).toContain('https://example.com/verify?token=abc123');
			expect(result.html).toContain('teszt@example.com');
			expect(result.html).toContain('24 óra múlva lejár');

			// Check text content
			expect(result.text).toContain('Szia Teszt Felhasználó!');
			expect(result.text).toContain('Desktop Environment');
			expect(result.text).toContain('https://example.com/verify?token=abc123');
			expect(result.text).toContain('teszt@example.com');
		});

		it('should render without optional expiration time', async () => {
			const dataWithoutExpiration = {
				name: 'Teszt Felhasználó',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify?token=abc123',
				appName: 'Desktop Environment'
			};

			const result = await engine.render(
				EmailTemplateType.EMAIL_VERIFICATION,
				dataWithoutExpiration
			);

			expect(result.subject).toBe('Erősítsd meg az email címed - Desktop Environment');
			expect(result.html).toContain('Teszt Felhasználó');
			expect(result.html).toContain('{{expirationTime}}'); // Should keep placeholder if not provided
		});

		it('should fail with missing required data', async () => {
			const incompleteData = {
				name: 'Teszt Felhasználó',
				email: 'teszt@example.com'
				// Missing verificationUrl and appName
			};

			await expect(
				engine.render(EmailTemplateType.EMAIL_VERIFICATION, incompleteData)
			).rejects.toThrow('Missing required template data: verificationUrl, appName');
		});

		it('should validate email format', async () => {
			const invalidEmailData = {
				...validData,
				email: 'invalid-email-format'
			};

			await expect(
				engine.render(EmailTemplateType.EMAIL_VERIFICATION, invalidEmailData)
			).rejects.toThrow('Invalid email format');
		});

		it('should handle invalid verification URL format gracefully', async () => {
			const invalidUrlData = {
				...validData,
				verificationUrl: 'not-a-valid-url'
			};

			// The engine should render even with invalid URL format
			// URL validation is typically done at the application level, not template level
			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, invalidUrlData);
			expect(result.html).toContain('not-a-valid-url');
			expect(result.text).toContain('not-a-valid-url');
		});
	});

	describe('Content Security', () => {
		it('should sanitize HTML content', async () => {
			const maliciousData = {
				name: '<script>alert("xss")</script>Teszt',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify?token=abc123',
				appName: 'Desktop Environment'
			};

			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, maliciousData);

			expect(result.html).not.toContain('<script>');
			expect(result.html).toContain('Teszt'); // Should still contain the safe part
		});

		it('should handle special characters in name', async () => {
			const specialCharData = {
				name: 'Teszt Árvíztűrő Tükörfúrógép',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify?token=abc123',
				appName: 'Desktop Environment'
			};

			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, specialCharData);

			expect(result.html).toContain('Teszt Árvíztűrő Tükörfúrógép');
			expect(result.text).toContain('Teszt Árvíztűrő Tükörfúrógép');
		});
	});

	describe('Template Content Validation', () => {
		it('should contain proper Hungarian text', async () => {
			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, {
				name: 'Teszt',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify',
				appName: 'Test App'
			});

			// Check for key Hungarian phrases
			expect(result.html).toContain('Email cím megerősítése');
			expect(result.html).toContain('Köszönjük, hogy regisztráltál');
			expect(result.html).toContain('Fontos tudnivalók');
			expect(result.html).toContain('Üdvözlettel');

			expect(result.text).toContain('Email cím megerősítése');
			expect(result.text).toContain('Köszönjük, hogy regisztráltál');
		});

		it('should have proper CTA button styling in HTML', async () => {
			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, {
				name: 'Teszt',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify',
				appName: 'Test App'
			});

			expect(result.html).toContain('class="cta-button"');
			expect(result.html).toContain('Email cím megerősítése</a>');
			expect(result.html).toContain('background-color: #16a34a'); // Green button
		});

		it('should include security notes', async () => {
			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, {
				name: 'Teszt',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify',
				appName: 'Test App'
			});

			expect(result.html).toContain('security-note');
			expect(result.html).toContain('Ha nem te regisztráltál');
			expect(result.html).toContain('Soha ne oszd meg');

			expect(result.text).toContain('Ha nem te regisztráltál');
			expect(result.text).toContain('Soha ne oszd meg');
		});
	});

	describe('Edge Cases', () => {
		it('should handle very long names', async () => {
			const longNameData = {
				name: 'A'.repeat(100),
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify',
				appName: 'Test App'
			};

			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, longNameData);
			expect(result.html).toContain('A'.repeat(100));
		});

		it('should handle complex verification URLs', async () => {
			const complexUrlData = {
				name: 'Teszt',
				email: 'teszt@example.com',
				verificationUrl:
					'https://example.com/verify?token=abc123&redirect=/dashboard&utm_source=email',
				appName: 'Test App'
			};

			const result = await engine.render(EmailTemplateType.EMAIL_VERIFICATION, complexUrlData);
			expect(result.html).toContain('token=abc123&redirect=/dashboard&utm_source=email');
		});

		it('should handle empty optional expiration time', async () => {
			const dataWithEmptyExpiration = {
				name: 'Teszt',
				email: 'teszt@example.com',
				verificationUrl: 'https://example.com/verify',
				appName: 'Test App',
				expirationTime: ''
			};

			const result = await engine.render(
				EmailTemplateType.EMAIL_VERIFICATION,
				dataWithEmptyExpiration
			);
			expect(result.html).toContain(' múlva lejár'); // Should still render the text around it
		});
	});
});
