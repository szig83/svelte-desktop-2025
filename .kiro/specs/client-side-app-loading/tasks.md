# Implementation Plan

- [x] 1. Create core registry service with shared logic
  - Extract common registry functionality into a reusable core service
  - Implement AppRegistryManager class with initialization and app retrieval methods
  - Create shared interfaces and types for consistent API across client and server
  - _Requirements: 2.1, 2.2_

- [x] 2. Implement client-side app registry service
- [x] 2.1 Create client-side service class
  - Write ClientAppRegistryService class that works without server request context
  - Implement async app loading methods that use the core registry
  - Add loading state management for better UX
  - _Requirements: 1.1, 1.4, 3.1_

- [x] 2.2 Add client-side error handling
  - Implement proper error catching and user-friendly error messages
  - Add fallback states for when registry initialization fails
  - Create error recovery mechanisms
  - _Requirements: 1.3, 2.1_

- [x] 2.3 Write unit tests for client service
  - Create tests for ClientAppRegistryService methods
  - Test loading states and error conditions
  - Mock registry initialization for isolated testing
  - _Requirements: 1.1, 1.3, 3.1_

- [x] 3. Update StartMenu component to use client service
- [x] 3.1 Replace server query with client service
  - Remove usage of SvelteKit query function from StartMenu component
  - Integrate ClientAppRegistryService for app data loading
  - Update component state management to handle async loading
  - _Requirements: 1.1, 1.4_

- [x] 3.2 Implement proper loading and error states
  - Add loading spinner or skeleton while apps are being loaded
  - Display user-friendly error messages when loading fails
  - Ensure smooth transitions between loading, success, and error states
  - _Requirements: 1.3, 3.2, 3.3_

- [x] 3.3 Add component tests for StartMenu
  - Write tests for StartMenu component with mocked client service
  - Test loading states, error states, and successful app rendering
  - Verify app selection functionality works correctly
  - _Requirements: 1.1, 1.3_

- [x] 4. Maintain server-side compatibility
- [x] 4.1 Create dedicated server-side service
  - Implement server-side app registry service using query functions
  - Ensure server service works for SSR and API endpoints
  - Maintain backward compatibility with existing server-side usage
  - _Requirements: 2.3, 2.4_

- [x] 4.2 Update any server-side components using app registry
  - Identify and update server-side code that uses the app registry
  - Ensure proper separation between client and server contexts
  - Test server-side rendering still works correctly
  - _Requirements: 2.3, 2.4_

- [x] 4.3 Add integration tests for server service
  - Test server-side query functions work correctly
  - Verify SSR compatibility with new registry structure
  - Test API endpoints that depend on app registry
  - _Requirements: 2.3, 2.4_

- [x] 5. Clean up and optimize
- [x] 5.1 Remove old mixed-context implementation
  - Delete or refactor the current appRegistry.ts that mixes client/server contexts
  - Update imports throughout the codebase to use appropriate services
  - Ensure no remaining references to the problematic implementation
  - _Requirements: 2.1, 2.2_

- [x] 5.2 Add performance optimizations
  - Implement client-side caching for registry data
  - Add lazy initialization to avoid unnecessary work
  - Optimize memory usage and cleanup when appropriate
  - _Requirements: 3.4_

- [x] 5.3 Add comprehensive integration tests
  - Test client-server consistency in app metadata
  - Verify concurrent access patterns work correctly
  - Test initialization across different contexts
  - _Requirements: 1.1, 2.1, 3.1_
