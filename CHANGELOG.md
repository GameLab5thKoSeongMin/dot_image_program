# Changelog

## [1.3.0] - Layered PNG Input / Layered Aseprite Export

### Added
- Layered Mode UI defaulting to off.
- Multi-image layer input with layer rename, reorder, visibility toggle, and delete controls.
- Independent per-layer processing with shared global settings.
- Visible-layer composite preview for Layered Mode.
- Flattened visible-layer PNG/JPG export.
- Multi-layer Aseprite export for visible processed layers.
- Aseprite binary inspection now reports layer/cel counts and layer names for tests.
- Tests for Layered Mode UI defaults/actions, visible-layer compositing, and layered Aseprite layer/cel records.

### Changed
- `src/exporter.js` keeps the existing single-canvas Aseprite export and adds separate layered export helpers.
- `src/app.js` keeps single-image state and adds separate `state.layered` for Layered Mode.
- Hidden layers are omitted from v1.3.0 Aseprite export and from flattened PNG/JPG composites.

### Verification
- `node --check` passed for `src/app.js`, `src/uiController.js`, and `src/exporter.js`.
- `tests/test-cases.html` inline script parsed successfully after layered tests were added.
- Static checks found no ES Module `import/export`, no browser `alert()`, and no fixed `32x32` resize shortcut.
- Browser assertion execution remains blocked in this environment by the same local headless GPU initialization failure recorded for earlier v1.x milestones.

## [1.2.0] - Example Gallery / QA Set

### Added
- `src/exampleGallery.js` with generated, repository-owned example canvases and settings recipes.
- Collapsed Examples / QA UI section in `index.html`.
- One-click example loading that applies matching settings and then uses the normal preview/conversion path.
- Example QA action for deterministic generated sample conversion checks.
- Test-page coverage for generated-only example metadata, deterministic QA conversion, and example UI rendering.

### Changed
- `src/app.js` exposes example selection and QA handlers while keeping default startup behavior unchanged.
- `src/uiController.js` renders generated example thumbnails and status through the UI layer.

### Verification
- `node --check` passed for `src/exampleGallery.js`, `src/uiController.js`, and `src/app.js`.
- `tests/test-cases.html` inline script parsed successfully after example tests were added.
- Static checks found no ES Module `import/export`, no browser `alert()`, and no fixed `32x32` resize shortcut.
- Browser assertion execution remains blocked in this environment by the same local headless GPU initialization failure recorded for v1.0.0 and v1.1.0.

## [1.1.0] - Settings Preset Save / Load

### Added
- `src/presetManager.js` for settings-only preset schema, sanitization, `localStorage` persistence, and JSON import/export.
- Collapsed Settings Presets UI with save, load, delete, reset, export, and import controls.
- Built-in recommended presets for common 32px and 64px icon workflows.
- Tests for preset storage, stale/partial preset normalization, JSON import/export, invalid JSON, image-data exclusion, and UI setting restore.

### Changed
- `src/app.js` can apply preset settings through the same option-change and conversion validation flow used by manual UI changes.
- `src/uiController.js` can restore all serializable settings without storing file objects, data URLs, canvases, blobs, clipboard data, or local paths.

### Verification
- `node --check` passed for `src/presetManager.js`, `src/uiController.js`, `src/app.js`, and core support files.
- `tests/test-cases.html` inline script parsed successfully after preset tests were added.
- A Node VM check verified preset save/load/delete, JSON import rejection, stale preset normalization, and exclusion of private image/path fields.
- Static checks found no ES Module `import/export`, no browser `alert()`, and no fixed `32x32` resize shortcut.
- Browser execution remains blocked in this environment by the same local headless GPU initialization failure recorded for v1.0.0.

## [1.0.0] - Performance Stabilization / Web Worker

### Added
- `src/conversionWorker.js` for optional worker-side preprocess, tile conversion, palette/dither processing, palette analysis, and outline processing.
- `src/workerClient.js` as the main-thread wrapper for worker creation, progress stages, fallback signaling, and cancellation.
- Processing status state and a visible cancel action while worker conversion is active.
- Worker/fallback/cancel tests in `tests/test-cases.html`.

### Changed
- `src/app.js` now attempts worker-backed conversion first and falls back to the existing main-thread path if worker creation or execution fails.
- Source image decoding and source `ImageData` extraction remain on the main thread for compatibility; expensive pixel processing can run in the worker.
- Direct `index.html` use remains supported. A local HTTP server is recommended for reliable worker behavior because some browsers block workers under `file://`.

### Fixed
- Canceled worker results are guarded by a request id and cannot overwrite the current valid result.

### Known Issues
- Browser worker availability depends on browser policy and page origin. If worker startup fails, the app uses the main-thread fallback and shows a non-blocking warning.
- Export blob preparation still runs on the main thread.

### Verification
- JS syntax checks passed for all app JS files, including `src/workerClient.js` and `src/conversionWorker.js`.
- Static checks found no ES Module `import/export`, no browser `alert()`, and no fixed `32x32` resize shortcut.
- `tests/test-cases.html` inline script parsed successfully.
- Headless Edge and Chrome browser execution was attempted through `http://127.0.0.1:8000/tests/test-cases.html?autorun=1`, but both browsers exited before page execution with local GPU-process initialization failures. No test assertion failures were produced because the page could not execute in this environment.

## [0.9.0] - Source Preprocess and Icon Assist

### Added
- Collapsed Preprocess controls for brightness, contrast, saturation, and sharpen.
- Background cleanup toggle, picked color, and RGB-distance tolerance.
- `src/iconAssistProcessor.js`.
- Outline modes `off`, `1px black`, and `1px dark`.
- Preprocess and outline state in the final result flow.
- Tests for neutral defaults, adjustments, sharpen, cleanup, outline, and processed export.

### Changed
- Source preprocessing now runs before tile conversion.
- Background cleanup runs before source adjustments.
- Manual palette edits update the pre-outline canvas and regenerate outline.
- Palette summary reports outline mode and added pixel count.
- Result summary reports active preprocess and outline state without changing neutral defaults.

### Fixed
- Preprocess operations preserve alpha on visible pixels.
- Background cleanup preserves existing transparent pixels.
- Outline does not overwrite visible pixels.
- PNG/JPG/Aseprite export use the preprocessed and outlined final canvas.

### Known Issues
- Preprocess, sharpen, and outline run on the main browser thread.
- Background cleanup is RGB-distance based and is not AI segmentation.
- Outline is limited to a one-pixel 8-neighbor layer.

### Verification
- JS syntax checks passed for all app JS files.
- Local Edge headless test page reported `94 / 94 cases passed.`
- Local Edge loaded `index.html` with neutral defaults, collapsed Preprocess/Icon Assist, default summary, result-header refresh, and PNG/JPG/Aseprite selector.
- Static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.
- M5 reran syntax checks for every app JS file and the complete browser suite, again producing `94 / 94 cases passed.` with zero failures.
- M5 passed a generated 64x64 PNG through the real app file-processing path and verified `sample_32x32_median.png`, visible previews, final-canvas PNG/JPG blobs, and a valid 32-bit RGBA Aseprite buffer.
- The obsolete `Dotprogram.html` duplicate was removed; `index.html` is the sole maintained application entry point.
- External Aseprite desktop/CLI open/save validation remains pending.

## [0.8.0] - Palette Swatches and Manual Color Editor

### Added
- Collapsed Palette Editor in the output panel.
- Result swatches with HEX, usage count, percentage, visible pixel total, and transparent pixel count.
- Copy HEX action with clipboard API and local fallback.
- Replace color action using exact visible RGB matching.
- Merge color action using another result swatch as the target.
- Manual edit count in palette summaries.
- Tests for swatches, reset behavior, replacement, merge, transparency, and edited export.

### Changed
- App state now keeps `convertedCanvas`, final `resultCanvas`, current `resultPalette`, and `paletteEditCount`.
- Manual edits replace `state.resultCanvas` and immediately refresh preview and palette summary.
- Every new conversion clears manual Palette Editor state.

### Fixed
- Manual color replacement preserves existing alpha values.
- Transparent pixels are skipped during replacement and merge.
- PNG/JPG/Aseprite export use the manually edited final canvas.

### Known Issues
- Clipboard writes may be blocked by browser permission policy; the selected HEX remains visible.
- v0.8.0 does not include undo/redo, color locking, or fuzzy color matching.

### Verification
- JS syntax checks passed for all app JS files.
- Local Edge headless test page reported `84 / 84 cases passed.`
- Local Edge loaded `index.html` with default behavior, collapsed Palette Editor, disabled pre-conversion edit actions, result-header refresh, and PNG/JPG/Aseprite selector.
- Static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.

## [0.7.0] - Palette Source and Fixed Palette Mapping

### Added
- Palette source selector with `generated`, `builtIn`, and `imported`.
- Generic built-in palettes: `grayscale4`, `gameboyLike4`, `picoLike16`, `warm8`, and `cool8`.
- Pasted HEX palette input with 3-digit/6-digit normalization, duplicate removal, and validation.
- Local `.txt` / `.hex` palette file loading.
- Imported palette preview.
- Fixed nearest-color mapping for built-in and imported palettes.
- Tests for source selection, parsing, validation, transparency, dithering, and export consistency.

### Changed
- `generated` remains the default median-cut path.
- Built-in and imported palette sources can activate palette mapping while generated palette limit is `off`.
- Dithering now works with fixed palette mapping.
- Palette summaries identify fixed palette source and effective color count.

### Fixed
- Fixed palette mapping preserves transparent pixels and keeps palette-on binary alpha normalization.
- PNG/JPG/Aseprite export use the fixed-palette final canvas.

### Known Issues
- Palette import is local only; URL fetching and `.gpl` parsing are not included.
- Manual palette swatch editing is deferred to v0.8.0.

### Verification
- JS syntax checks passed for updated app files.
- Local Edge headless test page reported `78 / 78 cases passed.`
- Static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.

## [0.6.0] - Dithering

### Added
- Dithering mode selector with `off`, `floydSteinberg`, and `bayer4x4`.
- Floyd-Steinberg RGB error diffusion for palette-mapped output.
- Deterministic Bayer 4x4 ordered dithering for palette-mapped output.
- Dithering state in result summaries and palette summaries when active.
- Warning banner message when dithering is selected while palette mode is `off`.
- Tests for dithering off regression, Floyd-Steinberg, Bayer 4x4, transparency preservation, palette-off skip behavior, and dithered PNG/JPG/Aseprite export.

### Changed
- Palette mapping can now use optional dithering while preserving median-cut generated palettes.
- PNG/JPG/Aseprite export continue to use the final processed canvas, including dithered output.
- Documentation now describes the dithering pipeline and palette-dependent behavior.

### Fixed
- None.

### Known Issues
- Dithering strength is fixed at `1`; no strength UI is included in v0.6.0.
- Dithering only runs when palette mapping is active. It is skipped when palette mode is `off`.
- Floyd-Steinberg can add processing cost for large output sizes; existing large-output warnings remain the mitigation.

### Verification
- JS syntax checks passed for updated app files.
- Local Edge headless test page reported `70 / 70 cases passed.`
- Static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.

## [0.5.0] - Custom Size, Dominant Sampling, and Palette Alpha Update

### Added
- Custom size toggle with default off state.
- Width presets: `16`, `32`, `64`, `128`, `256`.
- Height presets: `16`, `32`, `64`, `128`, `256`.
- Source-dimension defaults for Custom Width and Custom Height after image load.
- `dominant` sampling mode.
- Dominant tile sampling using visible RGB buckets and average RGBA from the winning bucket.
- Palette-on alpha normalization to `0` or `255`.
- Palette summary unique RGBA before/after counts.
- Tests for Custom size toggle behavior, dominant sampling, and palette alpha normalization.

### Changed
- Removed the old `Original` size buttons.
- Removed per-axis `Custom` size buttons.
- Removed the lower/input-area duplicate `미리보기 갱신` button.
- Kept the result preview header as the single explicit refresh location.
- Palette-enabled output now applies alpha normalization even when RGB palette reduction is not needed.
- PNG/JPG/Aseprite preview/export continue to use the final palette-processed canvas.
- Documentation now reflects Custom size mode, dominant sampling, and palette alpha behavior.

### Fixed
- Palette-enabled semi-transparent output no longer creates uncontrolled unique RGBA counts.
- Output and Aseprite selection remain visible in the result preview header.
- Desktop 1280x720 layout stays within the viewport height.

### Verification
- JS syntax checks passed.
- Local Edge test page reported `64 / 64 cases passed.`
- Local Edge app flow verified Custom source-size output and `dominant + palette 4 + Aseprite`.

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
- Header-level `미리보기 갱신` button in the result preview panel.
- Clean original/result preview placeholders without empty or fake image sources.
- Preview image `error` handling that restores placeholder state.
- Result summary text.
- Result preview zoom options: `Fit`, `Actual`, `8x`, `16x`.
- UI and validation tests for the new size policy.

### Changed
- Output format selection moved to the result preview header so PNG/JPG/Aseprite remains visible on shorter viewports.
- Desktop layout now uses a fixed viewport-height grid with internal panel scrolling instead of expanding the whole page.
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
- The preview refresh action is no longer easy to miss on shorter desktop viewports; the input panel can scroll and the result header keeps a visible refresh button.

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
