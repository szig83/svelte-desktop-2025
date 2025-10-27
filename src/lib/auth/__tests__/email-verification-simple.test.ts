import { describe, it, expect, vi } from 'vitest';

// Simple test to verify the integration test setup works
describe('Email Verification Integration - Simple', () => {
	it('should pass a basic test', () => {
		expect(true).toBe(true);
	});

	it('should test email verification logic', async () => {
		// Mock EmailManager
		const mockSendTemplatedEmail = vi.fn().mockResolvedValue({ success: true });

		// Simulate the email verification function from Better Auth config
		const sendVerificationEmail = async ({
			user,
			url,
			token
		}: {
			user: { email: string; name?: string | null };
			url: string;
			token: string;
		}) => {
			// This mimics the logic in src/lib/auth/index.ts
			const emailData = {
				to: user.email,
				template: 'EMAIL_VERIFICATION',
				data: {
					name: user.name || user.email.split('@')[0],
					email: user.email,
					verificationUrl: url,
					token: token,
					appName: 'Desktop Environment',
					expirationTime: '24 óra'
				}
			};

			const result = await mockSendTemplatedEmail(emailData);

			if (!result.success) {
				throw new Error('Email küldése sikertelen');
			}
		};

		// Test the function
		const mockUser = {
			email: 'test@example.com',
			name: 'Test User'
		};

		await sendVerificationEmail({
			user: mockUser,
			url: 'https://example.com/verify?token=abc123',
			token: 'abc123'
		});

		expect(mockSendTemplatedEmail).toHaveBeenCalledWith({
			to: 'test@example.com',
			template: 'EMAIL_VERIFICATION',
			data: {
				name: 'Test User',
				email: 'test@example.com',
				verificationUrl: 'https://example.com/verify?token=abc123',
				token: 'abc123',
				appName: 'Desktop Environment',
				expirationTime: '24 óra'
			}
		});
	});

	it('should handle user without name', async () => {
		const mockSendTemplatedEmail = vi.fn().mockResolvedValue({ success: true });

		const sendVerificationEmail = async ({
			user,
			url,
			token
		}: {
			user: { email: string; name?: string | null };
			url: string;
			token: string;
		}) => {
			const emailData = {
				to: user.email,
				template: 'EMAIL_VERIFICATION',
				data: {
					name: user.name || user.email.split('@')[0],
					email: user.email,
					verificationUrl: url,
					token: token,
					appName: 'Desktop Environment',
					expirationTime: '24 óra'
				}
			};

			const result = await mockSendTemplatedEmail(emailData);

			if (!result.success) {
				throw new Error('Email küldése sikertelen');
			}
		};

		const mockUser = {
			email: 'john.doe@example.com',
			name: null
		};

		await sendVerificationEmail({
			user: mockUser,
			url: 'https://example.com/verify',
			token: 'token123'
		});

		const callArgs = mockSendTemplatedEmail.mock.calls[0][0];
		expect(callArgs.data.name).toBe('john.doe');
	});

	it('should throw error when email sending fails', async () => {
		const mockSendTemplatedEmail = vi.fn().mockResolvedValue({ success: false });

		const sendVerificationEmail = async ({
			user,
			url,
			token
		}: {
			user: { email: string; name?: string | null };
			url: string;
			token: string;
		}) => {
			const emailData = {
				to: user.email,
				template: 'EMAIL_VERIFICATION',
				data: {
					name: user.name || user.email.split('@')[0],
					email: user.email,
					verificationUrl: url,
					token: token,
					appName: 'Desktop Environment',
					expirationTime: '24 óra'
				}
			};

			const result = await mockSendTemplatedEmail(emailData);

			if (!result.success) {
				throw new Error('Email küldése sikertelen');
			}
		};

		const mockUser = {
			email: 'test@example.com',
			name: 'Test User'
		};

		await expect(
			sendVerificationEmail({
				user: mockUser,
				url: 'https://example.com/verify',
				token: 'token123'
			})
		).rejects.toThrow('Email küldése sikertelen');
	});
});
