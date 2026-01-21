# Implementation Plan: Primary Color Hue Picker

## Overview

This implementation plan breaks down the primary color hue picker feature into discrete, incremental coding tasks. The feature adds a new "Színek" section to the appearance settings with a reusable ColorHuePicker component that allows users to select from predefined colors or create custom colors using a hue slider.

The implementation follows a bottom-up approach: first building the core ColorHuePicker component with its functionality, then integrating it into the AppearanceSettings component, and finally adding comprehensive tests.

## Tasks

- [x] 1. Create ColorHuePicker component structure
  - Create new file `src/lib/components/ui/ColorHuePicker.svelte`
  - Define component props interface (currentHue: number, onHueChange callback)
  - Set up Svelte 5 runes for internal state ($state for customHue and isPopoverOpen)
  - Define PREDEFINED_COLORS array with 6 colors (Blue: 225, Green: 185, Purple: 260, Orange: 45, Red: 30, Pink: 330)
  - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Implement predefined color swatches
  - [x] 2.1 Create color swatch rendering logic
    - Implement loop to render predefined color swatches
    - Create getColorStyle() function to generate OKLCH CSS: `oklch(0.55 0.2 [hue])`
    - Apply circular styling (40-48px diameter, border-radius: 50%)
    - Add active state styling (border or checkmark when currentHue matches)
    - Add hover effects (scale transform or border change)
    - _Requirements: 1.3, 1.4, 1.5, 2.2, 2.4_

  - [ ]\* 2.2 Write property test for OKLCH format consistency
    - **Property 1: OKLCH Color Format Consistency**
    - **Validates: Requirements 1.5**

  - [x] 2.3 Implement click handlers for predefined colors
    - Add onclick handler to each swatch
    - Call onHueChange callback with selected hue value
    - _Requirements: 2.1, 2.5_

  - [ ]\* 2.4 Write property test for hue value emission
    - **Property 2: Hue Value Emission**
    - **Validates: Requirements 2.1, 3.5**

  - [ ]\* 2.5 Write property test for active state indication
    - **Property 3: Active State Indication**
    - **Validates: Requirements 2.2, 2.3**

- [x] 3. Implement custom color swatch with popover
  - [x] 3.1 Create custom swatch button
    - Add custom swatch as last element in color row
    - Display current customHue value as background color
    - Add onclick handler to toggle popover
    - _Requirements: 1.3, 3.1_

  - [x] 3.2 Implement popover with hue slider
    - Import Popover components (Root, Trigger, Content)
    - Create horizontal range input (type="range", min="0", max="360", step="1")
    - Bind slider value to customHue state
    - Display numeric hue value next to slider
    - Add live preview of selected color on custom swatch
    - _Requirements: 3.2, 3.3, 3.4_

  - [ ]\* 3.3 Write property test for custom slider reactivity
    - **Property 4: Custom Slider Reactivity**
    - **Validates: Requirements 3.3, 3.4**

  - [x] 3.4 Implement custom hue selection
    - Add button or auto-close behavior to apply custom hue
    - Call onHueChange callback with customHue value
    - Ensure popover retains customHue when closed and reopened
    - _Requirements: 3.5, 3.6_

  - [ ]\* 3.5 Write property test for custom hue persistence
    - **Property 5: Custom Hue Persistence**
    - **Validates: Requirements 3.6**

- [x] 4. Add accessibility features
  - [x] 4.1 Implement keyboard navigation
    - Add tabindex="0" to all swatches
    - Add onkeydown handlers for Enter and Space keys
    - Ensure slider is keyboard accessible (arrow keys work by default)
    - _Requirements: 5.1, 5.5_

  - [x] 4.2 Add ARIA labels
    - Add aria-label to each predefined swatch with color name
    - Add aria-label="Custom color" to custom swatch
    - Add aria-label to slider input
    - _Requirements: 5.2_

  - [ ]\* 4.3 Write property test for accessibility labels
    - **Property 7: Accessibility Labels**
    - **Validates: Requirements 5.2**

  - [x] 4.4 Add CSS transitions
    - Add transition properties for hover effects
    - Add transition for active state changes
    - Add transition for popover open/close
    - _Requirements: 5.3_

- [ ] 5. Checkpoint - Test ColorHuePicker component
  - Ensure ColorHuePicker renders correctly in isolation
  - Verify all interactions work (clicks, keyboard, slider)
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Integrate ColorHuePicker into AppearanceSettings
  - [x] 6.1 Add new "Színek" section to AppearanceSettings
    - Import ColorHuePicker component
    - Add new settings-section div between "Taskbar téma mód" and "Betűméret"
    - Add Label with text "Színek"
    - Add setting-description: "Válaszd ki az alkalmazás elsődleges színét"
    - _Requirements: 1.1, 6.6_

  - [x] 6.2 Implement handleColorChange function
    - Create async function to handle color changes
    - Call updateSettings API with theme.colorPrimaryHue parameter (convert number to string)
    - Handle success: invalidate settings cache and show success toast
    - Handle errors: log to console and show error toast
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]\* 6.3 Write property test for settings API integration
    - **Property 6: Settings API Integration**
    - **Validates: Requirements 4.1**

  - [x] 6.4 Wire ColorHuePicker to settings
    - Pass currentHue prop from settings.theme.colorPrimaryHue (parse string to number)
    - Pass handleColorChange as onHueChange callback
    - _Requirements: 4.5_

  - [x] 6.5 Add info block
    - Add info-block div below ColorHuePicker
    - Add explanatory text about what primary color affects
    - _Requirements: 5.4_

- [ ] 7. Add responsive design
  - [ ] 7.1 Implement responsive layout
    - Use flexbox with flex-wrap for color swatches
    - Add responsive gap spacing (smaller on mobile)
    - Ensure swatches maintain size across screen sizes
    - Test layout at viewport width < 640px
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ]\* 7.2 Write unit tests for responsive behavior
    - Test swatch wrapping on small screens
    - Test consistent swatch sizing
    - Test responsive gap spacing

- [ ] 8. Write unit tests for ColorHuePicker
  - [ ]\* 8.1 Test component rendering
    - Verify 6 predefined swatches render
    - Verify custom swatch appears last
    - Verify swatch dimensions (40-48px)

  - [ ]\* 8.2 Test user interactions
    - Test clicking predefined swatch triggers callback
    - Test clicking custom swatch opens popover
    - Test popover contains slider with range 0-360
    - Test hover effects apply
    - Test keyboard navigation (Tab, Enter, Space)
    - Test slider arrow key navigation

  - [ ]\* 8.3 Test edge cases
    - Test with hue value 0 (boundary)
    - Test with hue value 360 (boundary)
    - Test with invalid hue values (should clamp or default)
    - Test with non-numeric currentHue prop

- [ ] 9. Write unit tests for AppearanceSettings integration
  - [ ]\* 9.1 Test section rendering
    - Verify "Színek" section appears in correct position
    - Verify info block renders with correct text

  - [ ]\* 9.2 Test settings integration
    - Test success toast appears after successful save
    - Test error toast appears after failed save
    - Test settings cache invalidates after success
    - Test component receives hue from settings context

  - [ ]\* 9.3 Test error handling
    - Test network error handling
    - Test server error handling
    - Test missing settings context handling

- [ ] 10. Final checkpoint and polish
  - Run all tests and ensure they pass
  - Test the feature end-to-end in the browser
  - Verify color changes apply correctly to the application theme
  - Check accessibility with keyboard-only navigation
  - Test on different screen sizes
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The ColorHuePicker component is designed to be reusable beyond AppearanceSettings
- All Hungarian text follows existing patterns in the application
