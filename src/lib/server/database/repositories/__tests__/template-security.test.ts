import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateSecurityValidator, SecurityValidationError } from '../template-security-validator';
import { TemplateAuditLogger, AuditEventType } from '../template-audit-logger';
import { TemplateRateLimiter } from '../template-rate-limiter';
import { TemplateSecurityService } from '../template-security-service';
import type { CreateTemplateData } from '../../types/email-templates';

describe('Template Security Features', () => {
	describe('TemplateSecurityValidator', () => {
		let validator: TemplateSecurityValidator;

		beforeEach(() => {
			validator = new TemplateSecurityValidator();
		});

		it('should validate safe template content', () => {
			const templateData: CreateTemplateData = {
				type: 'welcome' as any,
				name: 'Welcome Template',
				subjectTemplate: 'Welcome {{name}}!',
				htmlTemplate: '<p>Hello <strong>{{name}}</strong>!</p>',
				textTemplate: 'Hello {{name}}!',
				requiredData: ['name']
			};

			const result = validator.validateCreateTemplate(templateData);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should detect malicious script content', () => {
			const templateData: CreateTemplateData = {
				type: 'malicious' as any,
				name: 'Malicious Template',
				subjectTemplate: 'Test',
				htmlTemplate: '<script>alert("xss")</script><p>Hello {{name}}!</p>',
				textTemplate: 'Hello {{name}}!',
				requiredData: ['name']
			};

			const result = validator.validateCreateTemplate(templateData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain(SecurityValidationError.MALICIOUS_SCRIPT_DETECTED);
		});

		it('should detect oversized templates', () => {
			const largeContent = 'x'.repeat(1024 * 1024 + 1); // 1MB + 1 byte
			const templateData: CreateTemplateData = {
				type: 'large' as any,
				name: 'Large Template',
				subjectTemplate: 'Test',
				htmlTemplate: largeContent,
				textTemplate: 'Test',
				requiredData: []
			};

			const result = validator.validateCreateTemplate(templateData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain(SecurityValidationError.TEMPLATE_SIZE_EXCEEDED);
		});

		it('should sanitize HTML content', () => {
			const maliciousHtml =
				'<p>Safe content</p><script>alert("xss")</script><iframe src="evil.com"></iframe>';
			const sanitized = validator.sanitizeHtmlContent(maliciousHtml);

			expect(sanitized).toContain('<p>Safe content</p>');
			expect(sanitized).not.toContain('<script>');
			expect(sanitized).not.toContain('<iframe>');
		});
	});

	describe('TemplateRateLimiter', () => {
		let rateLimiter: TemplateRateLimiter;

		beforeEach(() => {
			rateLimiter = new TemplateRateLimiter();
		});

		it('should allow requests within rate limits', () => {
			const result = rateLimiter.checkRateLimit('template_access', 'user123');
			expect(result.allowed).toBe(true);
			expect(result.remaining).toBeGreaterThan(0);
		});

		it('should block requests exceeding rate limits', () => {
			const operation = 'template_create';
			const identifier = 'user123';

			// Exhaust the rate limit (default is 10 for template_create)
			for (let i = 0; i < 11; i++) {
				rateLimiter.checkRateLimit(operation, identifier);
			}

			const result = rateLimiter.checkRateLimit(operation, identifier);
			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it('should reset rate limits after time window', () => {
			const operation = 'template_create';
			const identifier = 'user123';

			// Exhaust the rate limit
			for (let i = 0; i < 11; i++) {
				rateLimiter.checkRateLimit(operation, identifier);
			}

			// Reset the rate limit manually (simulating time passage)
			rateLimiter.resetRateLimit(operation, identifier);

			const result = rateLimiter.checkRateLimit(operation, identifier);
			expect(result.allowed).toBe(true);
		});
	});

	describe('TemplateAuditLogger', () => {
		let auditLogger: TemplateAuditLogger;

		beforeEach(() => {
			auditLogger = new TemplateAuditLogger({
				enabled: true,
				logLevel: 'info',
				maskSensitiveData: true,
				retentionDays: 30,
				maxLogSize: 1024 * 1024,
				enableFileLogging: false,
				enableDatabaseLogging: false
			});
		});

		it('should log template creation events', async () => {
			const templateData: CreateTemplateData = {
				type: 'test' as any,
				name: 'Test Template',
				subjectTemplate: 'Test',
				htmlTemplate: '<p>Test</p>',
				textTemplate: 'Test',
				requiredData: []
			};

			await auditLogger.logTemplateCreated(templateData, {
				userId: 'user123',
				ipAddress: '192.168.1.1'
			});

			const logs = await auditLogger.getAuditLogsByType(AuditEventType.TEMPLATE_CREATED, 10);
			expect(logs).toHaveLength(1);
			expect(logs[0].eventType).toBe(AuditEventType.TEMPLATE_CREATED);
			expect(logs[0].userId).toBe('user123');
		});

		it('should log security violations', async () => {
			await auditLogger.logSecurityViolation(
				'test_violation',
				{ reason: 'Testing security logging' },
				{ userId: 'user123' }
			);

			const violations = await auditLogger.getSecurityViolationLogs(10);
			expect(violations).toHaveLength(1);
			expect(violations[0].eventType).toBe(AuditEventType.SECURITY_VIOLATION);
		});

		it('should mask sensitive data when configured', async () => {
			const templateData: CreateTemplateData = {
				type: 'test' as any,
				name: 'Test Template',
				subjectTemplate: 'Your email is {{email}}',
				htmlTemplate: '<p>Your password reset token: {{token}}</p>',
				textTemplate: 'Token: {{token}}',
				requiredData: ['email', 'token']
			};

			await auditLogger.logTemplateCreated(templateData, {
				userId: 'user123'
			});

			const logs = await auditLogger.getAuditLogsByType(AuditEventType.TEMPLATE_CREATED, 1);
			expect(logs[0].sensitiveDataMasked).toBe(true);
		});
	});

	describe('TemplateSecurityService', () => {
		let securityService: TemplateSecurityService;

		beforeEach(() => {
			securityService = new TemplateSecurityService();
		});

		it('should perform comprehensive security checks for template creation', async () => {
			const templateData: CreateTemplateData = {
				type: 'test' as any,
				name: 'Test Template',
				subjectTemplate: 'Test {{name}}',
				htmlTemplate: '<p>Hello {{name}}!</p>',
				textTemplate: 'Hello {{name}}!',
				requiredData: ['name']
			};

			const result = await securityService.checkTemplateCreation(templateData, {
				userId: 'user123',
				ipAddress: '192.168.1.1'
			});

			expect(result.allowed).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should block malicious template creation', async () => {
			const maliciousTemplate: CreateTemplateData = {
				type: 'malicious' as any,
				name: 'Malicious Template',
				subjectTemplate: 'Test',
				htmlTemplate: '<script>alert("xss")</script>',
				textTemplate: 'Test',
				requiredData: []
			};

			const result = await securityService.checkTemplateCreation(maliciousTemplate, {
				userId: 'user123'
			});

			expect(result.allowed).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should sanitize template content', () => {
			const templateData: CreateTemplateData = {
				type: 'test' as any,
				name: 'Test Template',
				subjectTemplate: 'Test <script>alert("xss")</script>',
				htmlTemplate: '<p>Safe</p><script>alert("xss")</script>',
				textTemplate: 'Safe <b>text</b>',
				requiredData: []
			};

			const { sanitized, warnings } = securityService.sanitizeTemplateContent(templateData);

			expect(sanitized.subjectTemplate).not.toContain('<script>');
			expect(sanitized.htmlTemplate).toContain('<p>Safe</p>');
			expect(sanitized.htmlTemplate).not.toContain('<script>');
			expect(sanitized.textTemplate).not.toContain('<b>');
			expect(warnings.length).toBeGreaterThan(0);
		});

		it('should provide security metrics', async () => {
			const metrics = await securityService.getSecurityMetrics();

			expect(metrics).toHaveProperty('rateLimiting');
			expect(metrics).toHaveProperty('recentViolations');
			expect(metrics).toHaveProperty('topViolationTypes');
			expect(metrics).toHaveProperty('activeUsers');
		});
	});
});
