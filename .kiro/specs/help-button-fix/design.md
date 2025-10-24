# Design Document

## Overview

The help button functionality is broken due to a missing field mapping in the metadata conversion process. The `helpId` field exists in the registry metadata and window metadata types, but is not being copied during the conversion from registry format to window format.

## Architecture

The issue exists in the data flow between these components:

1. **App Metadata Files** (e.g., `settings/metadata.ts`) - Define `helpId`
2. **App Registry Core** - Loads metadata from files
3. **Metadata Conversion Function** - Converts registry format to window format ❌ (Missing helpId)
4. **Window Manager** - Creates window state with metadata
5. **Window Component** - Displays help button based on window state

## Components and Interfaces

### Affected Components

#### 1. convertToWindowMetadata Function

- **Location**: `src/lib/apps/registry/core.ts`
- **Issue**: Missing `helpId` field in the returned object
- **Fix**: Add `helpId: registryMetadata.helpId` to the returned object

#### 2. Window Component (Verification)

- **Location**: `src/lib/components/core/window/Window.svelte`
- **Current State**: Already correctly checks for `windowState.helpId`
- **Action**: No changes needed - already working correctly

#### 3. Window Manager (Verification)

- **Location**: `src/lib/stores/windowStore.svelte.ts`
- **Current State**: Already correctly sets `helpId: metadata.helpId`
- **Action**: No changes needed - already working correctly

### Data Flow

```
App Metadata File (helpId: 1)
    ↓
App Registry Core (loads metadata)
    ↓
convertToWindowMetadata() ❌ (drops helpId)
    ↓
Window Manager (receives metadata without helpId)
    ↓
Window State (helpId: undefined)
    ↓
Window Component (no help button shown)
```

**After Fix:**

```
App Metadata File (helpId: 1)
    ↓
App Registry Core (loads metadata)
    ↓
convertToWindowMetadata() ✅ (preserves helpId)
    ↓
Window Manager (receives metadata with helpId)
    ↓
Window State (helpId: 1)
    ↓
Window Component (help button shown)
```

## Data Models

### Registry Metadata Type

```typescript
interface AppMetadata {
  // ... other fields
  helpId?: number;
}
```

### Window Metadata Type

```typescript
interface AppMetadata {
  // ... other fields
  helpId?: number;
}
```

Both types already have the `helpId` field defined correctly.

## Error Handling

No additional error handling is needed. The `helpId` field is optional in both interfaces, so:

- If `helpId` is undefined, no help button will be shown (expected behavior)
- If `helpId` is a number, help button will be shown (expected behavior)

## Testing Strategy

### Manual Testing

1. Open the settings app (which has `helpId: 1` defined)
2. Verify that a help button (?) appears in the window header
3. Click the help button and verify it opens the help app
4. Open an app without helpId and verify no help button appears

### Verification Points

1. Check that `convertToWindowMetadata` returns helpId in the converted object
2. Check that window state contains the helpId value
3. Check that help button is rendered when helpId exists
4. Check that help button click opens help app with correct helpId parameter
