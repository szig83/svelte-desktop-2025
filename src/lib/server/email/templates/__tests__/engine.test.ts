import { describe, it, expect, beforeEach } from 'vitest';
import { TemplateEngine } from '../engine';
import { EmailTemplateType } from '../../types';
import type { EmailTemplate } from '../engine';

describe('TemplateEngine', () => {
	let engine: TemplateEngine;

	beforeEach(() => {
		engine = new TemplateEngine();
	});

	describe('Template Registration', () => {
		it('should register a valid template', () => {
			const template: EmailTemplate = {
				subject: 'Test Subject - {{appName}}',
				htmlTemplate: '<h1>Hello {{name}}</h1>',
				textTemplate: 'Hello {{name}}',
				requiredData: ['name', 'appName'],
				optionalData: ['email']
			};

			expect(() => {
				engine.registerTemplate(EmailTemplateType.WELCOME, template);
			}).not.toThrow();

			expect(engine.hasTemplate(EmailTemplateType.WELCOME)).toBe(true);
		});

		it('should throw error for invalid template structure', () => {
			const invalidTemplate = {
				subject: '',
				htmlTemplate: '<h1>Hello</h1>',
				textTemplate: 'Hello',
				requiredData: ['name']
			} as EmailTemplate;

			expect(() => {
				engine.registerTemplate(EmailTemplateType.WELCOME, invalidTemplate);
			}).toThrow('Invalid template structure');
		});

		it('should retrieve registered template', () => {
			const template: EmailTemplate = {
				subject: 'Test Subject',
				htmlTemplate: '<h1>Test</h1>',
				textTemplate: 'Test',
				requiredData: ['name']
			};

			engine.registerTemplate(EmailTemplateType.WELCOME, template);
			const retrieved = engine.getTemplate(EmailTemplateType.WELCOME);

			expect(retrieved).toEqual(template);
		});
	});

	describe('Template Rendering', () => {
		beforeEach(() => {
			const template: EmailTemplate = {
				subject: 'Welcome {{name}} to {{appName}}!',
				htmlTemplate: `
					<html>
						<body>
							<h1>Welcome {{name}}!</h1>
							<p>Thank you for joining {{appName}}.</p>
							<p>Your email: {{email}}</p>
						</body>
					</html>
				`,
				textTemplate: `
					Welcome {{name}}!
					Thank you for joining {{appName}}.
					Your email: {{email}}
				`,
				requiredData: ['name', 'appName', 'email']
			};

			engine.registerTemplate(EmailTemplateType.WELCOME, template);
		});

		it('should render template with valid data', async () => {
			const data = {
				name: 'John Doe',
				appName: 'Desktop Environment',
				email: 'john@example.com'
			};

			const result = await engine.render(EmailTemplateType.WELCOME, data);

			expect(result.subject).toBe('Welcome John Doe to Desktop Environment!');
			expect(result.html).toContain('Welcome John Doe!');
			expect(result.html).toContain('Desktop Environment');
			expect(result.html).toContain('john@example.com');
			expect(result.text).toContain('Welcome John Doe!');
			expect(result.text).toContain('Desktop Environment');
		});

		it('should throw error for missing required data', async () => {
			const incompleteData = {
				name: 'John Doe'
				// Missing appName and email
			};

			await expect(engine.render(EmailTemplateType.WELCOME, incompleteData)).rejects.toThrow(
				'Missing required template data'
			);
		});

		it('should throw error for non-existent template', async () => {
			await expect(engine.render(EmailTemplateType.PASSWORD_RESET, {})).rejects.toThrow(
				'Template not found'
			);
		});

		it('should handle undefined values gracefully', async () => {
			const dataWithUndefined = {
				name: 'John Doe',
				appName: 'Desktop Environment',
				email: 'john@example.com',
				optionalField: undefined
			};

			const result = await engine.render(EmailTemplateType.WELCOME, dataWithUndefined);
			expect(result.subject).toBe('Welcome John Doe to Desktop Environment!');
		});
	});

	describe('Data Validation', () => {
		beforeEach(() => {
			const template: EmailTemplate = {
				subject: 'Test {{email}}',
				htmlTemplate: '<p>{{email}}</p>',
				textTemplate: '{{email}}',
				requiredData: ['email']
			};

			engine.registerTemplate(EmailTemplateType.NOTIFICATION, template);
		});

		it('should validate email format', async () => {
			const invalidEmailData = {
				email: 'invalid-email'
			};

			await expect(engine.render(EmailTemplateType.NOTIFICATION, invalidEmailData)).rejects.toThrow(
				'Invalid email format'
			);
		});

		it('should accept valid email format', async () => {
			const validEmailData = {
				email: 'test@example.com'
			};

			const result = await engine.render(EmailTemplateType.NOTIFICATION, validEmailData);
			expect(result.subject).toBe('Test test@example.com');
		});
	});

	describe('Content Sanitization', () => {
		beforeEach(() => {
			const template: EmailTemplate = {
				subject: 'Test\n\nSubject   with   spaces',
				htmlTemplate: '<script>alert("xss")</script><p onclick="alert()">{{content}}</p>',
				textTemplate: 'Line 1\n\n\n\nLine 2\r\nLine 3',
				requiredData: ['content']
			};

			engine.registerTemplate(EmailTemplateType.NOTIFICATION, template);
		});

		it('should sanitize subject line', async () => {
			const data = { content: 'test' };
			const result = await engine.render(EmailTemplateType.NOTIFICATION, data);

			expect(result.subject).toBe('Test Subject with spaces');
			expect(result.subject).not.toContain('\n');
		});

		it('should remove script tags from HTML', async () => {
			const data = { content: 'test content' };
			const result = await engine.render(EmailTemplateType.NOTIFICATION, data);

			expect(result.html).not.toContain('<script>');
			expect(result.html).not.toContain('onclick=');
			expect(result.html).toContain('test content');
		});

		it('should normalize text content', async () => {
			const data = { content: 'test' };
			const result = await engine.render(EmailTemplateType.NOTIFICATION, data);

			expect(result.text).not.toContain('\r');
			expect(result.text).not.toMatch(/\n{3,}/);
		});
	});

	describe('Value Formatting', () => {
		beforeEach(() => {
			const template: EmailTemplate = {
				subject: '{{title}}',
				htmlTemplate: '<p>{{value}}</p>',
				textTemplate: '{{value}}',
				requiredData: ['title', 'value']
			};

			engine.registerTemplate(EmailTemplateType.NOTIFICATION, template);
		});

		it('should format different value types', async () => {
			const data = {
				title: 'Test',
				value: 42
			};

			const result = await engine.render(EmailTemplateType.NOTIFICATION, data);
			expect(result.html).toContain('42');
			expect(result.text).toContain('42');
		});

		it('should format boolean values', async () => {
			const data = {
				title: 'Test',
				value: true
			};

			const result = await engine.render(EmailTemplateType.NOTIFICATION, data);
			expect(result.html).toContain('true');
		});

		it('should format date values', async () => {
			const testDate = new Date('2024-01-01');
			const data = {
				title: 'Test',
				value: testDate
			};

			const result = await engine.render(EmailTemplateType.NOTIFICATION, data);
			expect(result.html).toContain(testDate.toLocaleDateString());
		});
	});
});
