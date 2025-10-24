import { TemplateEngine } from './engine';
import { builtInTemplates } from './built-in';
import { EmailTemplateType } from '../types';
import type { EmailTemplate, TemplateData } from './engine';

/**
 * Template registry for managing email templates
 */
export class TemplateRegistry {
	private engine: TemplateEngine;
	private customTemplates: Map<string, EmailTemplate> = new Map();
	private templateInheritance: Map<string, string> = new Map();

	constructor() {
		this.engine = new TemplateEngine();
		this.initializeBuiltInTemplates();
	}

	/**
	 * Initialize built-in templates.
	 */
	private initializeBuiltInTemplates(): void {
		Object.entries(builtInTemplates).forEach(([type, template]) => {
			this.engine.registerTemplate(type as EmailTemplateType, template);
		});

		this.log('info', 'Built-in templates initialized', {
			count: Object.keys(builtInTemplates).length,
			types: Object.keys(builtInTemplates)
		});
	}

	/**
	 * Register a custom template.
	 */
	registerCustomTemplate(name: string, template: EmailTemplate, parentTemplate?: string): void {
		try {
			// Validate template name
			this.validateTemplateName(name);

			// Handle template inheritance
			let finalTemplate = template;
			if (parentTemplate) {
				finalTemplate = this.inheritFromTemplate(template, parentTemplate);
				this.templateInheritance.set(name, parentTemplate);
			}

			// Validate the final template
			this.validateCustomTemplate(finalTemplate);

			// Store the custom template
			this.customTemplates.set(name, finalTemplate);

			this.log('info', 'Custom template registered', {
				name,
				parentTemplate,
				requiredData: finalTemplate.requiredData
			});
		} catch (error) {
			this.log('error', 'Failed to register custom template', {
				name,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			throw error;
		}
	}

	/**
	 * Render a template (built-in or custom).
	 */
	async renderTemplate(
		templateName: string,
		data: TemplateData
	): Promise<{ subject: string; html: string; text: string }> {
		try {
			// Check if it's a built-in template
			if (this.isBuiltInTemplate(templateName)) {
				return await this.engine.render(templateName as EmailTemplateType, data);
			}

			// Check if it's a custom template
			const customTemplate = this.customTemplates.get(templateName);
			if (!customTemplate) {
				throw new Error(`Template not found: ${templateName}`);
			}

			// Create a temporary template engine instance for custom template
			const tempEngine = new TemplateEngine();
			tempEngine.registerTemplate(templateName as EmailTemplateType, customTemplate);

			return await tempEngine.render(templateName as EmailTemplateType, data);
		} catch (error) {
			this.log('error', 'Template rendering failed', {
				templateName,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			throw error;
		}
	}

	/**
	 * Get template information.
	 */
	getTemplateInfo(templateName: string): {
		type: 'built-in' | 'custom';
		template: EmailTemplate;
		parentTemplate?: string;
	} | null {
		// Check built-in templates
		if (this.isBuiltInTemplate(templateName)) {
			const template = this.engine.getTemplate(templateName as EmailTemplateType);
			if (template) {
				return {
					type: 'built-in',
					template
				};
			}
		}

		// Check custom templates
		const customTemplate = this.customTemplates.get(templateName);
		if (customTemplate) {
			return {
				type: 'custom',
				template: customTemplate,
				parentTemplate: this.templateInheritance.get(templateName)
			};
		}

		return null;
	}

	/**
	 * List all available templates.
	 */
	listTemplates(): {
		builtIn: string[];
		custom: string[];
	} {
		return {
			builtIn: Object.values(EmailTemplateType),
			custom: Array.from(this.customTemplates.keys())
		};
	}

	/**
	 * Remove a custom template.
	 */
	removeCustomTemplate(name: string): boolean {
		const removed = this.customTemplates.delete(name);
		if (removed) {
			this.templateInheritance.delete(name);
			this.log('info', 'Custom template removed', { name });
		}
		return removed;
	}

	/**
	 * Validate template data for a specific template.
	 */
	validateTemplateData(templateName: string, data: TemplateData): boolean {
		const templateInfo = this.getTemplateInfo(templateName);
		if (!templateInfo) {
			throw new Error(`Template not found: ${templateName}`);
		}

		const template = templateInfo.template;

		// Check required data fields
		const missingFields = template.requiredData.filter(
			(field) => !(field in data) || data[field] === undefined || data[field] === null
		);

		if (missingFields.length > 0) {
			throw new Error(
				`Missing required template data for ${templateName}: ${missingFields.join(', ')}`
			);
		}

		return true;
	}

	/**
	 * Create a template preview with sample data.
	 */
	async createPreview(
		templateName: string,
		sampleData?: TemplateData
	): Promise<{
		subject: string;
		html: string;
		text: string;
	}> {
		const templateInfo = this.getTemplateInfo(templateName);
		if (!templateInfo) {
			throw new Error(`Template not found: ${templateName}`);
		}

		// Generate sample data if not provided
		const data = sampleData || this.generateSampleData(templateInfo.template);

		return await this.renderTemplate(templateName, data);
	}

	/**
	 * Check if a template name is a built-in template.
	 */
	private isBuiltInTemplate(templateName: string): boolean {
		return Object.values(EmailTemplateType).includes(templateName as EmailTemplateType);
	}

	/**
	 * Inherit properties from a parent template.
	 */
	private inheritFromTemplate(template: EmailTemplate, parentName: string): EmailTemplate {
		let parentTemplate: EmailTemplate | undefined;

		// Check if parent is built-in
		if (this.isBuiltInTemplate(parentName)) {
			parentTemplate = this.engine.getTemplate(parentName as EmailTemplateType);
		} else {
			parentTemplate = this.customTemplates.get(parentName);
		}

		if (!parentTemplate) {
			throw new Error(`Parent template not found: ${parentName}`);
		}

		// Merge templates (child overrides parent)
		return {
			subject: template.subject || parentTemplate.subject,
			htmlTemplate: template.htmlTemplate || parentTemplate.htmlTemplate,
			textTemplate: template.textTemplate || parentTemplate.textTemplate,
			requiredData: [
				...parentTemplate.requiredData,
				...template.requiredData.filter((field) => !parentTemplate!.requiredData.includes(field))
			],
			optionalData: [
				...(parentTemplate.optionalData || []),
				...(template.optionalData || []).filter(
					(field) => !(parentTemplate!.optionalData || []).includes(field)
				)
			]
		};
	}

	/**
	 * Validate custom template structure.
	 */
	private validateCustomTemplate(template: EmailTemplate): void {
		// Basic validation
		if (!template.subject?.trim()) {
			throw new Error('Template subject cannot be empty');
		}

		if (!template.htmlTemplate?.trim()) {
			throw new Error('Template HTML content cannot be empty');
		}

		if (!template.textTemplate?.trim()) {
			throw new Error('Template text content cannot be empty');
		}

		if (!Array.isArray(template.requiredData)) {
			throw new Error('Template requiredData must be an array');
		}

		// Check for circular references in template variables
		this.validateTemplateVariables(template);
	}

	/**
	 * Validate template variables for potential issues.
	 */
	private validateTemplateVariables(template: EmailTemplate): void {
		const variablePattern = /\{\{(\w+)\}\}/g;

		// Extract variables from all template parts
		const subjectVars = this.extractVariables(template.subject, variablePattern);
		const htmlVars = this.extractVariables(template.htmlTemplate, variablePattern);
		const textVars = this.extractVariables(template.textTemplate, variablePattern);

		const allVars = new Set([...subjectVars, ...htmlVars, ...textVars]);
		const requiredVars = new Set(template.requiredData);
		const optionalVars = new Set(template.optionalData || []);

		// Check for undefined variables
		const undefinedVars = Array.from(allVars).filter(
			(variable) => !requiredVars.has(variable) && !optionalVars.has(variable)
		);

		if (undefinedVars.length > 0) {
			this.log('warn', 'Template contains undefined variables', {
				variables: undefinedVars,
				suggestion: 'Add these to requiredData or optionalData'
			});
		}
	}

	/**
	 * Extract variables from template string.
	 */
	private extractVariables(template: string, pattern: RegExp): string[] {
		const variables: string[] = [];
		let match;

		while ((match = pattern.exec(template)) !== null) {
			variables.push(match[1]);
		}

		return variables;
	}

	/**
	 * Validate template name.
	 */
	private validateTemplateName(name: string): void {
		if (!name || typeof name !== 'string') {
			throw new Error('Template name must be a non-empty string');
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
			throw new Error('Template name can only contain letters, numbers, underscores, and hyphens');
		}

		if (this.isBuiltInTemplate(name)) {
			throw new Error(`Cannot override built-in template: ${name}`);
		}

		if (this.customTemplates.has(name)) {
			throw new Error(`Custom template already exists: ${name}`);
		}
	}

	/**
	 * Generate sample data for template preview.
	 */
	private generateSampleData(template: EmailTemplate): TemplateData {
		const sampleData: TemplateData = {};

		// Generate sample data for required fields
		template.requiredData.forEach((field) => {
			sampleData[field] = this.generateSampleValue(field);
		});

		// Generate sample data for optional fields
		(template.optionalData || []).forEach((field) => {
			sampleData[field] = this.generateSampleValue(field);
		});

		return sampleData;
	}

	/**
	 * Generate sample value based on field name.
	 */
	private generateSampleValue(fieldName: string): string {
		const sampleValues: Record<string, string> = {
			name: 'John Doe',
			email: 'john.doe@example.com',
			appName: 'MyApp',
			title: 'Sample Notification',
			message: 'This is a sample message for template preview.',
			resetLink: 'https://example.com/reset-password?token=sample-token',
			dashboardUrl: 'https://example.com/dashboard',
			unsubscribeUrl: 'https://example.com/unsubscribe',
			actionUrl: 'https://example.com/action',
			actionText: 'Take Action',
			timestamp: new Date().toLocaleString(),
			expirationTime: '24 hours',
			type: 'INFO',
			priority: 'normal',
			details: 'Additional details about this notification.'
		};

		return sampleValues[fieldName] || `Sample ${fieldName}`;
	}

	/**
	 * Logging utility.
	 */
	private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
		const timestamp = new Date().toISOString();
		const logData = data ? ` ${JSON.stringify(data)}` : '';
		console[level](`[${timestamp}] [TemplateRegistry] ${message}${logData}`);
	}
}
