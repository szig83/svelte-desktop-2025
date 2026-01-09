import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestingRepository } from '../email-template-repository-factory';
import { performanceMonitor } from '../performance-monitor';
import { monitoringService } from '../monitoring-service';
import type { EmailTemplateType } from '../../../email/types';

describe('Performance Integration', () => {
	let repository: ReturnType<typeof createTestingRepository>;

	beforeEach(() => {
		repository = createTestingRepository();
		performanceMonitor.resetStats();
	});

	afterEach(() => {
		performanceMonitor.resetStats();
	});

	it('should track performance metrics for batch operations', async () => {
		const types: EmailTemplateType[] = [
			'welcome' as EmailTemplateType,
			'password_reset' as EmailTemplateType,
			'notification' as EmailTemplateType
		];

		// This should trigger performance monitoring
		const result = await repository.getTemplatesByTypes(types);

		// Check that performance was monitored
		const stats = performanceMonitor.getOperationStats('getTemplatesByTypes');
		expect(stats.count).toBe(1);
		expect(stats.avgDuration).toBeGreaterThan(0);

		// Check that result is correct format
		expect(result).toBeInstanceOf(Map);
		expect(result.size).toBeLessThanOrEqual(types.length);
	});

	it('should provide cache metrics', () => {
		const cacheMetrics = repository.getCacheMetrics();
		expect(cacheMetrics.enabled).toBe(true);
		expect(cacheMetrics.stats).toBeDefined();

		if (cacheMetrics.stats) {
			expect(typeof cacheMetrics.stats.hitRate).toBe('number');
			expect(typeof cacheMetrics.stats.size).toBe('number');
		}
	});

	it('should provide comprehensive performance metrics', () => {
		const metrics = repository.getPerformanceMetrics();

		expect(metrics.database).toBeDefined();
		expect(metrics.cache).toBeDefined();
		expect(metrics.export).toBeDefined();

		expect(metrics.export.timestamp).toBeDefined();
		expect(metrics.export.metrics).toBeDefined();
		expect(typeof metrics.export.metrics.template_operations_total).toBe('number');
	});

	it('should support cache warm-up', async () => {
		const warmUpResult = await monitoringService.warmUpCache();

		expect(warmUpResult.success).toBe(true);
		expect(warmUpResult.message).toContain('successfully');
		expect(typeof warmUpResult.duration).toBe('number');
	});

	it('should provide health check', async () => {
		const health = await monitoringService.getHealthCheck();

		expect(health.status).toMatch(/healthy|degraded|unhealthy/);
		expect(health.checks.database).toBeDefined();
		expect(health.checks.cache).toBeDefined();
		expect(health.checks.templates).toBeDefined();
		expect(health.timestamp).toBeDefined();
	});

	it('should export Prometheus metrics', async () => {
		const prometheusMetrics = await monitoringService.getPrometheusMetrics();

		expect(typeof prometheusMetrics).toBe('string');
		expect(prometheusMetrics).toContain('# HELP');
		expect(prometheusMetrics).toContain('# TYPE');
		expect(prometheusMetrics).toContain('template_');
	});

	it('should track performance trends', async () => {
		// Generate some operations
		await repository.getTemplatesByTypes(['welcome' as EmailTemplateType]);
		await repository.getAllActiveTemplates();

		const trends = monitoringService.getPerformanceTrends(1);

		expect(trends.timeWindow).toBe('1 minutes');
		expect(trends.metrics).toBeInstanceOf(Array);
		expect(trends.summary.totalOperations).toBeGreaterThan(0);
		expect(typeof trends.summary.avgDuration).toBe('number');
		expect(typeof trends.summary.errorRate).toBe('number');
	});
});
