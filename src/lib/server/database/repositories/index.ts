// User repository exports
export { UserRepository, userRepository } from './user-repository';

// Email template repository exports
export { DatabaseTemplateRepository } from './email-template-repository';
export { TemplateCache, CACHE_KEYS } from './email-template-cache';
export { TemplateCacheManager } from './email-template-cache-manager';
export {
	createDatabaseTemplateRepository,
	getDatabaseTemplateRepository,
	resetDatabaseTemplateRepository,
	createHighPerformanceRepository,
	createDevelopmentRepository,
	createTestingRepository,
	createNoCacheRepository,
	createRepositoryForEnvironment
} from './email-template-repository-factory';

// Type exports
export type {
	DatabaseEmailTemplate,
	CreateTemplateData,
	UpdateTemplateData,
	IDatabaseTemplateRepository,
	ITemplateCache,
	CacheConfig,
	RepositoryConfig,
	MigrationResult,
	MigrationError,
	ValidationResult,
	MigrationBackup
} from '../types/email-templates';

export { DatabaseTemplateError } from '../types/email-templates';

// Performance monitoring exports
export { PerformanceMonitor, performanceMonitor } from './performance-monitor';
export { MonitoringService, monitoringService } from './monitoring-service';

// Security and audit exports
export { TemplateSecurityValidator, SecurityValidationError } from './template-security-validator';
export { TemplateAuditLogger, AuditEventType } from './template-audit-logger';
export { TemplateRateLimiter } from './template-rate-limiter';
export { TemplateSecurityService } from './template-security-service';
