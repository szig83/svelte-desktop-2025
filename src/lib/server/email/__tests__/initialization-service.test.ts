import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailInitializationService } from '../initialization-service';

// Mock dependencies
vi.mock('../../../env', () => ({
	env: {
		NODE_ENV: 'test',
		EMAIL_PROVIDER: 'resend',
		RESEND_API_KEY: 're_test_key',
		RESEND_FROM_EMAIL: 'test@example.com',
		EMAIL_TEST_MODE: true,
		EMAIL_LOG_LEVEL: 'info'
	}
}));

vi.mock('../../database/repositories/email-template-repository', () => ({
	DatabaseTemplateRepository: vi.fn().mockImplementation(() => ({
		getAllActiveTemplates: vi.fn().mockResolvedValue([]),
		cache: {
			getStats: vi.fn().mockReturnValue({ size: 0 }),
			keys: vi.fn().mockResolvedValue([])
		}
	}))
}));

vi.mock('../../database/repositories/email-template-cache-manager', () => ({
	TemplateCacheManager: vi.fn().mockImplementation(() => ({
		warmUp: vi.fn().mockResolvedValue(undefined),
		getHealthMetrics: vi.fn().mockResolvedValue({
			stats: { size: 0 },
			expiringSoon: 0,
			memoryUsage: 0
		})
	}))
}));

vi.mock('../templates', () => ({
	createTemplateRegistryWithDatabase: vi.fn().mockReturnValue({})
}));

vi.mock('../providers/factory', () => ({
	EmailProviderFactory: {
		createConfiguredClient: vi.fn().mockReturnValue({
			validateApiKey: vi.fn().mockResolvedValue(true)
		})
	}
}));

vi.mock('../manager', () => ({
	EmailManager: vi.fn().mockImplementation(() => ({
		validateConfiguration: vi.fn().mockResolvedValue(true)
	}))
}));

vi.mock('../logger', () => ({
	EmailLogger: vi.fn().mockImplementation(() => ({}))
}));

describe('EmailInitializationService', () => {
	let service: EmailInitializationService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new EmailInitializationService({
			skipCacheWarmUp: false,
			validateConfiguration: true
		});
	});

	it('should initialize successfully with all components', async () => {
		const result = await service.initialize();

		expect(result.initialized).toBe(true);
		expect(result.degraded).toBe(false);
		expect(result.cacheWarmedUp).toBe(true);
		expect(result.healthStatus).toBe('healthy');
	});

	it('should perform health check', async () => {
		const healthCheck = await service.performHealthCheck();

		expect(healthCheck.status).toBeDefined();
		expect(healthCheck.checks).toBeDefined();
		expect(healthCheck.checks.configuration).toBeDefined();
		expect(healthCheck.checks.database).toBeDefined();
		expect(healthCheck.checks.cache).toBeDefined();

		expect(healthCheck.checks.apiConnectivity).toBeDefined();
	});

	it('should handle initialization with skipped migration', async () => {
		service = new EmailInitializationService({
			skipCacheWarmUp: false,
			validateConfiguration: true
		});

		const result = await service.initialize();

		expect(result.initialized).toBe(true);
	});

	it('should handle initialization with skipped cache warm-up', async () => {
		service = new EmailInitializationService({
			skipCacheWarmUp: true,
			validateConfiguration: true
		});

		const result = await service.initialize();

		expect(result.initialized).toBe(true);
		expect(result.cacheWarmedUp).toBe(true); // Should be true when skipped
	});

	it('should reinitialize successfully', async () => {
		// First initialization
		await service.initialize();

		// Reinitialize with different config
		const result = await service.reinitialize({
			skipCacheWarmUp: true
		});

		expect(result.initialized).toBe(true);
	});
});
