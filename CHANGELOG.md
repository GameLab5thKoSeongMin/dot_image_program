# Changelog

## [0.1.0] - Initial Complete Version

### Added
- Initial project structure
- Basic four-section GUI layout
- Image input through file selection
- Drag-and-drop input
- 32x32 tile median conversion
- Transparent PNG handling
- Original image preview
- Result preview with pixelated scaling
- PNG download
- Test page with generated algorithm verification images
- English Codex-facing documentation
- Korean user-facing guide, development report, and test summary

### Changed
- None for the initial version.

### Fixed
- Empty-tile risk for images smaller than 32x32 is handled by clamped bounds with at least one sampled pixel.
- Download button starts disabled and is reset when a new file begins processing.

### Known Issues
- Very large images are processed synchronously on the main thread.
- Output size is fixed at 32x32 in this version.
