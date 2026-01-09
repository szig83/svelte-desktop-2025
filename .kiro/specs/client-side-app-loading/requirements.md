# Requirements Document

## Introduction

Fix the client-side app loading issue in the StartMenu component where SvelteKit's server-side `query` function is being used in a client-side context, causing a request store error. The system needs to properly separate server-side and client-side data loading for the app registry.

## Glossary

- **App Registry**: The system that manages and provides metadata about available applications
- **StartMenu Component**: The client-side Svelte component that displays available apps to users
- **Query Function**: SvelteKit's server-side data loading utility that requires request context
- **Client Service**: Browser-side service that handles data loading without server context
- **App Metadata**: Configuration data describing application properties like name, icon, size constraints

## Requirements

### Requirement 1

**User Story:** As a user, I want to open the start menu without encountering JavaScript errors, so that I can access available applications.

#### Acceptance Criteria

1. WHEN the user opens the start menu, THE StartMenu Component SHALL load without throwing request store errors
2. WHILE the start menu is open, THE StartMenu Component SHALL display available applications correctly
3. IF the app registry fails to load, THEN THE StartMenu Component SHALL display an appropriate error message
4. THE StartMenu Component SHALL load app data using client-side methods only

### Requirement 2

**User Story:** As a developer, I want clear separation between server-side and client-side data loading, so that the application architecture is maintainable and error-free.

#### Acceptance Criteria

1. THE App Registry Service SHALL provide separate methods for server-side and client-side data access
2. THE Client Service SHALL handle app metadata loading without requiring server request context
3. THE Server Service SHALL continue to support SSR and API endpoints that need app metadata
4. WHERE server-side rendering is needed, THE App Registry Service SHALL provide server-compatible methods

### Requirement 3

**User Story:** As a user, I want the start menu to load quickly and reliably, so that I can efficiently access applications.

#### Acceptance Criteria

1. THE StartMenu Component SHALL initialize app data synchronously when possible
2. WHILE app data is loading, THE StartMenu Component SHALL display a loading state
3. WHEN app data loading completes, THE StartMenu Component SHALL render the application list
4. THE Client Service SHALL cache app metadata to improve subsequent load times
