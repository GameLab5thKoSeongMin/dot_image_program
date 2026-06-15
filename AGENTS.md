# AGENTS.md

## Project Goal
Build and maintain a local pixel icon generator.

The app converts PNG/JPG/JPEG input images into small pixel icons using tile-based representative color sampling. The default behavior must remain `32x32`, `median`, and `png`.

The converter must not be simplified into a resize shortcut.

## Repository Layout
- `index.html`: Main HTML entry and four-section app layout.
- `styles/style.css`: Layout, controls, preview, warning banner, and responsive styling.
- `src/constants.js`: Global constants for sizes, modes, formats, thresholds, and Aseprite identifiers.
- `src/fileHandler.js`: File validation, output size validation, option normalization, filename handling.
- `src/imageProcessor.js`: Image loading, tile bounds, median/average/center sampling, transparency handling.
- `src/exporter.js`: PNG/JPG/Aseprite export helpers.
- `src/uiController.js`: DOM updates, option controls, warning banner, preview and download state.
- `src/app.js`: App entry point and event flow.
- `tests/test-cases.html`: Manual and visual test runner for conversion, validation, and export.
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
- Preserve the default 32x32 median PNG behavior.
- Support variable output size through tile sampling.
- Preserve transparent PNG behavior for PNG/Aseprite export.
- Composite JPG export over a white background and warn the user when transparency is present.
- Keep Codex-facing documents in English.
- Keep user-facing review documents in Korean.

## Required Verification
Before considering this project complete:
- Test PNG/JPG/JPEG input.
- Test drag and drop.
- Test invalid and corrupted files.
- Test default 32x32 median PNG output.
- Test preset and custom output sizes.
- Test output size validation against source dimensions and max 256.
- Test `median`, `average`, and `center` sampling modes.
- Test PNG, JPG, and `.aseprite` export.
- Confirm `.aseprite` export is not a renamed PNG.
- Confirm JPG transparency warning and white background compositing.
- Confirm warning banner is used instead of browser `alert()`.
- Confirm downloaded filenames include width, height, sampling mode, and extension.
- Confirm tests and documentation are updated.

## Documentation Rules
Keep `README.md`, `DESIGN_SPEC.md`, `TEST_PLAN.md`, `PLANS.md`, and `CHANGELOG.md` in English.

Keep `USER_GUIDE_KO.md`, `DEVELOPMENT_REPORT_KO.md`, and `TEST_SUMMARY_KO.md` in Korean.

Documentation must be accurate and grounded in implemented and tested behavior.

Do not mark untested behavior as verified.
