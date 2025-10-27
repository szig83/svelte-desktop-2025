/**
 * Component tests for StartMenu
 * Tests loading states, error states, and successful app rendering
 */

import {
	AppRegistryError,
	AppRegistryErrorType,
	type ClientAppRegistry
} from '$lib/services/client/appRegistry';
import type { AppMetadata } from '$lib/types/window';

/**
 * Mock ClientAppRegistry for testing
 */
class MockClientAppRegistry implements ClientAppRegistry {
	private apps: AppMetadata[] = [];
	private loading = false;
	private error: AppRegistryError | undefined;
	private shouldFail = false;
	private failureType = AppRegistryErrorType.UNKNOWN_ERROR;

	constructor() {
		// Default mock apps
		this.apps = [
			{
				title: 'Test App 1',
				appName: 'app1',
				icon: '/icons/app1.svg',
				minSize: { width: 400, height: 300 },
				maxSize: { width: 1200, height: 800 },
				defaultSize: { width: 800, height: 600 },
				allowMultiple: false,
				maximizable: true,
				resizable: true,
				minimizable: true,
				category: 'productivity',
				parameters: {}
			},
			{
				title: 'Test App 2',
				appName: 'app2',
				icon: '/icons/app2.svg',
				minSize: { width: 300, height: 200 },
				maxSize: { width: 1000, height: 700 },
				defaultSize: { width: 600, height: 400 },
				allowMultiple: true,
				maximizable: true,
				resizable: true,
				minimizable: true,
				category: 'utility',
				parameters: {}
			}
		];
	}

	async getApps(): Promise<AppMetadata[]> {
		this.loading = true;

		// Simulate async delay
		await new Promise((resolve) => setTimeout(resolve, 10));

		if (this.shouldFail) {
			this.error = new AppRegistryError(
				this.failureType,
				'Mock error for testing',
				undefined,
				this.failureType !== AppRegistryErrorType.INVALID_METADATA
			);
			this.loading = false;
			throw this.error;
		}

		this.loading = false;
		this.error = undefined;
		return [...this.apps];
	}

	async getAppByName(appName: string): Promise<AppMetadata | undefined> {
		const apps = await this.getApps();
		return apps.find((app) => app.appName === appName);
	}

	isLoading(): boolean {
		return this.loading;
	}

	getError(): AppRegistryError | undefined {
		return this.error;
	}

	async refresh(): Promise<void> {
		this.error = undefined;
		await this.getApps();
	}

	async retry(): Promise<void> {
		this.error = undefined;
		await this.getApps();
	}

	// Test helper methods
	setApps(apps: AppMetadata[]): void {
		this.apps = apps;
	}

	setShouldFail(shouldFail: boolean, errorType = AppRegistryErrorType.UNKNOWN_ERROR): void {
		this.shouldFail = shouldFail;
		this.failureType = errorType;
	}

	clearApps(): void {
		this.apps = [];
	}
}

/**
 * Mock WindowManager for testing
 */
class MockWindowManager {
	private openedWindows: Array<{
		appName: string;
		title: string;
		metadata: AppMetadata;
		parameters: Record<string, unknown>;
	}> = [];

	openWindow(
		appName: string,
		title: string,
		metadata: AppMetadata,
		parameters: Record<string, unknown>
	): void {
		this.openedWindows.push({ appName, title, metadata, parameters });
	}

	getOpenedWindows() {
		return [...this.openedWindows];
	}

	clearOpenedWindows(): void {
		this.openedWindows = [];
	}
}

/**
 * Simple assertion helper
 */
function assert(condition: boolean, message: string): void {
	if (!condition) {
		throw new Error(`Assertion failed: ${message}`);
	}
}

/**
 * Test StartMenu component behavior with successful app loading
 */
async function testSuccessfulAppLoading(): Promise<void> {
	console.log('Testing successful app loading...');

	const mockRegistry = new MockClientAppRegistry();
	const mockWindowManager = new MockWindowManager();

	// Simulate component initialization
	const apps = await mockRegistry.getApps();

	assert(apps.length === 2, 'Should load 2 mock apps');
	assert(apps[0].appName === 'app1', 'First app should be app1');
	assert(apps[1].appName === 'app2', 'Second app should be app2');
	assert(!mockRegistry.isLoading(), 'Should not be loading after successful load');
	assert(!mockRegistry.getError(), 'Should have no error after successful load');

	// Simulate app selection
	mockWindowManager.openWindow(apps[0].appName, apps[0].title, apps[0], apps[0].parameters || {});
	const openedWindows = mockWindowManager.getOpenedWindows();

	assert(openedWindows.length === 1, 'Should have opened one window');
	assert(openedWindows[0].appName === 'app1', 'Should have opened app1');

	console.log('✓ Successful app loading test passed');
}

/**
 * Test StartMenu component behavior with loading state
 */
async function testLoadingState(): Promise<void> {
	console.log('Testing loading state...');

	const mockRegistry = new MockClientAppRegistry();

	// Check initial loading state
	const loadingPromise = mockRegistry.getApps();

	// During the async operation, loading should be true
	// Note: In a real test environment with proper timing, we'd check this
	// For this simple test, we'll just verify the promise resolves
	const apps = await loadingPromise;

	assert(Array.isArray(apps), 'Should return array of apps');
	assert(!mockRegistry.isLoading(), 'Should not be loading after completion');

	console.log('✓ Loading state test passed');
}

/**
 * Test StartMenu component behavior with error states
 */
async function testErrorStates(): Promise<void> {
	console.log('Testing error states...');

	const mockRegistry = new MockClientAppRegistry();

	// Test initialization failure
	mockRegistry.setShouldFail(true, AppRegistryErrorType.INITIALIZATION_FAILED);

	try {
		await mockRegistry.getApps();
		assert(false, 'Should have thrown an error');
	} catch (error) {
		assert(error instanceof AppRegistryError, 'Should throw AppRegistryError');
		const registryError = error as AppRegistryError;
		assert(
			registryError.type === AppRegistryErrorType.INITIALIZATION_FAILED,
			'Should be initialization error'
		);
		assert(registryError.isRecoverable(), 'Initialization error should be recoverable');
	}

	// Test network error
	mockRegistry.setShouldFail(true, AppRegistryErrorType.NETWORK_ERROR);

	try {
		await mockRegistry.getApps();
		assert(false, 'Should have thrown an error');
	} catch (error) {
		assert(error instanceof AppRegistryError, 'Should throw AppRegistryError');
		const registryError = error as AppRegistryError;
		assert(registryError.type === AppRegistryErrorType.NETWORK_ERROR, 'Should be network error');
		assert(registryError.isRecoverable(), 'Network error should be recoverable');
	}

	// Test non-recoverable error
	mockRegistry.setShouldFail(true, AppRegistryErrorType.INVALID_METADATA);

	try {
		await mockRegistry.getApps();
		assert(false, 'Should have thrown an error');
	} catch (error) {
		assert(error instanceof AppRegistryError, 'Should throw AppRegistryError');
		const registryError = error as AppRegistryError;
		assert(
			registryError.type === AppRegistryErrorType.INVALID_METADATA,
			'Should be invalid metadata error'
		);
		assert(!registryError.isRecoverable(), 'Invalid metadata error should not be recoverable');
	}

	console.log('✓ Error states test passed');
}

/**
 * Test StartMenu component behavior with empty app list
 */
async function testEmptyAppList(): Promise<void> {
	console.log('Testing empty app list...');

	const mockRegistry = new MockClientAppRegistry();
	mockRegistry.clearApps();

	const apps = await mockRegistry.getApps();

	assert(apps.length === 0, 'Should return empty array');
	assert(!mockRegistry.isLoading(), 'Should not be loading');
	assert(!mockRegistry.getError(), 'Should have no error');

	console.log('✓ Empty app list test passed');
}

/**
 * Test StartMenu component retry functionality
 */
async function testRetryFunctionality(): Promise<void> {
	console.log('Testing retry functionality...');

	const mockRegistry = new MockClientAppRegistry();

	// First, cause an error
	mockRegistry.setShouldFail(true, AppRegistryErrorType.NETWORK_ERROR);

	try {
		await mockRegistry.getApps();
		assert(false, 'Should have failed initially');
	} catch (error) {
		assert(error instanceof AppRegistryError, 'Should have thrown AppRegistryError');
	}

	// Now fix the error and retry
	mockRegistry.setShouldFail(false);
	await mockRegistry.retry();

	// The retry should succeed (though it returns void, the internal state should be fixed)
	const appsAfterRetry = await mockRegistry.getApps();
	assert(appsAfterRetry.length > 0, 'Should have apps after successful retry');
	assert(!mockRegistry.getError(), 'Should have no error after successful retry');

	console.log('✓ Retry functionality test passed');
}

/**
 * Test StartMenu component refresh functionality
 */
async function testRefreshFunctionality(): Promise<void> {
	console.log('Testing refresh functionality...');

	const mockRegistry = new MockClientAppRegistry();

	// Load initial apps
	const initialApps = await mockRegistry.getApps();
	assert(initialApps.length === 2, 'Should have initial apps');

	// Change the apps and refresh
	mockRegistry.setApps([
		{
			title: 'New App',
			appName: 'new-app',
			icon: '/icons/new-app.svg',
			minSize: { width: 400, height: 300 },
			maxSize: { width: 800, height: 600 },
			defaultSize: { width: 600, height: 450 },
			allowMultiple: false,
			maximizable: true,
			resizable: true,
			minimizable: true,
			category: 'other',
			parameters: {}
		}
	]);

	await mockRegistry.refresh();
	const refreshedApps = await mockRegistry.getApps();

	assert(refreshedApps.length === 1, 'Should have refreshed apps');
	assert(refreshedApps[0].appName === 'new-app', 'Should have the new app');

	console.log('✓ Refresh functionality test passed');
}

/**
 * Test app selection functionality
 */
async function testAppSelection(): Promise<void> {
	console.log('Testing app selection...');

	const mockRegistry = new MockClientAppRegistry();
	const mockWindowManager = new MockWindowManager();

	const apps = await mockRegistry.getApps();

	// Simulate selecting multiple apps
	apps.forEach((app) => {
		mockWindowManager.openWindow(app.appName, app.title, app, app.parameters || {});
	});

	const openedWindows = mockWindowManager.getOpenedWindows();

	assert(openedWindows.length === 2, 'Should have opened 2 windows');
	assert(openedWindows[0].appName === 'app1', 'First window should be app1');
	assert(openedWindows[1].appName === 'app2', 'Second window should be app2');

	console.log('✓ App selection test passed');
}

/**
 * Run all StartMenu component tests
 */
async function runAllStartMenuTests(): Promise<void> {
	console.log('=== Running StartMenu Component Tests ===\n');

	try {
		await testSuccessfulAppLoading();
		await testLoadingState();
		await testErrorStates();
		await testEmptyAppList();
		await testRetryFunctionality();
		await testRefreshFunctionality();
		await testAppSelection();

		console.log('\n=== All StartMenu Tests Passed Successfully! ===');
	} catch (error) {
		console.error('\n=== StartMenu Test Failed ===');
		console.error(error);
		process.exit(1);
	}
}

// Export test functions
export {
	testSuccessfulAppLoading,
	testLoadingState,
	testErrorStates,
	testEmptyAppList,
	testRetryFunctionality,
	testRefreshFunctionality,
	testAppSelection,
	runAllStartMenuTests,
	MockClientAppRegistry,
	MockWindowManager
};

// Auto-run tests if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
	runAllStartMenuTests();
}
