# AGENTS.md

## Project Goal
Build a local 32x32 pixel icon generator.

The app converts an input PNG/JPG/JPEG image into a 32x32 pixel icon using tile-based median color sampling.

This must not be implemented as a simple image resize.

## Repository Layout
- `index.html`: Main HTML entry.
- `styles/style.css`: Layout and visual styling.
- `src/constants.js`: Global constants.
- `src/fileHandler.js`: File validation and filename handling.
- `src/imageProcessor.js`: Image loading, tile sampling, median color calculation, transparency handling.
- `src/uiController.js`: DOM updates and UI state.
- `src/app.js`: App entry point and event flow.
- `tests/test-cases.html`: Manual and visual test runner.
- `tests/testImageFactory.js`: Test image generation helpers.
- `README.md`: English technical usage guide.
- `DESIGN_SPEC.md`: English feature and GUI design.
- `TEST_PLAN.md`: English test checklist and result criteria.
- `PLANS.md`: English current execution plan and step status.
- `CHANGELOG.md`: English version history.
- `USER_GUIDE_KO.md`: Korean user guide.
- `DEVELOPMENT_REPORT_KO.md`: Korean user-facing development report.
- `TEST_SUMMARY_KO.md`: Korean user-facing test summary.

## Engineering Rules
- Keep the app dependency-free unless absolutely necessary.
- Prefer Vanilla HTML/CSS/JavaScript.
- Do not use ES Module `import/export` in the initial version.
- The app should run by opening `index.html` directly in a browser when possible.
- Keep functions small and responsibility-focused.
- Do not mix image processing logic with DOM manipulation.
- Do not implement the converter as a simple `drawImage(image, 0, 0, 32, 32)` resize.
- Use tile-based median color sampling.
- Preserve transparent PNG behavior as much as possible.
- Use constants for output size and transparency thresholds.
- Keep Codex-facing documents in English.
- Keep user-facing review documents in Korean.

## Required Verification
Before considering the task complete:
- Test PNG input.
- Test JPG/JPEG input.
- Test transparent PNG input.
- Test drag and drop.
- Test invalid file type.
- Test download.
- Confirm downloaded PNG is exactly 32x32.
- Confirm the algorithm uses tile median sampling, not simple resize.
- Confirm small images do not crash the converter.
- Confirm very large images generate a result.

## Documentation Rules
After each development step, update `PLANS.md`.

After meaningful milestones, update `DEVELOPMENT_REPORT_KO.md` for the user in Korean.

Keep `README.md`, `DESIGN_SPEC.md`, `TEST_PLAN.md`, and `CHANGELOG.md` in English.

Keep `USER_GUIDE_KO.md`, `DEVELOPMENT_REPORT_KO.md`, and `TEST_SUMMARY_KO.md` in Korean.

Documentation should be accurate and grounded in implemented behavior.

Do not mark untested behavior as verified.
