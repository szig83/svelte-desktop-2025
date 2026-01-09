# Design Document

## Overview

This design addresses the client-side app loading issue by restructuring the app registry service to provide separate client-side and server-side interfaces. The solution eliminates the use of SvelteKit's `query` function in client-side contexts while maintaining the existing functionality for server-side operations.

## Architecture

### Current Problem

The current implementation uses SvelteKit's `query` function in `appRegistry.ts`, which requires server request context. When called from client-side components like `StartMenu.svelte`, this causes the "Could not get the request store" error.

### Proposed Solution

Create a dual-interface app registry system:

1. **Client-side service** (`appRegistry.client.ts`) - Direct registry access without server context
2. **Server-side service** (`appRegistry.server.ts`) - Query-based access for SSR and API routes
3. **Shared core** (`appRegistry.core.ts`) - Common registry logic and types

## Components and Interfaces

### Core Registry Service (`appRegistry.core.ts`)

```typescript
export interface AppRegistryCore {
  getAllApps(): AppMetadata[];
  getAppByName(appName: string): AppMetadata | undefined;
  isInitialized(): boolean;
  initialize(): Promise<void>;
}

export class AppRegistryManager implements AppRegistryCore {
  private initialized = false;
  private apps: Map<string, AppMetadata> = new Map();

  async initialize(): Promise<void> {
    // Initialize registry from metadata files
  }

  getAllApps(): AppMetadata[] {
    // Return all registered apps
  }

  getAppByName(appName: string): AppMetadata | undefined {
    // Return specific app metadata
  }
}
```

### Client-side Service (`appRegistry.client.ts`)

```typescript
export interface ClientAppRegistry {
  getApps(): Promise<AppMetadata[]>;
  getAppByName(appName: string): Promise<AppMetadata | undefined>;
  isLoading(): boolean;
}

export class ClientAppRegistryService implements ClientAppRegistry {
  private registryManager: AppRegistryManager;
  private loading = false;

  async getApps(): Promise<AppMetadata[]> {
    await this.ensureInitialized();
    return this.registryManager.getAllApps();
  }

  private async ensureInitialized(): Promise<void> {
    // Initialize registry if needed
  }
}
```

### Server-side Service (`appRegistry.server.ts`)

```typescript
export const getApps = query(async () => {
  const registry = new AppRegistryManager();
  await registry.initialize();
  return registry.getAllApps();
});

export const getAppByName = query(v.string(), async (appName: string) => {
  const registry = new AppRegistryManager();
  await registry.initialize();
  return registry.getAppByName(appName);
});
```

## Data Models

### AppMetadata Interface

```typescript
export interface AppMetadata {
  title: string;
  appName: string;
  icon: string;
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  defaultSize: { width: number; height: number };
  allowMultiple: boolean;
  maximizable: boolean;
  parameters: Record<string, any>;
}
```

### Registry State

```typescript
export interface RegistryState {
  initialized: boolean;
  loading: boolean;
  apps: Map<string, AppMetadata>;
  error?: string;
}
```

## Error Handling

### Client-side Error Handling

1. **Initialization Errors**: Catch and log registry initialization failures, provide fallback empty state
2. **Loading Errors**: Display user-friendly error messages in StartMenu component
3. **Missing Apps**: Handle cases where expected apps are not found in registry

### Server-side Error Handling

1. **Query Errors**: Return appropriate HTTP status codes for API failures
2. **Registry Errors**: Log server-side initialization issues
3. **Validation Errors**: Validate app names and parameters in server queries

## Testing Strategy

### Unit Tests

1. **Core Registry Tests**:
   - Test app registration and retrieval
   - Test initialization process
   - Test error conditions

2. **Client Service Tests**:
   - Test async app loading
   - Test loading state management
   - Test error handling

3. **Server Service Tests**:
   - Test query functions
   - Test server-side initialization
   - Test validation logic

### Integration Tests

1. **StartMenu Component Tests**:
   - Test app loading and display
   - Test error state rendering
   - Test loading state rendering

2. **Registry Integration Tests**:
   - Test client-server consistency
   - Test initialization across contexts
   - Test concurrent access patterns

### Component Testing

1. **StartMenu Component**:
   - Mock client registry service
   - Test loading states
   - Test error states
   - Test app selection functionality

## Implementation Notes

### Migration Strategy

1. Create new client-side service alongside existing server service
2. Update StartMenu component to use client service
3. Maintain server service for SSR and API routes
4. Remove old mixed-context implementation

### Performance Considerations

1. **Client-side Caching**: Cache initialized registry to avoid repeated initialization
2. **Lazy Loading**: Initialize registry only when needed
3. **Memory Management**: Clean up registry resources when appropriate

### Browser Compatibility

1. **Async/Await Support**: Use modern async patterns supported in target browsers
2. **Module Loading**: Ensure dynamic imports work in target environments
3. **Error Boundaries**: Implement proper error boundaries for registry failures
