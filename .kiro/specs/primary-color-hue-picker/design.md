# Design Document: Primary Color Hue Picker

## Overview

The primary color hue picker feature adds a new "Színek" section to the appearance settings, allowing users to customize the application's primary color. The implementation consists of two main components:

1. **ColorHuePicker** - A reusable UI component that displays color options and handles user interaction
2. **AppearanceSettings Integration** - Updates to the existing settings component to integrate the color picker and manage persistence

The design follows the existing patterns in the application, using Svelte 5 runes for reactivity, OKLCH color space for color representation, and the established settings persistence mechanism through the ThemeManager.

## Architecture

### Component Hierarchy

```
AppearanceSettings (Parent)
└── ColorHuePicker (New Component)
    ├── Predefined Color Swatches (6+)
    └── Custom Color Swatch
        └── Popover
            ├── Hue Slider (0-360)
            └── Numeric Display
```

### Data Flow

1. **Initialization**: AppearanceSettings reads current hue from settings context
2. **Display**: ColorHuePicker receives currentHue prop and marks active swatch
3. **Selection**: User clicks swatch → ColorHuePicker calls onHueChange callback
4. **Persistence**: AppearanceSettings calls updateSettings API → invalidates cache → shows toast
5. **Update**: Settings reload → new hue value flows back to ColorHuePicker

### Integration Points

- **ThemeManager**: Existing service that applies theme settings (no changes needed)
- **updateSettings API**: Existing remote procedure for saving settings (no changes needed)
- **Settings Context**: Existing Svelte context providing settings to components (no changes needed)
- **UI Components**: Popover, Label, Button from existing component library

## Components and Interfaces

### ColorHuePicker Component

**Location**: `src/lib/components/ui/ColorHuePicker.svelte`

**Props Interface**:

```typescript
interface ColorHuePickerProps {
  currentHue: number;           // Current hue value (0-360)
  onHueChange: (hue: number) => void;  // Callback when hue changes
}
```

**Internal State**:

```typescript
let customHue = $state<number>(260);  // Current custom hue value
let isPopoverOpen = $state<boolean>(false);  // Popover open state
```

**Predefined Colors**:

```typescript
const PREDEFINED_COLORS = [
  { label: 'Kék', hue: 225 },
  { label: 'Zöld', hue: 185 },
  { label: 'Lila', hue: 260 },
  { label: 'Narancs', hue: 45 },
  { label: 'Piros', hue: 30 },
  { label: 'Rózsaszín', hue: 330 }
];
```

**Key Methods**:

- `handlePredefinedColorClick(hue: number)` - Handles predefined color selection
- `handleCustomHueChange(event: Event)` - Handles slider value changes
- `isActive(hue: number): boolean` - Determines if a swatch should show active state
- `getColorStyle(hue: number): string` - Generates OKLCH color CSS

### AppearanceSettings Updates

**Location**: `src/lib/apps/settings/components/AppearanceSettings.svelte`

**New Method**:

```typescript
async function handleColorChange(newHue: number) {
  try {
    const result = await updateSettings({
      theme: { colorPrimaryHue: newHue.toString() }
    });
    if (result && 'success' in result && result.success) {
      await invalidate('app:settings');
      toast.success('Szín mentve');
    } else {
      toast.error('Hiba történt a mentés során');
    }
  } catch (error) {
    console.error('Color update error:', error);
    toast.error('Hiba történt a mentés során');
  }
}
```

**New Section Structure**:

```svelte
<div class="settings-section">
	<div class="setting-item">
		<div class="setting-label-group">
			<Label>Színek</Label>
			<p class="setting-description">Válaszd ki az alkalmazás elsődleges színét</p>
		</div>

		<ColorHuePicker
			currentHue={parseInt(settings.theme.colorPrimaryHue)}
			onHueChange={handleColorChange}
		/>

		<div class="info-block">
			<p>Az elsődleges szín határozza meg az alkalmazás kiemelő színét...</p>
		</div>
	</div>
</div>
```

## Data Models

### Color Representation

**OKLCH Format**:

- **Lightness (L)**: Fixed at 0.55 (55%) for consistent brightness
- **Chroma (C)**: Fixed at 0.2 (20%) for consistent saturation
- **Hue (H)**: Variable 0-360 degrees, user-selectable

**CSS Variable**:

```css
--primary-h: [hue-value];
--primary: oklch(0.55 0.2 var(--primary-h));
```

### Settings Schema

The hue value is stored in the existing theme settings structure:

```typescript
interface ThemeSettings {
  mode: ThemeMode;
  modeTaskbarStartMenu: ThemeMode;
  colorPrimaryHue: string;  // String representation of hue (0-360)
  fontSize: FontSize;
}
```

**Note**: The existing schema stores hue as a string. The component will handle conversion between string and number.

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: OKLCH Color Format Consistency

_For any_ hue value between 0-360, when the ColorHuePicker renders a color swatch, the generated CSS color string SHALL use the format `oklch(0.55 0.2 [hue])` with fixed lightness (0.55) and chroma (0.2) values.

**Validates: Requirements 1.5**

### Property 2: Hue Value Emission

_For any_ color selection (predefined or custom), when a user selects a hue value, the ColorHuePicker SHALL call the onHueChange callback with the exact numeric hue value (0-360) that was selected.

**Validates: Requirements 2.1, 3.5**

### Property 3: Active State Indication

_For any_ hue value, when that value is set as the currentHue prop, the ColorHuePicker SHALL display an active state indicator (border or checkmark) on the matching color swatch.

**Validates: Requirements 2.2, 2.3**

### Property 4: Custom Slider Reactivity

_For any_ slider position between 0-360, when the user adjusts the custom hue slider, both the visual color preview and the numeric hue display SHALL update to reflect the current slider value.

**Validates: Requirements 3.3, 3.4**

### Property 5: Custom Hue Persistence

_For any_ custom hue value, when the user sets a custom hue and then closes and reopens the popover, the custom swatch SHALL display the previously selected hue value.

**Validates: Requirements 3.6**

### Property 6: Settings API Integration

_For any_ hue value selection, when the user selects a color through the ColorHuePicker, the AppearanceSettings component SHALL call the updateSettings API with the theme.colorPrimaryHue parameter set to the string representation of the selected hue value.

**Validates: Requirements 4.1**

### Property 7: Accessibility Labels

_For any_ color swatch in the ColorHuePicker, the swatch element SHALL have an aria-label attribute that describes either the color name (for predefined colors) or "Custom color" (for the custom swatch).

**Validates: Requirements 5.2**

## Error Handling

### Input Validation

**Hue Value Bounds**:

- The component SHALL accept hue values in the range 0-360
- Values outside this range SHALL be clamped to the nearest valid value (0 or 360)
- Non-numeric values SHALL default to 260 (purple, the default color)

**Prop Validation**:

```typescript
// In ColorHuePicker component
const validatedHue = $derived(() => {
  const hue = props.currentHue;
  if (typeof hue !== 'number' || isNaN(hue)) return 260;
  return Math.max(0, Math.min(360, hue));
});
```

### API Error Handling

**Settings Update Failures**:

- Network errors: Display toast with message "Hiba történt a mentés során"
- Server errors: Display toast with message "Hiba történt a mentés során"
- Log errors to console for debugging
- Do NOT revert the UI state (optimistic UI pattern)

**Error Recovery**:

```typescript
try {
  const result = await updateSettings({ theme: { colorPrimaryHue: newHue.toString() } });
  if (result && 'success' in result && result.success) {
    await invalidate('app:settings');
    toast.success('Szín mentve');
  } else {
    toast.error('Hiba történt a mentés során');
  }
} catch (error) {
  console.error('Color update error:', error);
  toast.error('Hiba történt a mentés során');
}
```

### Component Error Boundaries

**Missing Dependencies**:

- If Popover component is not available, log error and render without custom color option
- If settings context is not available, use default hue value (260)

**Browser Compatibility**:

- OKLCH color space requires modern browsers (Chrome 111+, Safari 16.4+, Firefox 113+)
- No fallback needed as the application already requires modern browser features

## Testing Strategy

### Dual Testing Approach

The feature will be tested using both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
**Property Tests**: Verify universal properties across all inputs

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Unit Test Coverage

**Component Rendering** (Examples):

- ColorHuePicker renders with 6 predefined color swatches
- Custom swatch appears as the last element
- Color swatches have diameter between 40-48px
- "Színek" section appears in correct position in AppearanceSettings

**User Interactions** (Examples):

- Clicking predefined color swatch triggers callback
- Clicking custom swatch opens popover
- Popover contains slider with range 0-360
- Hover effects apply to swatches
- Keyboard navigation works (Tab, Enter, Space)
- Slider responds to arrow keys

**Settings Integration** (Examples):

- Success toast appears after successful save
- Error toast appears after failed save
- Settings cache invalidates after successful save
- Component receives hue from settings context

**Responsive Design** (Examples):

- Swatches wrap on viewports < 640px
- Swatch size remains consistent across screen sizes
- Gap spacing adapts to screen size

**Accessibility** (Examples):

- All swatches have aria-label attributes
- Keyboard navigation works correctly
- CSS transitions are smooth

### Property-Based Test Coverage

Property-based tests will use a testing library appropriate for TypeScript/Svelte (e.g., fast-check). Each test will run a minimum of 100 iterations to ensure comprehensive input coverage.

**Property Test 1: OKLCH Format Consistency**

- **Feature: primary-color-hue-picker, Property 1: OKLCH Color Format Consistency**
- Generate random hue values (0-360)
- Render ColorHuePicker with each hue
- Verify generated CSS matches `oklch(0.55 0.2 [hue])` format
- Validates: Requirements 1.5

**Property Test 2: Hue Value Emission**

- **Feature: primary-color-hue-picker, Property 2: Hue Value Emission**
- Generate random hue values (0-360)
- Simulate selection of both predefined and custom colors
- Verify callback receives exact hue value
- Validates: Requirements 2.1, 3.5

**Property Test 3: Active State Indication**

- **Feature: primary-color-hue-picker, Property 3: Active State Indication**
- Generate random hue values (0-360)
- Set as currentHue prop
- Verify matching swatch shows active state
- Validates: Requirements 2.2, 2.3

**Property Test 4: Custom Slider Reactivity**

- **Feature: primary-color-hue-picker, Property 4: Custom Slider Reactivity**
- Generate random slider positions (0-360)
- Simulate slider adjustment
- Verify both preview color and numeric display update
- Validates: Requirements 3.3, 3.4

**Property Test 5: Custom Hue Persistence**

- **Feature: primary-color-hue-picker, Property 5: Custom Hue Persistence**
- Generate random custom hue values (0-360)
- Set custom hue, close popover, reopen
- Verify custom swatch displays previous value
- Validates: Requirements 3.6

**Property Test 6: Settings API Integration**

- **Feature: primary-color-hue-picker, Property 6: Settings API Integration**
- Generate random hue values (0-360)
- Mock updateSettings API
- Simulate color selection
- Verify API called with correct string parameter
- Validates: Requirements 4.1

**Property Test 7: Accessibility Labels**

- **Feature: primary-color-hue-picker, Property 7: Accessibility Labels**
- Render ColorHuePicker
- Iterate through all swatches
- Verify each has aria-label attribute
- Validates: Requirements 5.2

### Testing Configuration

**Property-Based Testing Library**: fast-check (for TypeScript)
**Test Runner**: Vitest (existing project test runner)
**Minimum Iterations**: 100 per property test
**Component Testing**: @testing-library/svelte

### Test Organization

```
src/lib/components/ui/ColorHuePicker.test.ts    # Unit tests
src/lib/components/ui/ColorHuePicker.prop.test.ts  # Property tests
src/lib/apps/settings/components/AppearanceSettings.test.ts  # Integration tests
```

## Implementation Notes

### Component Reusability

The ColorHuePicker is designed as a reusable component that:

- Does not depend on specific settings infrastructure
- Accepts hue value and callback as props
- Can be used in other contexts beyond AppearanceSettings
- Follows single responsibility principle (display and selection only)

### Performance Considerations

**Reactivity Optimization**:

- Use `$derived` for computed values to minimize recalculation
- Debounce slider changes if performance issues arise (not expected)
- Use CSS transforms for hover effects (GPU-accelerated)

**Bundle Size**:

- No additional dependencies required
- Reuses existing UI components (Popover, Label)
- Minimal CSS footprint

### Future Enhancements

Potential future improvements (not in current scope):

- Color palette presets (multiple coordinated colors)
- Recent colors history
- Color picker with saturation/lightness adjustment
- Import/export color schemes
- Accessibility mode with high contrast colors
