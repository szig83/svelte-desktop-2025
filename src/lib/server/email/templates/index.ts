// Template system exports
export { TemplateEngine } from './engine';
export { TemplateRegistry } from './registry';
export { builtInTemplates } from './built-in';

// Type exports
export type { EmailTemplate, RenderedTemplate, TemplateData } from './engine';

// Import for factory function
import { TemplateRegistry } from './registry';

// Convenience factory function
export function createTemplateRegistry(): TemplateRegistry {
	return new TemplateRegistry();
}
