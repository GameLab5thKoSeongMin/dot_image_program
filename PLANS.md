# PLANS.md

## 1. Current Objective
Complete the controlled v1.0.0 to v1.3.0 expansion from `program_make10_to_13.txt` while preserving the existing v0.9.0-stable Pixel Icon Generator behavior.

## 2. Current Step
The v1.3 stabilization and product-polish pass completed on 2026-07-11. The local HTTP browser suite reports `110 / 110 cases passed.` with zero console errors; direct `file://` navigation and external Aseprite desktop/CLI compatibility remain unverified in this run.

## 3. Active Command File
- `program_make10_to_13.txt`

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
- Keep dithering default `off`.
- Keep neutral preprocess defaults.
- Keep outline default `off`.
- Keep warning banners and clean preview placeholders.
- Do not add backend, Google login, OpenAI API integration, cloud storage, AI image generation, AI background removal, PSD import, GIF animation editing, indexed-color Aseprite export, standalone batch conversion, ZIP export, multi-frame animation export, per-layer animation, or network URL palette fetching.

## 5. M0 Audit Findings
- The v0.9.0-stable baseline is implemented and documented in `ROADMAP_V06_TO_V09.md`.
- The active command file was created as `program_make10_to_13.txt`.
- `ROADMAP_V10_TO_V13.md` was missing and has been created.
- Required English and Korean documents exist.
- `index.html` is the maintained app entry point and still uses normal script tags with no build system.
- Current conversion is tile-based: `src/imageProcessor.js` reads source pixels, applies optional preprocess, divides the source into output tiles, and samples representative colors.
- The only full-size `drawImage` call copies the source into a same-size canvas for pixel reads; it is not an output resize shortcut.
- `src/app.js` owns the single-image state and assigns `state.resultCanvas` as the final preview/export canvas.
- `state.convertedCanvas` stores the pre-outline editable canvas for Palette Editor replacement/merge.
- `src/paletteQuantizer.js` is the integration point for palette limit, fixed palette mapping, dithering, palette analysis, and exact RGB edits.
- `src/iconAssistProcessor.js` applies outline after palette/manual edits and before preview/export.
- `src/exporter.js` currently exports single-canvas PNG/JPG and one-frame/one-layer RGBA Aseprite files.
- `src/uiController.js` owns DOM updates and should remain the only DOM update layer.
- `tests/test-cases.html` is the existing browser test runner and should be extended rather than replaced.
- `tests/testImageFactory.js` already provides deterministic generated images suitable for v1.2.0 examples and QA.
- Current main-thread processing cost is the primary M1 target. Source image decoding and source `ImageData` extraction may stay on the main thread, while preprocess, tile conversion, palette mapping/dithering, palette analysis, and outline are candidates for worker-compatible data processing.
- Preset state for M2 should be derived from settings only and must exclude file objects, data URLs, canvases, blobs, clipboard data, and local file paths.
- Layered mode for M4 should use separate `layeredState` and leave single-image mode unchanged while disabled.

## 6. Sequential Milestone Plan

### M0. Audit and Startup Documentation
- [x] Read active command file.
- [x] Read required docs and source files.
- [x] Create `program_make10_to_13.txt`.
- [x] Create `ROADMAP_V10_TO_V13.md`.
- [x] Record audit findings in `ROADMAP_V10_TO_V13.md`.
- [x] Record audit findings in `PLANS.md`.
- [x] Record Korean audit summary in `DEVELOPMENT_REPORT_KO.md`.
- [x] Confirm v0.9.0-stable baseline and extension points.

### M1. v1.0.0 Performance Stabilization / Web Worker
- [x] Reread command file and all Markdown documents before coding.
- [x] Add optional worker-backed conversion with main-thread fallback.
- [x] Move safe expensive processing to a serializable worker pipeline.
- [x] Add processing status UI and disable conflicting controls during active processing where needed.
- [x] Add cancel support for active worker requests.
- [x] Add worker/fallback equivalence tests.
- [x] Preserve direct `index.html` behavior through main-thread fallback.
- [x] Document local-server recommendation for full worker behavior.

M1 notes:
- Worker compatibility with `file://` is a known risk and must not break direct opening of `index.html`.
- Cancellation must not allow a stale worker result to overwrite the current valid result.
- Exports must continue to use the final worker-produced or fallback-produced canvas.
- Browser execution was attempted with local HTTP serving, but both Edge and Chrome failed before page execution because the local headless GPU process could not initialize. This is recorded in `TEST_PLAN.md` and `CHANGELOG.md`.

### M2. v1.1.0 Settings Preset Save / Load
- [x] Reread command file and all Markdown documents before coding.
- [x] Add settings-only preset schema.
- [x] Add localStorage save/load/delete/reset.
- [x] Add preset JSON export/import.
- [x] Validate stale or partial presets safely.
- [x] Add tests and docs.

M2 notes:
- `src/presetManager.js` owns schema sanitization, built-in recommended templates, `localStorage`, JSON export, and JSON import.
- Presets serialize settings only and exclude file objects, uploaded image data, data URLs, canvases, blobs, generated output, clipboard data, and local paths.
- Loading a preset applies existing UI controls and then uses the normal option-change validation/conversion path, so source-dimension validation still applies.
- Added tests cover storage, load/delete, JSON export/import, invalid JSON, stale normalization, data exclusion, and UI restore.
- Browser execution remains blocked by the local headless GPU process initialization failure. Syntax, inline parser, static, and Node VM preset checks passed.

### M3. v1.2.0 Example Gallery / QA Set
- [x] Reread command file and all Markdown documents before coding.
- [x] Add generated/repository-owned examples.
- [x] Add apply-settings flow and deterministic QA checks.
- [x] Keep `index.html` as the main entry point.
- [x] Add tests and docs.

M3 notes:
- `src/exampleGallery.js` defines generated example canvases, settings recipes, preview data URLs, and deterministic QA conversion checks.
- The main UI includes a collapsed Examples / QA section with generated thumbnails and a QA button.
- Selecting an example clears the previous source, applies the example settings through the preset sanitizer, loads the generated source, and uses the normal conversion path.
- Examples do not fetch network images or reference external files.
- Added test-page coverage for generated example metadata, QA conversion, and example UI rendering.
- Browser execution remains blocked by the local headless GPU process initialization failure. Syntax, inline parser, and static checks passed.

### M4. v1.3.0 Layered PNG Input / Layered Aseprite Export
- [x] Reread command file and all Markdown documents before coding.
- [x] Add Layered Mode state and UI default off.
- [x] Add multiple image layer input, rename, reorder, visibility, and delete.
- [x] Process each layer independently using global settings.
- [x] Add visible-layer composite preview and flattened PNG/JPG export.
- [x] Extend Aseprite export for visible processed layers.
- [x] Add tests and docs.

M4 notes:
- `state.layered` stores Layered Mode state separately from single-image state.
- Layered Mode defaults off and keeps the single-image path active while off.
- Multiple local image files can be added as layers; layer names are derived from file names and can be renamed.
- Layers can be reordered, hidden/shown, and deleted.
- Each layer is processed independently with shared global settings, then visible processed layers are composited at top-left.
- PNG/JPG export uses the flattened visible-layer composite.
- Aseprite export uses visible processed layers as separate RGBA layer/cel records and omits hidden layers.
- Added tests cover UI default/actions, composite order/visibility, and layered Aseprite binary layer/cel counts and names.
- Browser execution remains blocked by the local headless GPU process initialization failure. Syntax, inline parser, and static checks passed.

### M5. Final Stabilization
- [x] Reread command file and all Markdown documents.
- [x] Run all available tests and document browser execution blocker.
- [x] Verify default behavior and single-image mode by static/default review and parser checks.
- [x] Verify worker fallback, presets, examples, layered mode, and exports through syntax, parser, VM, static, and test-page coverage.
- [x] Verify no ES Modules, no `alert()`, and no resize shortcut.
- [x] Update all English and Korean documents with final results.

M5 notes:
- Syntax checks passed for every app JS file and `tests/testImageFactory.js`.
- `tests/test-cases.html` inline script parsed successfully.
- Preset manager VM checks passed for save/load/delete/import/export/sanitization and exclusion of image/path fields.
- Static checks found no ES Module syntax, no browser `alert()`, and no fixed `32x32` resize shortcut.
- Full browser assertion execution remains blocked because headless Edge/Chrome exit before page execution with GPU process initialization failures.

## 6A. Completed Previous Scope

The v0.6.0-to-v0.9.0 expansion from `program_make6_to_9.txt` is complete and remains the preservation baseline for this task. The historical notes below are retained for context.

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

## 10. 2026-07-11 Stabilization and Product Polish
- [x] Preserve `32x32`, `median`, PNG, palette `off`, Custom size `off`, neutral preprocess, and outline `off` defaults.
- [x] Resolve the Worker URL relative to `workerClient.js` instead of the containing page.
- [x] Share ImageData tile conversion between Worker and main-thread paths.
- [x] Verify Worker success, forced fallback, cancellation, and output equivalence.
- [x] Add real app PNG/JPG/JPEG, drag-and-drop, invalid-file, and corrupted-image integration cases.
- [x] Apply Korean-first UI terminology without changing internal option values.
- [x] Remove the nested drop-zone button structure and provide explicit control labels and focus styling.
- [x] Verify 1280x720 four-panel and approximately 390x844 single-column layouts without page-level overflow.
- [x] Verify generated-example conversion and PNG/JPG/Aseprite output filenames and enabled download state.
- [x] Run all app JS syntax checks, the test-page inline parser check, static policy searches, and `git diff --check`.
- [x] Record `110 / 110 cases passed.` and zero browser console errors.

Remaining manual items:
- Direct `file://` navigation was blocked by the browser-control security policy and was not rerun.
- Aseprite desktop/CLI was unavailable, so external open/save compatibility remains pending.
