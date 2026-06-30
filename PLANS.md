# PLANS.md

## 1. Current Objective
The controlled v0.6.0 to v0.9.0 expansion from `program_make6_to_9.txt` is complete with the existing Pixel Icon Generator behavior preserved.

## 2. Current Step
M5 Final Stabilization is complete. No later milestone or new feature is active.

## 3. Active Command File
- `program_make6_to_9.txt`

## 4. Baseline Preservation Requirements
- Default output width: `32`
- Default output height: `32`
- Default sampling mode: `median`
- Default output format: `png`
- Default palette mode: `off`
- Keep tile-based representative sampling.
- Keep PNG/JPG/Aseprite export.
- Keep Custom size behavior.
- Keep `dominant` sampling.
- Keep palette alpha normalization.
- Keep warning banners and clean preview placeholders.
- Do not add Web Worker, batch conversion, ZIP export, backend, cloud login, OpenAI API integration, animation/GIF editing, or Aseprite indexed-color export in this task.

## 5. M0 Audit Findings
- The v0.5.0 baseline is implemented in the source files and tests.
- `ROADMAP_V06_TO_V09.md` was missing and has been created.
- The active command file exists as `program_make6_to_9.txt`.
- Required English and Korean documents exist.
- The repository had `Dotprogram.html` as the tracked app entry file during M0, while the command file and documentation referred to `index.html`.
- `index.html` was missing at audit time. It has been restored from the current app HTML and cleaned up with valid Korean UI text.
- M5 removed the obsolete `Dotprogram.html` duplicate; `index.html` is the maintained entry point.
- `src/paletteQuantizer.js` is the best integration point for v0.6.0 dithering and v0.7.0 fixed palette mapping.
- `src/app.js` owns final result state through `state.resultCanvas`; every new feature must feed into this final canvas.
- `src/uiController.js` owns DOM state and should remain the only DOM update layer.
- `tests/test-cases.html` is the existing browser test runner and should be extended rather than replaced.

## 6. Sequential Milestone Plan

### M0. Audit and Startup Documentation
- [x] Read active command file.
- [x] Read required docs and source files.
- [x] Create `ROADMAP_V06_TO_V09.md`.
- [x] Record audit findings in `ROADMAP_V06_TO_V09.md`.
- [x] Record audit findings in `PLANS.md`.
- [x] Record Korean audit summary in `DEVELOPMENT_REPORT_KO.md`.
- [x] Restore or document the app entry point mismatch.

### M1. v0.6.0 Dithering
- [x] Reread command file and docs before coding.
- [x] Add dithering options.
- [x] Add Floyd-Steinberg mapping.
- [x] Add Bayer 4x4 mapping.
- [x] Preserve transparency.
- [x] Keep default dithering off.
- [x] Update tests and docs.

M1 notes:
- Dithering is available as `off`, `floydSteinberg`, and `bayer4x4`.
- Default remains `off`; default output remains `32x32`, `median`, `png`, palette `off`.
- Dithering runs only when palette mapping is active. If palette mode is `off`, the app skips dithering and shows a warning banner.
- Dithering strength is fixed at `1` in v0.6.0 to avoid adding more UI complexity.

### M2. v0.7.0 Palette Source
- [x] Reread command file and docs before coding.
- [x] Add generated/built-in/imported palette source.
- [x] Add safe built-in palettes.
- [x] Add local HEX import.
- [x] Add fixed palette mapping.
- [x] Add tests.
- [x] Run browser tests.
- [x] Update milestone docs and changelog after tests pass.

M2 notes:
- Palette source defaults to `generated`.
- Built-in and imported sources perform fixed nearest-color mapping even when generated palette limit is `off`.
- Imported palette text supports 3-digit and 6-digit HEX values, duplicate removal, and local `.txt` / `.hex` file loading.
- Local Edge headless reported `78 / 78 cases passed.`

### M3. v0.8.0 Palette Swatch / Editor
- [x] Reread command file and docs before coding.
- [x] Add result palette swatches.
- [x] Add copy HEX.
- [x] Add replace color.
- [x] Add merge color.
- [x] Ensure edited canvas exports.
- [x] Update tests and docs.

M3 notes:
- The collapsed Palette Editor shows HEX, visible usage count, percentage, visible pixel total, and transparent pixel count.
- Replace and Merge preserve current pixel alpha and skip transparent pixels.
- Manual edits replace `state.resultCanvas`, so PNG/JPG/Aseprite export uses the edited result.
- Every new conversion clears manual edit state; the reset policy is visible in the editor.
- Local Edge headless reported `84 / 84 cases passed.`

### M4. v0.9.0 Preprocess / Icon Assist
- [x] Reread command file and docs before coding.
- [x] Add brightness, contrast, saturation, and sharpen.
- [x] Add background cleanup by color and tolerance.
- [x] Add outline options.
- [x] Ensure processed canvas exports.
- [x] Update tests and docs.

M4 notes:
- Preprocess defaults are brightness `0`, contrast `0`, saturation `0`, sharpen `off`, and background cleanup `off`.
- Background cleanup runs before adjustments and uses Euclidean RGB distance with tolerance `0` to `255`.
- Sharpen uses a small cross-neighbor convolution blended at `low` or `medium` strength.
- Outline modes are `off`, `black`, and `dark`; dark derives one darker RGB from visible content.
- Manual palette edits update the pre-outline canvas and regenerate outline before preview/export.
- Local Edge headless reported `94 / 94 cases passed.`

### M5. Final Stabilization
- [x] Reread command file and docs.
- [x] Run all tests.
- [x] Verify default behavior.
- [x] Verify final canvas export consistency.
- [x] Verify no ES Modules, no `alert()`, no resize shortcut.
- [x] Update all docs with actual verified status.

## 7. Current Risks
- `index.html` is the maintained entry point; the obsolete tracked `Dotprogram.html` duplicate is removed.
- Floyd-Steinberg, sharpen, preprocessing, and outline can increase main-thread cost for large output sizes; warning and explicit-refresh policies remain necessary.
- Clipboard writes may be blocked by browser permission policy.
- Aseprite output is RGBA and has not been externally opened with the Aseprite desktop app or CLI in this environment.
- Background cleanup is RGB-distance based, and outline is limited to one 8-neighbor pixel layer.

## 8. Verification Log
- M0 audit is complete enough to identify insertion points.
- Baseline syntax/search checks passed after restoring `index.html`.
- Local Edge opened `tests/test-cases.html?autorun=1` and reported `64 / 64 cases passed.`
- Local Edge opened `index.html` and verified default `32x32 / median / palette off / PNG`, Custom size control, result-header refresh, output format selector, and sampling options.
- M1 syntax checks passed for `constants.js`, `fileHandler.js`, `paletteQuantizer.js`, `uiController.js`, and `app.js`.
- M1 Local Edge headless opened `tests/test-cases.html?autorun=1` and reported `70 / 70 cases passed.`
- M1 Local Edge headless opened `index.html` and verified the Dithering selector plus the default `32x32 / median / palette off / PNG` summary.
- M1 static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` shortcut.
- M2 syntax checks passed for `constants.js`, `fileHandler.js`, `paletteQuantizer.js`, `uiController.js`, and `app.js`.
- M2 static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` shortcut.
- M2 Local Edge headless opened `tests/test-cases.html?autorun=1` and reported `78 / 78 cases passed.`
- M2 verified generated, built-in, and imported palette sources, imported HEX validation and duplicate removal, fixed-palette transparency, dithering with a fixed palette, and PNG/JPG/Aseprite export consistency.
- M3 syntax checks passed for all app JS files.
- M3 Local Edge headless opened `tests/test-cases.html?autorun=1` and reported `84 / 84 cases passed.`
- M3 verified swatch extraction, HEX/count/percentage display data, editor reset UI, replace, merge, transparency preservation, and edited PNG/JPG/Aseprite export.
- M3 Local Edge loaded `index.html` with the default `32x32 / median / palette off / PNG` summary, collapsed Palette Editor, disabled edit actions before conversion, result-header refresh, and PNG/JPG/Aseprite selector.
- M4 syntax checks passed for all app JS files, including `iconAssistProcessor.js`.
- M4 Local Edge headless opened `tests/test-cases.html?autorun=1` and reported `94 / 94 cases passed.`
- M4 verified neutral preprocess regression, brightness, contrast, saturation, sharpen, cleanup tolerance, black/dark outline, visible-pixel preservation, and processed PNG/JPG/Aseprite export.
- M4 Local Edge loaded `index.html` with neutral preprocess defaults, collapsed Preprocess/Icon Assist sections, outline options, default result summary, result-header refresh, and PNG/JPG/Aseprite selector.
- M5 reread the active command and all Markdown documents before final verification.
- M5 syntax checks passed for every app JS file.
- M5 static checks found no ES Module syntax, no browser `alert()`, no framework/build system, and no output resize shortcut. The only full-size `drawImage` call copies the source into a same-size preprocessing canvas before tile sampling.
- M5 local-browser test page reported `94 / 94 cases passed.` with zero failures.
- M5 loaded `index.html` without console errors and verified placeholders, visible presets, Custom size off, complete sampling/palette/dithering controls, neutral Preprocess, Icon Assist off, and the result-header output selector.
- M5 passed a generated 64x64 PNG through the real app file-processing path and produced `sample_32x32_median.png`, a visible 32x32 result, and non-empty PNG/JPG plus valid 32-bit RGBA Aseprite output.
- M5 verified through the test suite that dithering, built-in/imported palette mapping, Replace/Merge, preprocessing, cleanup, and black/dark outline all affect the final canvas used by export.

## 9. Final Self-Evaluation
- Requirement satisfaction: Complete for the approved v0.6.0-to-v0.9.0 scope and M5 stabilization criteria.
- Default preservation: Verified as `32x32`, `median`, `png`, palette `off`, dithering `off`, neutral preprocess, and outline `off`.
- Test result: `94 / 94 cases passed.` with zero browser-test failures.
- Export consistency: Verified for dithered, fixed-palette, manually edited, preprocessed, cleanup, and outlined final canvases across PNG/JPG/Aseprite test paths.
- Document synchronization: English and Korean project documents were reviewed and synchronized to the final code and test state.
- Remaining limitations: Main-thread cost for large processing, fixed dithering strength, local-only palette import, no palette undo/redo, RGB-distance cleanup, 1px outline, RGBA Aseprite, and pending Aseprite desktop/CLI validation.
- Recommended next direction: First perform external Aseprite desktop/CLI compatibility validation. If a new development scope is later approved, prioritize Web Worker performance isolation before adding broader product features.

M5 is complete. No v1.0 or new feature work was started.
