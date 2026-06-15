# Changelog

## [0.2.0] - Flexible Output Extension

### Added
- Variable output width and height.
- Preset sizes: 16x16, 24x24, 32x32, 48x48, 64x64.
- Custom width and height inputs.
- Output size validation against source dimensions and max 256.
- Sampling modes: `median`, `average`, `center`.
- Output format selector for PNG, JPG, and Aseprite.
- JPG export with white background compositing.
- JPG transparency warning.
- Aseprite binary export with one frame, one layer, and raw RGBA cel data.
- Upper-center warning banner with icon and text.
- Download filenames with width, height, sampling mode, and extension.
- Expanded test page covering 31 conversion, validation, and export cases.

### Changed
- Conversion logic now uses `outputWidth` and `outputHeight` instead of a single hard-coded output size.
- Default output remains 32x32 median PNG.
- Output preview supports non-square result dimensions without distortion.
- Documentation now describes the flexible generator instead of only the initial 32x32 version.

### Fixed
- Presets larger than the loaded source image are disabled.
- Invalid output sizes block conversion and disable download.

### Known Issues
- Aseprite export is structurally validated but was not opened in the Aseprite desktop app or CLI in this environment.
- Very large images are processed synchronously on the main thread.

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

### Fixed
- Empty-tile risk for images smaller than 32x32 was handled by clamped bounds with at least one sampled pixel.
- Download button started disabled and was reset when a new file began processing.
