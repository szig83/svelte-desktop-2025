#!/usr/bin/env node

/**
 * Simple script to restart email service by clearing module cache
 * This helps when environment variables change during development
 */

console.log('🔄 Restarting email service...');

// Clear require cache for email-related modules
const modulePatterns = [/email/, /env/, /config/];

Object.keys(require.cache).forEach((key) => {
	if (modulePatterns.some((pattern) => pattern.test(key))) {
		delete require.cache[key];
		console.log(`   Cleared cache for: ${key}`);
	}
});

console.log('✅ Email service cache cleared');
console.log('💡 Restart your dev server to apply changes');
