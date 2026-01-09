import { TemplateEngine } from './engine';
import { builtInTemplates } from './built-in';
import { EmailTemplateType } from '../types';
import type { EmailTemplate, TemplateData } from './engine';
import type {
	IDatabaseTemplateRepository,
	DatabaseEmailTemplate
} from '../../database/types/email-templates';
import { DatabaseTemplateRepository } from '../../database/repositories/email-template-repository';

/**
 * Template registry for managing email templates with database integration
 */
export class TemplateRegistry {
	private engine: TemplateEngine;
	private customTemplates: Map<string, EmailTemplate> = new Map();
	private templateInheritance: Map<string, string> = new Map();
	private databaseRepository: IDatabaseTemplateRepository;
	private fallbackToBuiltIn: boolean;

	constructor(databaseRepository?: IDatabaseTemplateRepository, fallbackToBuiltIn: boolean = true) {
		this.engine = new TemplateEngine();
		this.fallbackToBuiltIn = fallbackToBuiltIn;

		// Initialize database repository with default config if not provided
		this.databaseRepository =
			databaseRepository ||
			new DatabaseTemplateRepository({
				enableCache: true,
				cacheConfig: {
					defaultTtl: 3600, // 1 hour
					templateByTypeTtl: 3600, // 1 hour
					allActiveTemplatesTtl: 1800, // 30 minutes
					templateByIdTtl: 7200 // 2 hours
				},
				retryAttempts: 3,
				retryDelay: 1000
			});

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
	 * @param name
	 * @param template
	 * @param parentTemplate
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
	 * Render a template (database, built-in, or custom) with audit logging.
	 * @param templateName
	 * @param data
	 * @param context - Additional context for audit logging.
	 */
	async renderTemplate(
		templateName: string,
		data: TemplateData,
		context?: {
			userId?: string;
			userAgent?: string;
			ipAddress?: string;
			sessionId?: string;
			requestId?: string;
		}
	): Promise<{ subject: string; html: string; text: string }> {
		const startTime = Date.now();

		try {
			// First, try to get template from database
			const databaseTemplate = await this.getDatabaseTemplate(templateName);
			if (databaseTemplate) {
				const result = await this.renderDatabaseTemplate(databaseTemplate, data);

				// Log template rendering via database repository's audit logger
				const renderTime = Date.now() - startTime;
				if (this.databaseRepository instanceof DatabaseTemplateRepository) {
					await (this.databaseRepository as any).auditLogger?.logTemplateRendered(
						templateName as EmailTemplateType,
						data,
						{ ...context, renderTime }
					);
				}

				return result;
			}

			// Fallback to built-in templates if enabled
			if (this.fallbackToBuiltIn && this.isBuiltInTemplate(templateName)) {
				this.log('warn', 'Using built-in template fallback', { templateName });
				const result = await this.engine.render(templateName as EmailTemplateType, data);

				// Log fallback usage
				const renderTime = Date.now() - startTime;
				if (this.databaseRepository instanceof DatabaseTemplateRepository) {
					await (this.databaseRepository as any).auditLogger?.logTemplateRendered(
						templateName as EmailTemplateType,
						data,
						{ ...context, renderTime, fallback: true }
					);
				}

				return result;
			}

			// Check if it's a custom template
			const customTemplate = this.customTemplates.get(templateName);
			if (customTemplate) {
				return await this.renderCustomTemplate(templateName, customTemplate, data);
			}

			throw new Error(`Template not found: ${templateName}`);
		} catch (error) {
			this.log('error', 'Template rendering failed', {
				templateName,
				error: error instanceof Error ? error.message : 'Unknown error'
			});

			// Log rendering failure
			if (this.databaseRepository instanceof DatabaseTemplateRepository) {
				await (this.databaseRepository as any).auditLogger?.logSecurityViolation(
					'template_rendering_failed',
					{
						templateName,
						error: error instanceof Error ? error.message : 'Unknown error',
						renderTime: Date.now() - startTime
					},
					context
				);
			}

			throw error;
		}
	}

	/**
	 * Get template from database with retry logic.
	 * @param templateName
	 */
	private async getDatabaseTemplate(templateName: string): Promise<DatabaseEmailTemplate | null> {
		try {
			// Try to get by type if it's a valid EmailTemplateType
			if (this.isBuiltInTemplate(templateName)) {
				return await this.databaseRepository.getTemplateByType(templateName as EmailTemplateType);
			}

			// For custom templates, we would need to implement a different lookup strategy
			// For now, return null to fall back to other methods
			return null;
		} catch (error) {
			this.log('warn', 'Database template lookup failed', {
				templateName,
				error: error instanceof Error ? error.message : 'Unknown error'
			});

			// Return null to allow fallback mechanisms
			return null;
		}
	}

	/**
	 * Render a database template.
	 * @param databaseTemplate
	 * @param data
	 */
	private async renderDatabaseTemplate(
		databaseTemplate: DatabaseEmailTemplate,
		data: TemplateData
	): Promise<{ subject: string; html: string; text: string }> {
		// Convert database template to engine template format
		const engineTemplate: EmailTemplate = {
			subject: databaseTemplate.subjectTemplate,
			htmlTemplate: databaseTemplate.htmlTemplate,
			textTemplate: databaseTemplate.textTemplate,
			requiredData: databaseTemplate.requiredData,
			optionalData: databaseTemplate.optionalData || []
		};

		// Validate template data
		this.validateTemplateDataForEngineTemplate(engineTemplate, data);

		// Create a temporary engine instance for rendering
		const tempEngine = new TemplateEngine();
		tempEngine.registerTemplate(databaseTemplate.type as EmailTemplateType, engineTemplate);

		return await tempEngine.render(databaseTemplate.type as EmailTemplateType, data);
	}

	/**
	 * Render a custom template.
	 * @param templateName
	 * @param customTemplate
	 * @param data
	 */
	private async renderCustomTemplate(
		templateName: string,
		customTemplate: EmailTemplate,
		data: TemplateData
	): Promise<{ subject: string; html: string; text: string }> {
		// Create a temporary template engine instance for custom template
		const tempEngine = new TemplateEngine();
		tempEngine.registerTemplate(templateName as EmailTemplateType, customTemplate);

		return await tempEngine.render(templateName as EmailTemplateType, data);
	}

	/**
	 * Validate template data against engine template requirements.
	 * @param template
	 * @param data
	 */
	private validateTemplateDataForEngineTemplate(
		template: EmailTemplate,
		data: TemplateData
	): boolean {
		// Check required data fields
		const missingFields = template.requiredData.filter(
			(field) => !(field in data) || data[field] === undefined || data[field] === null
		);

		if (missingFields.length > 0) {
			throw new Error(`Missing required template data: ${missingFields.join(', ')}`);
		}

		return true;
	}

	/**
	 * Get template information (enhanced with database support).
	 * @param templateName
	 */
	async getTemplateInfo(templateName: string): Promise<{
		type: 'database' | 'built-in' | 'custom';
		template: EmailTemplate | DatabaseEmailTemplate;
		parentTemplate?: string;
	} | null> {
		// Check database templates first
		const databaseTemplate = await this.getDatabaseTemplate(templateName);
		if (databaseTemplate) {
			return {
				type: 'database',
				template: databaseTemplate
			};
		}

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
	 * List all available templates (enhanced with database support).
	 */
	async listTemplates(): Promise<{
		database: string[];
		builtIn: string[];
		custom: string[];
	}> {
		let databaseTemplates: string[] = [];

		try {
			const dbTemplates = await this.databaseRepository.getAllActiveTemplates();
			databaseTemplates = dbTemplates.map((t) => t.type);
		} catch (error) {
			this.log('warn', 'Failed to list database templates', {
				error: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		return {
			database: databaseTemplates,
			builtIn: Object.values(EmailTemplateType),
			custom: Array.from(this.customTemplates.keys())
		};
	}

	/**
	 * Remove a custom template.
	 * @param name
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
	 * Validate template data for a specific template (enhanced with database support).
	 * @param templateName
	 * @param data
	 */
	async validateTemplateData(templateName: string, data: TemplateData): Promise<boolean> {
		const templateInfo = await this.getTemplateInfo(templateName);
		if (!templateInfo) {
			throw new Error(`Template not found: ${templateName}`);
		}

		let requiredData: string[];

		// Handle different template types
		if (templateInfo.type === 'database') {
			const dbTemplate = templateInfo.template as DatabaseEmailTemplate;
			requiredData = dbTemplate.requiredData;
		} else {
			const engineTemplate = templateInfo.template as EmailTemplate;
			requiredData = engineTemplate.requiredData;
		}

		// Check required data fields
		const missingFields = requiredData.filter(
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
	 * Create a template preview with sample data (enhanced with database support).
	 * @param templateName
	 * @param sampleData
	 */
	async createPreview(
		templateName: string,
		sampleData?: TemplateData
	): Promise<{
		subject: string;
		html: string;
		text: string;
	}> {
		const templateInfo = await this.getTemplateInfo(templateName);
		if (!templateInfo) {
			throw new Error(`Template not found: ${templateName}`);
		}

		// Generate sample data if not provided
		const data = sampleData || this.generateSampleDataForTemplate(templateInfo);

		return await this.renderTemplate(templateName, data);
	}

	/**
	 * Check if a template name is a built-in template.
	 * @param templateName
	 */
	private isBuiltInTemplate(templateName: string): boolean {
		return Object.values(EmailTemplateType).includes(templateName as EmailTemplateType);
	}

	/**
	 * Inherit properties from a parent template.
	 * @param template
	 * @param parentName
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
	 * @param template
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
	 * @param template
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
	 * @param template
	 * @param pattern
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
	 * @param name
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
	 * Generate sample data for template preview (enhanced for different template types).
	 * @param templateInfo
	 * @param templateInfo.type
	 * @param templateInfo.template
	 * @param templateInfo.parentTemplate
	 */
	private generateSampleDataForTemplate(templateInfo: {
		type: 'database' | 'built-in' | 'custom';
		template: EmailTemplate | DatabaseEmailTemplate;
		parentTemplate?: string;
	}): TemplateData {
		const sampleData: TemplateData = {};
		let requiredData: string[];
		let optionalData: string[];

		// Handle different template types
		if (templateInfo.type === 'database') {
			const dbTemplate = templateInfo.template as DatabaseEmailTemplate;
			requiredData = dbTemplate.requiredData;
			optionalData = dbTemplate.optionalData || [];
		} else {
			const engineTemplate = templateInfo.template as EmailTemplate;
			requiredData = engineTemplate.requiredData;
			optionalData = engineTemplate.optionalData || [];
		}

		// Generate sample data for required fields
		requiredData.forEach((field) => {
			sampleData[field] = this.generateSampleValue(field);
		});

		// Generate sample data for optional fields
		optionalData.forEach((field) => {
			sampleData[field] = this.generateSampleValue(field);
		});

		return sampleData;
	}

	/**
	 * Generate sample data for template preview (legacy method for backward compatibility).
	 * @param template
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
	 * @param fieldName
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
	 * Invalidate template cache for a specific type or all caches.
	 * @param templateType
	 */
	async invalidateCache(templateType?: EmailTemplateType): Promise<void> {
		try {
			await this.databaseRepository.invalidateCache(templateType);
			this.log('info', 'Template cache invalidated', { templateType });
		} catch (error) {
			this.log('error', 'Failed to invalidate template cache', {
				templateType,
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			throw error;
		}
	}

	/**
	 * Refresh all template caches.
	 */
	async refreshCache(): Promise<void> {
		try {
			await this.databaseRepository.refreshCache();
			this.log('info', 'Template cache refreshed');
		} catch (error) {
			this.log('error', 'Failed to refresh template cache', {
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			throw error;
		}
	}

	/**
	 * Get multiple templates by types (batch operation).
	 * @param types
	 */
	async getTemplatesByTypes(
		types: EmailTemplateType[]
	): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>> {
		try {
			return await this.databaseRepository.getTemplatesByTypes(types);
		} catch (error) {
			this.log('error', 'Failed to get templates by types', {
				types,
				error: error instanceof Error ? error.message : 'Unknown error'
			});

			// Return empty map on error to allow fallback handling
			return new Map();
		}
	}

	/**
	 * Check if database repository is available and working.
	 */
	async isDatabaseAvailable(): Promise<boolean> {
		try {
			// Try to get all active templates as a health check
			await this.databaseRepository.getAllActiveTemplates();
			return true;
		} catch (error) {
			this.log('warn', 'Database repository not available', {
				error: error instanceof Error ? error.message : 'Unknown error'
			});
			return false;
		}
	}

	/**
	 * Get database repository instance (for advanced usage).
	 */
	getDatabaseRepository(): IDatabaseTemplateRepository {
		return this.databaseRepository;
	}

	/**
	 * Enable or disable fallback to built-in templates.
	 * @param enabled
	 */
	setFallbackToBuiltIn(enabled: boolean): void {
		this.fallbackToBuiltIn = enabled;
		this.log('info', 'Fallback to built-in templates changed', { enabled });
	}

	/**
	 * Logging utility.
	 * @param level
	 * @param message
	 * @param data
	 */
	private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, data?: unknown): void {
		const timestamp = new Date().toISOString();
		const logData = data ? ` ${JSON.stringify(data)}` : '';
		console[level](`[${timestamp}] [TemplateRegistry] ${message}${logData}`);
	}
}
