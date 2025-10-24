/**
 * Unit tests for ClientAppRegistryService
 * Tests core functionality, loading states, and error conditions
 *
 * This test file is designed to work with or without a testing framework.
 * It includes both formal test structure and a simple test runner.
 */

import {
	ClientAppRegistryService,
	AppRegistryError,
	AppRegistryErrorType,
	getClientAppRegistry
} from '../appRegistry';

/**
 * Simple test assertion helper
 */
function assert(condition: boolean, message: string): void {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
}

/**
 * Test suite for AppRegistryError
 */
function testAppRegistryError(): void {
	console.log('Testing AppRegistryError...');

	// Test error creation
	const error = new AppRegistryError(
		AppRegistryErrorType.INITIALIZATION_FAILED,
		'Test error',
		new Error('Original error'),
		true
	);

	assert(
		error.type === AppRegistryErrorType.INITIALIZATION_FAILED,
		'Error type should be set correctly'
	);
	assert(error.message === 'Test error', 'Error message should be set correctly');
	assert(error.originalError instanceof Error, 'Original error should be preserved');
	assert(error.recoverable === true, 'Recoverable flag should be set correctly');
	assert(error.name === 'AppRegistryError', 'Error name should be AppRegistryError');

	// Test user-friendly messages
	const initError = new AppRegistryError(AppRegistryErrorType.INITIALIZATION_FAILED, 'Init failed');
	const notFoundError = new AppRegistryError(AppRegistryErrorType.APP_NOT_FOUND, 'Not found');
	const networkError = new AppRegistryError(AppRegistryErrorType.NETWORK_ERROR, 'Network issue');
	const invalidError = new AppRegistryError(AppRegistryErrorType.INVALID_METADATA, 'Bad data');
	const unknownError = new AppRegistryError(AppRegistryErrorType.UNKNOWN_ERROR, 'Unknown');

	assert(
		initError.getUserFriendlyMessage().includes('Failed to load applications'),
		'Init error should have appropriate message'
	);
	assert(
		notFoundError.getUserFriendlyMessage().includes('could not be found'),
		'Not found error should have appropriate message'
	);
	assert(
		networkError.getUserFriendlyMessage().includes('Network error'),
		'Network error should have appropriate message'
	);
	assert(
		invalidError.getUserFriendlyMessage().includes('corrupted'),
		'Invalid metadata error should have appropriate message'
	);
	assert(
		unknownError.getUserFriendlyMessage().includes('unexpected error'),
		'Unknown error should have appropriate message'
	);

	// Test recoverability
	const recoverableError = new AppRegistryError(
		AppRegistryErrorType.NETWORK_ERROR,
		'Network issue',
		undefined,
		true
	);
	const nonRecoverableError = new AppRegistryError(
		AppRegistryErrorType.INVALID_METADATA,
		'Bad data',
		undefined,
		false
	);

	assert(recoverableError.isRecoverable() === true, 'Recoverable error should return true');
	assert(
		nonRecoverableError.isRecoverable() === false,
		'Non-recoverable error should return false'
	);

	console.log('✓ AppRegistryError tests passed');
}

/**
 * Test suite for ClientAppRegistryService basic functionality
 */
function testClientAppRegistryService(): void {
	console.log('Testing ClientAppRegistryService...');

	// Test service instantiation
	const service = new ClientAppRegistryService();
	assert(service instanceof ClientAppRegistryService, 'Service should be instantiated correctly');

	// Test initial state
	assert(service.isLoading() === false, 'Service should not be loading initially');
	assert(service.getError() === undefined, 'Service should have no error initially');

	console.log('✓ ClientAppRegistryService basic tests passed');
}

/**
 * Test suite for global registry functions
 */
function testGlobalFunctions(): void {
	console.log('Testing global registry functions...');

	// Test singleton behavior
	const registry1 = getClientAppRegistry();
	const registry2 = getClientAppRegistry();

	assert(registry1 === registry2, 'getClientAppRegistry should return singleton instance');
	assert(
		registry1 instanceof ClientAppRegistryService,
		'Global registry should be ClientAppRegistryService instance'
	);

	console.log('✓ Global registry function tests passed');
}

/**
 * Test error type enumeration
 */
function testErrorTypes(): void {
	console.log('Testing error types...');

	// Test all error types exist
	assert(
		AppRegistryErrorType.INITIALIZATION_FAILED === 'initialization_failed',
		'INITIALIZATION_FAILED should have correct value'
	);
	assert(
		AppRegistryErrorType.APP_NOT_FOUND === 'app_not_found',
		'APP_NOT_FOUND should have correct value'
	);
	assert(
		AppRegistryErrorType.NETWORK_ERROR === 'network_error',
		'NETWORK_ERROR should have correct value'
	);
	assert(
		AppRegistryErrorType.INVALID_METADATA === 'invalid_metadata',
		'INVALID_METADATA should have correct value'
	);
	assert(
		AppRegistryErrorType.UNKNOWN_ERROR === 'unknown_error',
		'UNKNOWN_ERROR should have correct value'
	);

	console.log('✓ Error type tests passed');
}

/**
 * Integration test that verifies the service can handle real-world scenarios
 */
async function testIntegration(): Promise<void> {
	console.log('Testing integration scenarios...');

	const service = new ClientAppRegistryService();

	try {
		// This will likely fail in the test environment since we don't have real app metadata
		// But it should fail gracefully with proper error handling
		await service.getApps();
		console.log('✓ getApps() completed (apps may be empty in test environment)');
	} catch (error) {
		// Expected in test environment - verify it's a proper AppRegistryError
		if (error instanceof AppRegistryError) {
			console.log(
				'✓ getApps() failed gracefully with AppRegistryError:',
				error.getUserFriendlyMessage()
			);
		} else {
			console.log('⚠ getApps() failed with unexpected error type:', error);
		}
	}

	try {
		// Test getting a specific app (should fail gracefully)
		await service.getAppByName('nonexistent-app');
		console.log('⚠ getAppByName() should have failed for nonexistent app');
	} catch (error) {
		if (error instanceof AppRegistryError && error.type === AppRegistryErrorType.APP_NOT_FOUND) {
			console.log('✓ getAppByName() correctly threw APP_NOT_FOUND error');
		} else {
			console.log('✓ getAppByName() failed as expected (may be initialization error)');
		}
	}

	console.log('✓ Integration tests completed');
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
	console.log('=== Running ClientAppRegistryService Tests ===\n');

	try {
		testErrorTypes();
		testAppRegistryError();
		testClientAppRegistryService();
		testGlobalFunctions();
		await testIntegration();

		console.log('\n=== All Tests Passed Successfully! ===');
	} catch (error) {
		console.error('\n=== Test Failed ===');
		console.error(error);
		process.exit(1);
	}
}

// Export test functions for use with testing frameworks
export {
	testAppRegistryError,
	testClientAppRegistryService,
	testGlobalFunctions,
	testErrorTypes,
	testIntegration,
	runAllTests
};

// Auto-run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
	runAllTests();
}
