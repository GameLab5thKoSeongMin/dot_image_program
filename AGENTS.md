# AGENTS.md

## Project Goal
Build and maintain a local pixel icon generator.

The app converts PNG/JPG/JPEG input images into pixel icons using tile-based representative color sampling. The default behavior must remain `32x32`, `median`, `png`, and palette limit `off`.

The converter must not be simplified into a resize shortcut.

## Repository Layout
- `index.html`: Main HTML entry and four-section app layout.
- `styles/style.css`: Layout, controls, preview, warning banner, checkerboard backgrounds, visible result-header preview refresh action, and responsive styling.
- `src/constants.js`: Global constants for size presets, defaults, performance thresholds, preprocess ranges, palette/outline modes, formats, alpha behavior, and Aseprite identifiers.
- `src/fileHandler.js`: File validation, output size validation against source dimensions, performance warning policy, palette option validation, option normalization, and filename handling.
- `src/imageProcessor.js`: Image loading, source preprocessing, background cleanup, sharpen, tile bounds, sampling, and transparency handling.
- `src/paletteQuantizer.js`: Palette limit post-processing, fixed palette mapping, result palette analysis, manual RGB replacement/merge helpers, and palette-on alpha normalization.
- `src/iconAssistProcessor.js`: Post-processing outline generation for black and derived dark 1px outlines.
- `src/exporter.js`: PNG/JPG/Aseprite export helpers.
- `src/uiController.js`: DOM updates, size controls, previews, palette source UI, result palette swatches, Palette Editor controls, summaries, warning banner, and download state.
- `src/app.js`: App entry point, source image state, conversion, palette processing, manual palette edit state, final-canvas export, and download.
- `tests/test-cases.html`: Manual/browser test runner for conversion, validation, UI policy, palette sources, Palette Editor, placeholders, and export behavior.
- `tests/testImageFactory.js`: Test image generation helpers.
- `README.md`: English technical usage guide.
- `DESIGN_SPEC.md`: English feature and GUI design.
- `TEST_PLAN.md`: English test checklist and recorded results.
- `PLANS.md`: English execution plan and final status.
- `CHANGELOG.md`: English version history.
- `USER_GUIDE_KO.md`: Korean user guide.
- `DEVELOPMENT_REPORT_KO.md`: Korean user-facing development report.
- `TEST_SUMMARY_KO.md`: Korean user-facing test summary.

## Engineering Rules
- Keep the app dependency-free unless absolutely necessary.
- Prefer Vanilla HTML/CSS/JavaScript.
- Do not use ES Module `import/export`.
- The app should run by opening `index.html` directly in a browser when possible.
- Keep functions small and responsibility-focused.
- Do not mix image processing logic with DOM manipulation.
- Do not implement conversion as a simple `drawImage(image, 0, 0, width, height)` resize.
- Preserve the default 32x32 median PNG palette-off behavior.
- Custom size mode must default to off.
- With Custom size off, show Width/Height preset buttons and hide numeric inputs.
- With Custom size on, hide preset buttons and show numeric Width/Height inputs.
- After a valid image loads, Custom Width and Custom Height inputs default to the source image dimensions.
- Validate output width/height against the original image dimensions, not against a fixed 256 limit.
- Use warning banners for large output sizes instead of blocking valid sizes.
- Avoid repeated heavy automatic conversion for large output sizes; require explicit `미리보기 갱신`.
- Apply palette limit as post-processing after tile conversion.
- Apply manual palette replacement/merge edits to the final canvas used by preview and export.
- Clear manual palette edits when a new conversion runs.
- Apply brightness, contrast, saturation, sharpen, and background cleanup before tile conversion.
- Keep preprocess defaults neutral: `0`, `0`, `0`, `off`, cleanup `off`.
- Apply outline after palette/manual-edit processing and before preview/export.
- Keep outline default `off`.
- Palette `off` must preserve prior alpha behavior.
- Palette `on` must normalize alpha to `0` or `255` by default so unique RGBA output is controlled.
- Preserve transparent PNG behavior for PNG/Aseprite export.
- Composite JPG export over a white background and warn the user when transparency is present.
- Keep Codex-facing documents in English.
- Keep user-facing review documents in Korean.

## Required Verification
Before considering this project complete:
- Test PNG/JPG/JPEG input.
- Test drag and drop.
- Test invalid and corrupted files.
- Test default `32x32`, `median`, `png`, palette `off` output.
- Test separate Width and Height preset options: `16`, `32`, `64`, `128`, `256`.
- Test that Custom size defaults to off.
- Test that custom width/height inputs are hidden while Custom size is off.
- Test that preset buttons are hidden and custom width/height inputs are visible while Custom size is on.
- Test that custom width/height inputs default to source dimensions after a valid image loads.
- Test that presets larger than the source dimension are disabled or clearly blocked.
- Test output size validation against source dimensions.
- Test output sizes above 256 when the source image is large enough.
- Test large output performance warnings and confirm they do not block explicit conversion.
- Confirm `미리보기 갱신` is visible from the result preview header.
- Confirm there is no duplicate lower/input-area `미리보기 갱신` button.
- Confirm the output format selector is visible from the result preview header and includes PNG, JPG, and Aseprite.
- Test `median`, `average`, `center`, and `dominant` sampling modes.
- Test palette modes: `off`, `auto`, numeric, and `custom`.
- Test custom palette validation below 2 and above 256.
- Confirm transparent pixels remain transparent after palette quantization.
- Confirm palette-on output uses binary alpha and unique RGBA count stays controlled.
- Test PNG, JPG, and `.aseprite` export after palette limiting.
- Confirm warning banner is used instead of browser `alert()`.
- Confirm no broken image icon appears in the default, reset, or failed preview states.
- Confirm downloaded filenames include palette suffix only when palette mode is not `off`.
- Confirm result palette swatches show HEX and usage data.
- Test Replace color and Merge color.
- Confirm manual palette edits preserve transparency and update the final export canvas.
- Confirm a new conversion resets manual palette edits.
- Test brightness, contrast, saturation, sharpen, background cleanup, and cleanup tolerance.
- Confirm preprocess defaults are neutral and preserve prior output.
- Test outline `off`, `1px black`, and `1px dark`.
- Confirm outline preserves visible pixels and export uses the outlined final canvas.
- Confirm tests and documentation are updated.

## Documentation Rules
Keep `README.md`, `DESIGN_SPEC.md`, `TEST_PLAN.md`, `PLANS.md`, and `CHANGELOG.md` in English.

Keep `USER_GUIDE_KO.md`, `DEVELOPMENT_REPORT_KO.md`, and `TEST_SUMMARY_KO.md` in Korean.

Documentation must be accurate and grounded in implemented and tested behavior.

Do not mark untested behavior as verified.
