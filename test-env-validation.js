#!/usr/bin/env node

/**
 * Test script to validate environment configuration
 */

console.log('🧪 Testing environment validation...\n');

// Test different scenarios
const testCases = [
	{
		name: 'Valid SMTP configuration',
		env: {
			EMAIL_PROVIDER: 'smtp',
			SMTP_HOST: 'smtp.gmail.com',
			SMTP_PORT: '587',
			SMTP_USERNAME: 'test@gmail.com',
			SMTP_PASSWORD: 'password123',
			SMTP_SECURE: 'false'
		}
	},
	{
		name: 'Valid Resend configuration',
		env: {
			EMAIL_PROVIDER: 'resend',
			RESEND_API_KEY: 're_test_api_key',
			RESEND_FROM_EMAIL: 'test@example.com'
		}
	},
	{
		name: 'Invalid SMTP - missing host',
		env: {
			EMAIL_PROVIDER: 'smtp',
			SMTP_PORT: '587',
			SMTP_USERNAME: 'test@gmail.com',
			SMTP_PASSWORD: 'password123'
		}
	},
	{
		name: 'Invalid Resend - wrong API key format',
		env: {
			EMAIL_PROVIDER: 'resend',
			RESEND_API_KEY: 'wrong_format_key',
			RESEND_FROM_EMAIL: 'test@example.com'
		}
	}
];

// Mock required env vars
const baseEnv = {
	NODE_ENV: 'development',
	DB_HOST: 'localhost',
	DB_USER: 'test',
	DB_PASSWORD: 'test',
	DB_NAME: 'test',
	DB_PORT: '5432',
	DATABASE_URL: 'postgresql://test:test@localhost:5432/test'
};

async function runTests() {
	for (const testCase of testCases) {
		console.log(`📋 Testing: ${testCase.name}`);

		// Set environment variables
		const originalEnv = { ...process.env };
		Object.assign(process.env, baseEnv, testCase.env);

		try {
			// Clear require cache
			delete require.cache[require.resolve('./src/lib/env.ts')];

			// Try to load env
			const { env } = require('./src/lib/env.ts');
			console.log(`✅ PASS: ${testCase.name}`);
			console.log(`   Provider: ${env.EMAIL_PROVIDER}`);
		} catch (error) {
			console.log(`❌ FAIL: ${testCase.name}`);
			console.log(`   Error: ${error.message}`);
		}

		// Restore original env
		process.env = originalEnv;
		console.log('');
	}
}

runTests().catch(console.error);
