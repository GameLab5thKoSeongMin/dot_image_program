# AGENTS.md

## Project Goal
Build and maintain a local pixel icon generator.

The app converts PNG/JPG/JPEG input images into pixel icons using tile-based representative color sampling. The default behavior must remain `32x32`, `median`, `png`, and palette limit `off`.

The converter must not be simplified into a resize shortcut.

## Repository Layout
- `index.html`: Main HTML entry and four-section app layout.
- `styles/style.css`: Layout, controls, preview, warning banner, checkerboard backgrounds, visible preview refresh actions, and responsive styling.
- `src/constants.js`: Global constants for size axis options, defaults, performance thresholds, modes, formats, palette limits, and Aseprite identifiers.
- `src/fileHandler.js`: File validation, output size validation against source dimensions, performance warning policy, palette option validation, option normalization, and filename handling.
- `src/imageProcessor.js`: Image loading, tile bounds, median/average/center sampling, and transparency handling.
- `src/paletteQuantizer.js`: Palette limit post-processing using median cut quantization.
- `src/exporter.js`: PNG/JPG/Aseprite export helpers.
- `src/uiController.js`: DOM updates, separate width/height controls, custom input visibility, source-size availability, preview placeholders, preview refresh state, zoom, summaries, palette summaries, warning banner, and download state.
- `src/app.js`: App entry point, source image state, size resolution, validation, conversion, palette limiting, performance warning flow, export, and download.
- `tests/test-cases.html`: Manual/browser test runner for conversion, validation, UI policy, palette, placeholder, and export behavior.
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
- Resolve `Original` width/height only after a valid image has loaded.
- Validate output width/height against the original image dimensions, not against a fixed 256 limit.
- Use warning banners for large output sizes instead of blocking valid sizes.
- Apply palette limit as post-processing after tile conversion.
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
- Test separate Width and Height options: `16`, `32`, `64`, `Original`, `Custom`.
- Test that custom width/height inputs are hidden until `Custom` is selected.
- Test that `Original` is disabled before image load and resolves to source dimensions after image load.
- Test presets larger than the source dimension are disabled or clearly blocked.
- Test output size validation against source dimensions.
- Test output sizes above 256 when the source image is large enough.
- Test large output performance warnings and confirm they do not block explicit conversion.
- Confirm `미리보기 갱신` is visible from the result preview header and remains available from the Export controls.
- Confirm the output format selector is visible from the result preview header and includes PNG, JPG, and Aseprite.
- Test `median`, `average`, and `center` sampling modes.
- Test palette modes: `off`, `auto`, numeric, and `custom`.
- Test custom palette validation below 2 and above 256.
- Confirm transparent pixels remain transparent after palette quantization.
- Test PNG, JPG, and `.aseprite` export after palette limiting.
- Confirm warning banner is used instead of browser `alert()`.
- Confirm no broken image icon appears in the default, reset, or failed preview states.
- Confirm downloaded filenames include palette suffix only when palette mode is not `off`.
- Confirm tests and documentation are updated.

## Documentation Rules
Keep `README.md`, `DESIGN_SPEC.md`, `TEST_PLAN.md`, `PLANS.md`, and `CHANGELOG.md` in English.

Keep `USER_GUIDE_KO.md`, `DEVELOPMENT_REPORT_KO.md`, and `TEST_SUMMARY_KO.md` in Korean.

Documentation must be accurate and grounded in implemented and tested behavior.

Do not mark untested behavior as verified.
