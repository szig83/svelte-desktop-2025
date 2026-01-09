import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateRegistry } from '../registry';
import { EmailTemplateType } from '../../types';
import type {
	IDatabaseTemplateRepository,
	DatabaseEmailTemplate
} from '../../../database/types/email-templates';

// Mock database repository for testing
class MockDatabaseTemplateRepository implements IDatabaseTemplateRepository {
	private templates: Map<string, DatabaseEmailTemplate> = new Map();

	async getTemplateByType(type: EmailTemplateType): Promise<DatabaseEmailTemplate | null> {
		return this.templates.get(type) || null;
	}

	async getAllActiveTemplates(): Promise<DatabaseEmailTemplate[]> {
		return Array.from(this.templates.values()).filter((t) => t.isActive);
	}

	async getTemplateById(id: string): Promise<DatabaseEmailTemplate | null> {
		return Array.from(this.templates.values()).find((t) => t.id === id) || null;
	}

	async createTemplate(): Promise<DatabaseEmailTemplate> {
		throw new Error('Not implemented in mock');
	}

	async updateTemplate(): Promise<DatabaseEmailTemplate> {
		throw new Error('Not implemented in mock');
	}

	async deactivateTemplate(): Promise<void> {
		throw new Error('Not implemented in mock');
	}

	async activateTemplate(): Promise<void> {
		throw new Error('Not implemented in mock');
	}

	async getTemplatesByTypes(
		types: EmailTemplateType[]
	): Promise<Map<EmailTemplateType, DatabaseEmailTemplate>> {
		const result = new Map<EmailTemplateType, DatabaseEmailTemplate>();
		for (const type of types) {
			const template = this.templates.get(type);
			if (template) {
				result.set(type, template);
			}
		}
		return result;
	}

	async invalidateCache(): Promise<void> {
		// Mock implementation
	}

	async refreshCache(): Promise<void> {
		// Mock implementation
	}

	// Helper method for testing
	setMockTemplate(type: EmailTemplateType, template: DatabaseEmailTemplate): void {
		this.templates.set(type, template);
	}

	clearMockTemplates(): void {
		this.templates.clear();
	}
}

describe('TemplateRegistry Integration', () => {
	let registry: TemplateRegistry;
	let mockRepository: MockDatabaseTemplateRepository;

	beforeEach(() => {
		mockRepository = new MockDatabaseTemplateRepository();
		registry = new TemplateRegistry(mockRepository, true);
	});

	describe('Database Template Integration', () => {
		it('should render database template when available', async () => {
			// Setup mock database template
			const mockTemplate: DatabaseEmailTemplate = {
				id: 'test-id',
				type: EmailTemplateType.WELCOME,
				name: 'Welcome Template',
				subjectTemplate: 'Welcome {{name}}!',
				htmlTemplate: '<h1>Welcome {{name}}!</h1>',
				textTemplate: 'Welcome {{name}}!',
				requiredData: ['name'],
				optionalData: [],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockRepository.setMockTemplate(EmailTemplateType.WELCOME, mockTemplate);

			// Test rendering
			const result = await registry.renderTemplate(EmailTemplateType.WELCOME, { name: 'John' });

			expect(result.subject).toBe('Welcome John!');
			expect(result.html).toContain('Welcome John!');
			expect(result.text).toBe('Welcome John!');
		});

		it('should fallback to built-in template when database template not found', async () => {
			// Don't set any mock templates, should fallback to built-in
			const result = await registry.renderTemplate(EmailTemplateType.WELCOME, {
				name: 'John',
				email: 'john@example.com',
				appName: 'TestApp'
			});

			expect(result.subject).toContain('Welcome to TestApp, John!');
			expect(result.html).toContain('John');
			expect(result.text).toContain('John');
		});

		it('should validate template data correctly for database templates', async () => {
			const mockTemplate: DatabaseEmailTemplate = {
				id: 'test-id',
				type: EmailTemplateType.WELCOME,
				name: 'Welcome Template',
				subjectTemplate: 'Welcome {{name}}!',
				htmlTemplate: '<h1>Welcome {{name}}!</h1>',
				textTemplate: 'Welcome {{name}}!',
				requiredData: ['name', 'email'],
				optionalData: [],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockRepository.setMockTemplate(EmailTemplateType.WELCOME, mockTemplate);

			// Should pass validation
			await expect(
				registry.validateTemplateData(EmailTemplateType.WELCOME, {
					name: 'John',
					email: 'john@example.com'
				})
			).resolves.toBe(true);

			// Should fail validation for missing required field
			await expect(
				registry.validateTemplateData(EmailTemplateType.WELCOME, { name: 'John' })
			).rejects.toThrow('Missing required template data');
		});

		it('should list database templates correctly', async () => {
			const mockTemplate: DatabaseEmailTemplate = {
				id: 'test-id',
				type: EmailTemplateType.WELCOME,
				name: 'Welcome Template',
				subjectTemplate: 'Welcome {{name}}!',
				htmlTemplate: '<h1>Welcome {{name}}!</h1>',
				textTemplate: 'Welcome {{name}}!',
				requiredData: ['name'],
				optionalData: [],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockRepository.setMockTemplate(EmailTemplateType.WELCOME, mockTemplate);

			const templates = await registry.listTemplates();

			expect(templates.database).toContain(EmailTemplateType.WELCOME);
			expect(templates.builtIn).toContain(EmailTemplateType.WELCOME);
			expect(templates.custom).toEqual([]);
		});

		it('should get template info for database templates', async () => {
			const mockTemplate: DatabaseEmailTemplate = {
				id: 'test-id',
				type: EmailTemplateType.WELCOME,
				name: 'Welcome Template',
				subjectTemplate: 'Welcome {{name}}!',
				htmlTemplate: '<h1>Welcome {{name}}!</h1>',
				textTemplate: 'Welcome {{name}}!',
				requiredData: ['name'],
				optionalData: [],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			};

			mockRepository.setMockTemplate(EmailTemplateType.WELCOME, mockTemplate);

			const info = await registry.getTemplateInfo(EmailTemplateType.WELCOME);

			expect(info).not.toBeNull();
			expect(info?.type).toBe('database');
			expect((info?.template as DatabaseEmailTemplate).name).toBe('Welcome Template');
		});
	});

	describe('Fallback Behavior', () => {
		it('should handle database errors gracefully', async () => {
			// Create a registry with a failing repository
			const failingRepository = {
				...mockRepository,
				getTemplateByType: vi.fn().mockRejectedValue(new Error('Database error'))
			} as unknown as IDatabaseTemplateRepository;

			const registryWithFailingDb = new TemplateRegistry(failingRepository, true);

			// Should fallback to built-in template
			const result = await registryWithFailingDb.renderTemplate(EmailTemplateType.WELCOME, {
				name: 'John',
				email: 'john@example.com',
				appName: 'TestApp'
			});

			expect(result.subject).toContain('Welcome to TestApp, John!');
		});

		it('should throw error when no fallback is available', async () => {
			const registryWithoutFallback = new TemplateRegistry(mockRepository, false);

			await expect(
				registryWithoutFallback.renderTemplate('nonexistent-template', {})
			).rejects.toThrow('Template not found');
		});
	});

	describe('Cache Management', () => {
		it('should provide cache invalidation methods', async () => {
			const invalidateSpy = vi.spyOn(mockRepository, 'invalidateCache');
			const refreshSpy = vi.spyOn(mockRepository, 'refreshCache');

			await registry.invalidateCache(EmailTemplateType.WELCOME);
			await registry.refreshCache();

			expect(invalidateSpy).toHaveBeenCalledWith(EmailTemplateType.WELCOME);
			expect(refreshSpy).toHaveBeenCalled();
		});
	});

	describe('Database Availability', () => {
		it('should check database availability', async () => {
			const isAvailable = await registry.isDatabaseAvailable();
			expect(typeof isAvailable).toBe('boolean');
		});
	});
});
