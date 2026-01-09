// Template system exports
export { TemplateEngine } from './engine';
export { TemplateRegistry } from './registry';
export { builtInTemplates } from './built-in';

// Type exports
export type { EmailTemplate, RenderedTemplate, TemplateData } from './engine';

// Import for factory function
import { TemplateRegistry } from './registry';
import { DatabaseTemplateRepository } from '../../database/repositories/email-template-repository';
import type {
	IDatabaseTemplateRepository,
	RepositoryConfig
} from '../../database/types/email-templates';

// Convenience factory function
export function createTemplateRegistry(
	databaseRepository?: IDatabaseTemplateRepository,
	fallbackToBuiltIn: boolean = true
): TemplateRegistry {
	return new TemplateRegistry(databaseRepository, fallbackToBuiltIn);
}

// Factory function with default database repository
export function createTemplateRegistryWithDatabase(
	config?: Partial<RepositoryConfig>,
	fallbackToBuiltIn: boolean = true
): TemplateRegistry {
	const defaultConfig: RepositoryConfig = {
		enableCache: true,
		cacheConfig: {
			defaultTtl: 3600, // 1 hour
			templateByTypeTtl: 3600, // 1 hour
			allActiveTemplatesTtl: 1800, // 30 minutes
			templateByIdTtl: 7200 // 2 hours
		},
		retryAttempts: 3,
		retryDelay: 1000
	};

	const finalConfig = { ...defaultConfig, ...config };
	const databaseRepository = new DatabaseTemplateRepository(finalConfig);

	return new TemplateRegistry(databaseRepository, fallbackToBuiltIn);
}
