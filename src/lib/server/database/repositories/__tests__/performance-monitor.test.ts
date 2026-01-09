import { describe, it, expect, beforeEach } from 'vitest';
import { PerformanceMonitor } from '../performance-monitor';

describe('PerformanceMonitor', () => {
	let monitor: PerformanceMonitor;

	beforeEach(() => {
		monitor = new PerformanceMonitor();
	});

	it('should track operation timing', () => {
		const endTiming = monitor.startTiming('test_operation', { param: 'value' });

		// Simulate some work
		const start = Date.now();
		while (Date.now() - start < 10) {
			// Wait 10ms
		}

		endTiming();

		const stats = monitor.getOperationStats('test_operation');
		expect(stats.count).toBe(1);
		expect(stats.avgDuration).toBeGreaterThan(0);
		expect(stats.successRate).toBe(100);
	});

	it('should record errors correctly', () => {
		monitor.recordError('test_operation', 'Test error', 50, { param: 'value' });

		const stats = monitor.getOperationStats('test_operation');
		expect(stats.count).toBe(1);
		expect(stats.successRate).toBe(0);
		expect(stats.avgDuration).toBe(50);
	});

	it('should calculate percentiles correctly', () => {
		// Record multiple operations with different durations
		const durations = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

		durations.forEach((duration) => {
			monitor.recordError('test_operation', '', duration);
		});

		const stats = monitor.getOperationStats('test_operation');
		expect(stats.count).toBe(10);
		expect(stats.minDuration).toBe(10);
		expect(stats.maxDuration).toBe(100);
		expect(stats.p95Duration).toBe(100); // 95th percentile of 10 items is the last item
	});

	it('should export metrics in correct format', () => {
		const endTiming = monitor.startTiming('test_operation');
		endTiming();

		const exported = monitor.exportMetrics();
		expect(exported.timestamp).toBeDefined();
		expect(exported.metrics.template_operations_total).toBe(1);
		expect(exported.operations.test_operation).toBeDefined();
		expect(exported.operations.test_operation.count).toBe(1);
	});

	it('should filter recent metrics correctly', async () => {
		const endTiming = monitor.startTiming('test_operation');
		endTiming();

		const recent = monitor.getRecentMetrics(1); // Last 1 minute
		expect(recent.length).toBe(1);

		// Wait a small amount and check with very small window
		await new Promise((resolve) => setTimeout(resolve, 10));
		const olderMetrics = monitor.getRecentMetrics(0.0001); // Very small window
		expect(olderMetrics.length).toBe(0);
	});
});
