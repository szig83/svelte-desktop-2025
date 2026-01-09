# Implementation Plan

- [x] 1. Fix metadata conversion function
  - Add helpId field to the convertToWindowMetadata function return object
  - Ensure the helpId is properly copied from registry metadata to window metadata
  - _Requirements: 1.4, 1.5_

- [x] 2. Add unit test for metadata conversion
  - Create test to verify helpId is preserved during conversion
  - Test both cases: with helpId and without helpId
  - _Requirements: 1.4_

- [x] 3. Manual verification testing
  - Test settings app help button functionality
  - Verify help button appears when helpId is present
  - Verify help button opens help app with correct helpId
  - Test app without helpId to ensure no help button appears
  - _Requirements: 1.1, 1.2, 1.3_
