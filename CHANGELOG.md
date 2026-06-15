# Changelog

## [0.4.0] - Size UI and Output Policy Update

### Added
- Separate Width and Height controls.
- Width options: `16`, `32`, `64`, `Original`, `Custom`.
- Height options: `16`, `32`, `64`, `Original`, `Custom`.
- Hidden custom width and height inputs that appear only after `Custom` is selected.
- `Original` width/height resolution after a valid image is loaded.
- Disabled state for `Original` before image load.
- Disabled state for numeric options larger than the source dimension.
- Large-output performance warnings.
- Explicit `미리보기 갱신` button for large output conversion.
- Clean original/result preview placeholders without empty or fake image sources.
- Preview image `error` handling that restores placeholder state.
- Result summary text.
- Result preview zoom options: `Fit`, `Actual`, `8x`, `16x`.
- UI and validation tests for the new size policy.

### Changed
- Removed the fixed 256x256 output size limit.
- Output validation now allows sizes up to original image dimensions.
- Valid output above 256 is allowed when the source image is large enough.
- Large valid output sizes warn instead of blocking conversion.
- Automatic conversion is deferred for large output sizes to avoid repeated heavy work.
- Option controls are grouped into Output Size, Pixel Processing, and Export.
- Documentation now reflects the separated size controls, original-size behavior, performance warnings, and placeholder behavior.

### Fixed
- Default state no longer risks showing broken image icons.
- Failed preview image loads no longer leave visible broken image elements.

## [0.3.0] - Palette Limit Extension

### Added
- Palette limit option group.
- Palette modes: `off`, `auto`, `4`, `8`, `16`, `32`, `64`, `128`, `256`, `custom`.
- Custom palette count validation from 2 to 256.
- Auto palette recommendations based on output resolution.
- `src/paletteQuantizer.js` with median cut quantization.
- Visible RGB color counting that excludes transparent pixels.
- Palette summary showing current, effective, and resulting visible color counts.
- Filename palette suffix `_pN` when palette mode is not `off`.
- Palette tests in `tests/test-cases.html`.

### Changed
- Conversion pipeline now applies optional palette post-processing after tile conversion and before preview/export.
- PNG/JPG/Aseprite export now use the palette-limited canvas when palette mode is enabled.
- Documentation now describes palette behavior, transparency handling, and JPG limitations.

### Fixed
- Invalid custom palette counts are blocked through the warning banner and disable download.

### Known Issues
- No dithering is included.
- External palette import is not included.
- Aseprite export remains RGBA, not indexed color.

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
- Expanded test page covering conversion, validation, and export cases.

### Changed
- Conversion logic uses `outputWidth` and `outputHeight` instead of a single hard-coded output size.
- Default output remains 32x32 median PNG.

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
