# Requirements Document

## Introduction

The help button functionality in window headers is not working because the `helpId` from app metadata is not being passed through to the window state. When an app has a `helpId` defined in its metadata, a help button (?) should appear in the window header that opens the help app with the specified help ID.

## Glossary

- **App Registry**: System that manages application metadata and loading
- **Window Manager**: System that manages window states and operations
- **Help Button**: Question mark (?) button in window header that opens help app
- **Help ID**: Numeric identifier that specifies which help content to display
- **Metadata Conversion**: Process of converting registry metadata to window metadata format

## Requirements

### Requirement 1

**User Story:** As a user, I want to see a help button in the window header when an app has help available, so that I can access contextual help for that application.

#### Acceptance Criteria

1. WHEN an app has a helpId defined in its metadata, THE Window_Component SHALL display a help button in the window header
2. WHEN the help button is clicked, THE Window_Component SHALL open the help app with the specified helpId parameter
3. WHEN an app does not have a helpId defined, THE Window_Component SHALL not display a help button
4. THE Metadata_Conversion_Function SHALL preserve the helpId field when converting from registry metadata to window metadata
5. THE Window_Manager SHALL pass the helpId from metadata to the window state during window creation
