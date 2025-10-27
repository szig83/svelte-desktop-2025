import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EmailManager } from '$lib/server/email/manager';
import { EmailTemplateType } from '$lib/server/email/types';

// Mock the EmailManager
vi.mock('$lib/server/email/manager', () => {
	return {
		EmailManager: vi.fn().mockImplementation(() => ({
			sendTemplatedEmail: vi.fn()
		}))
	};
});

describe('Email Verification Integration', () => {
	let mockEmailManager: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockEmailManager = {
			sendTemplatedEmail: vi.fn()
		};
		(EmailManager as any).mockImplementation(() => mockEmailManager);
	});

	// Test the email verification function logic that would be used in Better Auth
	interface TestUser {
		email: string;
		name?: string;
	}

	const createEmailVerificationFunction = () => {
		return async ({ user, url, token }: { user: TestUser; url: string; token: string }) => {
			const emailManager = new EmailManager();

			const result = await emailManager.sendTemplatedEmail({
				to: user.email,
				template: EmailTemplateType.EMAIL_VERIFICATION,
				data: {
					name: user.name || user.email.split('@')[0],
					email: user.email,
					verificationUrl: url,
					token: token,
					appName: 'Desktop Environment',
					expirationTime: '24 óra'
				}
			});

			if (!result.success) {
				throw new Error('Email küldése sikertelen');
			}
		};
	};

	describe('Email Verification Function Logic', () => {
		it('should call EmailManager with correct parameters', async () => {
			const sendVerificationEmail = createEmailVerificationFunction();

			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User'
			};

			mockEmailManager.sendTemplatedEmail.mockResolvedValue({ success: true });

			await sendVerificationEmail({
				user: mockUser,
				url: 'https://example.com/verify?token=abc123',
				token: 'abc123'
			});

			expect(EmailManager).toHaveBeenCalledTimes(1);
			expect(mockEmailManager.sendTemplatedEmail).toHaveBeenCalledWith({
				to: 'test@example.com',
				template: EmailTemplateType.EMAIL_VERIFICATION,
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

		it('should use email prefix as name when user has no name', async () => {
			const sendVerificationEmail = createEmailVerificationFunction();

			const mockUser = {
				id: '1',
				email: 'testuser@example.com',
				name: undefined
			};

			mockEmailManager.sendTemplatedEmail.mockResolvedValue({ success: true });

			await sendVerificationEmail({
				user: mockUser,
				url: 'https://example.com/verify',
				token: 'token123'
			});

			const callArgs = mockEmailManager.sendTemplatedEmail.mock.calls[0][0];
			expect(callArgs.data.name).toBe('testuser');
		});

		it('should throw error when email sending fails', async () => {
			const sendVerificationEmail = createEmailVerificationFunction();

			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User'
			};

			mockEmailManager.sendTemplatedEmail.mockResolvedValue({ success: false });

			await expect(
				sendVerificationEmail({
					user: mockUser,
					url: 'https://example.com/verify',
					token: 'token123'
				})
			).rejects.toThrow('Email küldése sikertelen');
		});
	});

	describe('Template Integration', () => {
		it('should use correct email template type', async () => {
			const sendVerificationEmail = createEmailVerificationFunction();

			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User'
			};

			mockEmailManager.sendTemplatedEmail.mockResolvedValue({ success: true });

			await sendVerificationEmail({
				user: mockUser,
				url: 'https://example.com/verify',
				token: 'token123'
			});

			const callArgs = mockEmailManager.sendTemplatedEmail.mock.calls[0][0];
			expect(callArgs.template).toBe(EmailTemplateType.EMAIL_VERIFICATION);
		});

		it('should include Hungarian localization', async () => {
			const sendVerificationEmail = createEmailVerificationFunction();

			const mockUser = {
				id: '1',
				email: 'test@example.com',
				name: 'Test User'
			};

			mockEmailManager.sendTemplatedEmail.mockResolvedValue({ success: true });

			await sendVerificationEmail({
				user: mockUser,
				url: 'https://example.com/verify',
				token: 'token123'
			});

			const callArgs = mockEmailManager.sendTemplatedEmail.mock.calls[0][0];
			expect(callArgs.data.expirationTime).toBe('24 óra');
			expect(callArgs.data.appName).toBe('Desktop Environment');
		});
	});
});
