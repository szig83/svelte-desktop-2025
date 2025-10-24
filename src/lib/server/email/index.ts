// Core email service exports
export { EmailManager } from './manager';
export { ResendClient } from './client';
export { EmailLogger } from './logger';

// Template system exports
export { TemplateEngine, TemplateRegistry, createTemplateRegistry } from './templates';
export type { EmailTemplate, RenderedTemplate, TemplateData } from './templates';

// Initialization and configuration exports
export {
	initializeEmailService,
	getEmailServiceState,
	getEmailManager,
	isEmailServiceAvailable,
	isEmailServiceDegraded,
	getEmailServiceHealth,
	reinitializeEmailService,
	getEnvironmentSpecificConfig
} from './init';

// Utility functions for graceful email handling
export {
	sendEmailGracefully,
	sendTemplatedEmailGracefully,
	canSendEmails,
	getEmailServiceStatus
} from './utils';

// Diagnostics and troubleshooting
export { runEmailDiagnostics, printEmailDiagnostics } from './diagnostics';

// Type exports
export type {
	SendEmailParams,
	TemplatedEmailParams,
	EmailResult,
	EmailConfig,
	EmailLog,
	EmailLogParams,
	EmailLogFilters,
	EmailAttachment,
	EmailError,
	ResendEmailPayload,
	ResendResponse,
	ResendWebhookPayload
} from './types';

export { EmailErrorType, EmailTemplateType, EmailDeliveryStatus } from './types';

// Import for factory function
import { EmailManager } from './manager';
import { ResendClient } from './client';
import { EmailLogger } from './logger';
import { createTemplateRegistry } from './templates';
import type { EmailConfig } from './types';

// Convenience factory function
export function createEmailManager(config?: Partial<EmailConfig>): EmailManager {
	const client = new ResendClient(config);
	const logger = new EmailLogger();
	const templateRegistry = createTemplateRegistry();
	return new EmailManager(client, logger, templateRegistry);
}
