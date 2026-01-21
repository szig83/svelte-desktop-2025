# Requirements Document

## Introduction

This document specifies the requirements for a primary color hue picker feature in the appearance settings. The feature allows users to customize the application's primary color by selecting from predefined color schemes or creating a custom color using a hue slider. The color system uses OKLCH color space with a variable `--primary-h` (hue value 0-360).

## Glossary

- **ColorHuePicker**: The new component that displays color options and handles color selection
- **AppearanceSettings**: The parent component that integrates the ColorHuePicker and manages settings persistence
- **Hue**: A numeric value between 0-360 representing the color position on the color wheel in OKLCH color space
- **Color_Swatch**: A circular visual representation of a color option
- **Custom_Swatch**: A special swatch that opens a popover with a hue slider for custom color selection
- **ThemeManager**: The service class that manages theme settings and applies them to the application
- **OKLCH**: A perceptually uniform color space (Oklab Lightness Chroma Hue) used for color representation

## Requirements

### Requirement 1: Color Selection Interface

**User Story:** As a user, I want to see available color options in the appearance settings, so that I can understand what colors are available to customize my application.

#### Acceptance Criteria

1. WHEN the appearance settings page loads, THE AppearanceSettings SHALL display a "Színek" section between the "Taskbar téma mód" and "Betűméret" sections
2. THE ColorHuePicker SHALL display at least 6 predefined color swatches (Blue: 225, Green: 185, Purple: 260, Orange: 45, Red: 30, Pink: 330)
3. THE ColorHuePicker SHALL display a "Custom" swatch as the last option in the row
4. THE Color_Swatch SHALL be circular with a diameter between 40-48 pixels
5. WHEN displaying a color swatch, THE ColorHuePicker SHALL render the color using OKLCH format with the formula `oklch(0.55 0.2 [hue])`

### Requirement 2: Predefined Color Selection

**User Story:** As a user, I want to select from predefined color schemes, so that I can quickly change the app's primary color without manual adjustment.

#### Acceptance Criteria

1. WHEN a user clicks a predefined color swatch, THE ColorHuePicker SHALL emit the selected hue value to the parent component
2. WHEN a color is selected, THE Color_Swatch SHALL display an active state with visual indication (border or checkmark)
3. WHEN the ColorHuePicker receives a current hue value prop, THE ColorHuePicker SHALL mark the matching swatch as active
4. WHEN a user hovers over a color swatch, THE Color_Swatch SHALL display a hover effect (scale or border change)
5. THE ColorHuePicker SHALL NOT directly save settings to the database

### Requirement 3: Custom Color Creation

**User Story:** As a user, I want to create a custom color by adjusting the hue value, so that I can personalize the app's appearance beyond predefined options.

#### Acceptance Criteria

1. WHEN a user clicks the Custom_Swatch, THE ColorHuePicker SHALL open a popover positioned near the swatch
2. THE Custom_Swatch popover SHALL contain a horizontal hue slider with range 0-360
3. WHEN a user adjusts the hue slider, THE Custom_Swatch SHALL display a live preview of the selected color
4. THE Custom_Swatch popover SHALL display the numeric hue value
5. WHEN a user selects a custom hue value, THE ColorHuePicker SHALL emit the hue value to the parent component
6. WHEN the popover closes, THE ColorHuePicker SHALL retain the last selected custom hue value

### Requirement 4: Settings Persistence

**User Story:** As a user, I want my color selection to be saved, so that my preference persists across sessions.

#### Acceptance Criteria

1. WHEN a user selects a color (predefined or custom), THE AppearanceSettings SHALL call the updateSettings API with the new hue value
2. WHEN the settings update succeeds, THE AppearanceSettings SHALL invalidate the settings cache to reload updated values
3. WHEN the settings update succeeds, THE AppearanceSettings SHALL display a success toast notification
4. IF the settings update fails, THEN THE AppearanceSettings SHALL display an error toast notification
5. THE AppearanceSettings SHALL pass the current hue value from settings context to the ColorHuePicker component

### Requirement 5: Visual Feedback and Accessibility

**User Story:** As a user, I want clear visual feedback and accessible controls, so that I can easily understand and use the color picker.

#### Acceptance Criteria

1. THE Color_Swatch SHALL have keyboard navigation support (Tab, Enter, Space)
2. THE Color_Swatch SHALL have ARIA labels describing the color name or "Custom color"
3. WHEN transitioning between states, THE Color_Swatch SHALL use smooth CSS transitions
4. THE ColorHuePicker section SHALL include an info block explaining what the primary color affects
5. THE Custom_Swatch slider SHALL be keyboard accessible (Arrow keys for adjustment)

### Requirement 6: Component Architecture

**User Story:** As a developer, I want the ColorHuePicker to be a reusable component, so that it can be easily maintained and potentially used in other contexts.

#### Acceptance Criteria

1. THE ColorHuePicker SHALL be implemented as a standalone Svelte component in `src/lib/components/ui/`
2. THE ColorHuePicker SHALL use Svelte 5 runes ($state, $effect, $props) for reactivity
3. THE ColorHuePicker SHALL accept a `currentHue` prop (number) to display the active state
4. THE ColorHuePicker SHALL accept an `onHueChange` callback prop to emit selected hue values
5. THE ColorHuePicker SHALL use existing UI components (Popover, Label) from the component library
6. THE ColorHuePicker SHALL follow the existing design patterns in AppearanceSettings (section structure, info blocks, spacing)

### Requirement 7: Responsive Design

**User Story:** As a user, I want the color picker to work well on different screen sizes, so that I can customize colors on any device.

#### Acceptance Criteria

1. WHEN the viewport width is less than 640px, THE ColorHuePicker SHALL wrap color swatches to multiple rows if needed
2. THE Color_Swatch SHALL maintain consistent size and spacing across different screen sizes
3. THE Custom_Swatch popover SHALL position itself appropriately to remain visible on small screens
4. THE ColorHuePicker SHALL use responsive gap spacing that adapts to screen size
