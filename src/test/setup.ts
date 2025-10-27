import { vi } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'development';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'test';
process.env.DB_PORT = '5432';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.EMAIL_PROVIDER = 'test';
process.env.RESEND_API_KEY = 'test-key';
process.env.RESEND_FROM_EMAIL = 'test@example.com';

// Mock environment variables for testing
vi.mock('$env/static/private', () => ({
	NODE_ENV: 'development',
	DB_HOST: 'localhost',
	DB_USER: 'test',
	DB_PASSWORD: 'test',
	DB_NAME: 'test',
	DB_PORT: '5432',
	DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
	EMAIL_PROVIDER: 'test',
	RESEND_API_KEY: 'test-key',
	RESEND_FROM_EMAIL: 'test@example.com'
}));

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	dev: true,
	building: false,
	version: 'test'
}));
