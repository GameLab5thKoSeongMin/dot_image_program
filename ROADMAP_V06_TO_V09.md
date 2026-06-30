# ROADMAP_V06_TO_V09.md

## 1. Current Baseline Summary
The project is an existing dependency-free Vanilla HTML/CSS/JavaScript pixel icon generator. The current v0.5.0 baseline supports PNG/JPG/JPEG input, drag and drop, Custom size toggle, Width/Height presets `16`, `32`, `64`, `128`, `256`, source-dimension output validation, large-output warning banners, result-header preview refresh, output format selection with PNG/JPG/Aseprite, sampling modes `median`, `average`, `center`, `dominant`, palette limit modes, median-cut quantization, palette-on alpha normalization, PNG/JPG/Aseprite export, clean preview placeholders, result summary, palette summary, and browser tests.

Default behavior must remain `32x32`, `median`, `png`, and palette `off`.

## 2. Active Command File
- Active command file: `program_make6_to_9.txt`
- Status: Read during M0 audit and reread at M1, M2, M3, M4, and M5 preparation.

## 3. M0 Audit Findings
- `ROADMAP_V06_TO_V09.md` did not exist and was created for this task.
- Required docs existed except this roadmap.
- The command file and docs refer to `index.html`; it was missing at audit time and has been restored from the current app HTML with valid Korean UI text and normal script tags.
- `Dotprogram.html` was the older tracked entry file during M0. It was removed by final stabilization, leaving `index.html` as the maintained entry point.
- The current conversion pipeline is tile-based and not a resize shortcut.
- Palette post-processing is centralized in `src/paletteQuantizer.js`, making it the safest integration point for dithering and fixed-palette mapping.
- Export uses `state.resultCanvas` through `src/exporter.js`; all new processing must feed the final canvas into that state.
- UI state is currently coordinated through `src/app.js` and `src/uiController.js`.
- Tests are currently concentrated in `tests/test-cases.html` with generated canvases in `tests/testImageFactory.js`.
- Korean document files render correctly in the browser/app context, but PowerShell output can show mojibake. File content language policy remains Korean for user-facing documents.

## 4. v0.6.0 Goals and Checklist
Goal: Add palette-dependent dithering without changing defaults.

- [x] Add Dithering option: `off`, `floydSteinberg`, `bayer4x4`.
- [x] Keep dithering default `off`.
- [x] Apply dithering only when palette mapping is active.
- [x] Preserve transparent pixels.
- [x] Keep palette alpha normalization behavior.
- [x] Ensure PNG/JPG/Aseprite export uses dithered final canvas.
- [x] Add tests for off, Floyd-Steinberg, Bayer 4x4, transparency, export consistency, and default behavior.
- [x] Update docs and changelog.

Implementation notes:
- Dithering is implemented in `src/paletteQuantizer.js` as a palette-mapping option.
- `floydSteinberg` uses RGB error diffusion on visible pixels only and does not diffuse into transparent pixels.
- `bayer4x4` uses a deterministic 4x4 Bayer matrix before nearest-palette mapping.
- Dithering strength is fixed at `1`; no strength UI was added in v0.6.0.
- If palette mode is `off`, dithering is skipped and the app shows a warning banner when selected.

## 5. v0.7.0 Goals and Checklist
Goal: Add palette source selection and fixed palette mapping.

- [x] Add Palette Source option: `generated`, `builtIn`, `imported`.
- [x] Keep generated source as current median-cut behavior.
- [x] Add safe built-in palettes.
- [x] Add HEX textarea import.
- [x] Add `.txt` / `.hex` file import.
- [x] Validate imported HEX palettes with 2 to 256 unique colors.
- [x] Map visible pixels to nearest fixed palette color.
- [x] Preserve transparency and palette alpha normalization.
- [x] Add tests for generated, built-in, imported, invalid input, duplicate removal, transparency, and export consistency.
- [x] Update docs and changelog.

Implementation notes:
- `generated` remains the default and uses the existing median-cut palette limit.
- `builtIn` provides generic `grayscale4`, `gameboyLike4`, `picoLike16`, `warm8`, and `cool8` palettes.
- `imported` accepts pasted HEX lists and local `.txt` / `.hex` text files.
- Fixed palettes map visible pixels to the nearest RGB entry, preserve transparent pixels, and keep palette-on binary alpha normalization.

## 6. v0.8.0 Goals and Checklist
Goal: Add result palette swatch and simple manual color cleanup.

- [x] Show result palette swatches.
- [x] Show HEX values.
- [x] Show usage counts and percentages.
- [x] Show visible and transparent pixel counts.
- [x] Add Copy HEX action.
- [x] Add Replace color action.
- [x] Add Merge color action.
- [x] Ensure manual edits update preview and export canvas.
- [x] Clearly reset manual edits after new conversion/settings changes.
- [x] Add tests for swatch, replace, merge, transparency, reset behavior, and export consistency.
- [x] Update docs and changelog.

Implementation notes:
- Result palette analysis ignores transparent pixels and sorts visible swatches by usage.
- Replace and Merge use exact visible RGB matching and preserve each pixel's current alpha.
- Edited output replaces `state.resultCanvas`; `state.convertedCanvas` retains the unedited conversion reference.
- Palette Editor actions are disabled until a result palette exists.
- The Palette Editor is collapsed by default to preserve the four-panel layout.

## 7. v0.9.0 Goals and Checklist
Goal: Add lightweight preprocessing and icon assist without becoming a full editor.

- [x] Add brightness control.
- [x] Add contrast control.
- [x] Add saturation control.
- [x] Add sharpen control: `off`, `low`, `medium`.
- [x] Add background cleanup by color.
- [x] Add cleanup tolerance.
- [x] Add outline options: `off`, `1px black`, `1px dark`.
- [x] Apply preprocessing before tile conversion.
- [x] Apply outline after conversion/palette/editor processing and before preview/export.
- [x] Add tests for preprocessing, cleanup, outline, export consistency, and default behavior.
- [x] Update docs and changelog.

Implementation notes:
- Preprocess and Icon Assist sections are collapsed by default.
- Background cleanup runs before adjustments and preserves original transparent pixels.
- Brightness/contrast/saturation process visible RGB only and preserve alpha.
- Sharpen uses `off`, `low`, and `medium` blended cross-neighbor convolution.
- Black outline uses `#000000`; dark outline derives one RGB color at 35% of the visible average.
- Outline fills transparent 8-neighbors only and does not overwrite visible pixels.
- Manual palette edits are applied to the pre-outline canvas, then outline is regenerated for the final canvas.

## 8. Per-Milestone Status
- M0 Audit and Startup Documentation: Complete
- M1 v0.6.0 Dithering: Complete
- M2 v0.7.0 Palette Source: Complete
- M3 v0.8.0 Palette Swatch / Editor: Complete
- M4 v0.9.0 Preprocess / Icon Assist: Complete
- M5 Final Stabilization: Complete

## 9. Per-Milestone Test Status
- M0: Baseline syntax/search checks passed. Local Edge reported `64 / 64 cases passed.` and loaded `index.html` with default `32x32 / median / palette off / PNG`.
- v0.6.0: Syntax checks passed. Local Edge headless reported `70 / 70 cases passed.` for `tests/test-cases.html?autorun=1`. `index.html` loaded with the Dithering selector and default `32x32 / median / palette off / PNG` summary. Static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` shortcut.
- v0.7.0: Syntax and static checks passed. Local Edge headless reported `78 / 78 cases passed.` for `tests/test-cases.html?autorun=1`, covering generated, built-in, and imported palette sources, validation, transparency, dithering, and export consistency.
- v0.8.0: Syntax and static checks passed. Local Edge headless reported `84 / 84 cases passed.` and loaded `index.html` with the Palette Editor present and edit actions disabled before conversion.
- v0.9.0: Syntax and static checks passed. Local Edge headless reported `94 / 94 cases passed.` and loaded `index.html` with neutral preprocess defaults and collapsed Preprocess/Icon Assist sections.
- Final: All app JS syntax checks passed. The final local-browser run of `tests/test-cases.html?autorun=1` reported `94 / 94 cases passed.` with zero failures.
- Final app flow: A generated 64x64 PNG was passed through the real `PixelIconApp.handleFile` path. The app produced a visible 32x32 result, `sample_32x32_median.png`, an enabled download action, non-empty PNG/JPG blobs, and a 32-bit RGBA Aseprite buffer with the expected dimensions and magic values.

## 10. Final Risk and Limitation List
- `index.html` is the sole maintained HTML entry point. The obsolete tracked `Dotprogram.html` duplicate was removed during the v0.6.0-to-v0.9.0 work.
- v0.6.0: Complete with fixed strength. Floyd-Steinberg can be slow on very large outputs; existing large-output warnings remain the mitigation.
- v0.7.0: Imported palette parsing intentionally remains local; URL fetch and `.gpl` parsing are not included.
- v0.8.0: Clipboard writes can still be blocked by browser permission policy; the selected HEX remains visible for manual copying.
- v0.9.0: Main-thread processing cost increases when sharpen and large outputs are combined; existing explicit-refresh warnings remain the mitigation.
- Background cleanup is RGB-distance based, not AI segmentation.
- Outline is limited to one 8-neighbor pixel layer.
- Aseprite output is RGBA rather than indexed color.
- The `.aseprite` binary structure is browser-tested, but external opening/saving with the Aseprite desktop app or CLI remains pending.

## 11. Final Stabilization Checklist
- [x] Active command file exists.
- [x] `index.html` entry point exists.
- [x] Active command file and all Markdown files were reread for M5.
- [x] Default `32x32`, `median`, `png`, palette `off` remains intact.
- [x] Custom size behavior remains intact.
- [x] `dominant` sampling remains intact.
- [x] Palette alpha normalization remains intact.
- [x] PNG/JPG/Aseprite export uses the final canvas.
- [x] Dithering, palette source, palette editor, preprocessing, cleanup, and outline are covered by tests.
- [x] All app JS syntax checks pass.
- [x] No ES Module `import/export`.
- [x] No browser `alert()`.
- [x] No simple resize shortcut conversion.
- [x] Final browser test result is `94 / 94 cases passed.`.
- [x] Actual app file processing and default export flow were verified.
- [x] English docs are synchronized through M5.
- [x] Korean docs are synchronized through M5.
- [x] Known limitations and pending external Aseprite validation are documented.

## 12. Remaining Future Extensions
No future extension was started during M5. Candidates requiring a separately approved scope are:
- Aseprite desktop/CLI compatibility validation
- Web Worker processing for large images
- Dithering strength control
- Palette edit undo/redo
- Edge-aware or AI-assisted background removal
- Indexed-color Aseprite export
- Batch conversion, ZIP export, backend/cloud integration, authentication, animation/GIF editing, or layered input

The v0.6.0-to-v0.9.0 expansion is complete. Stop after M5.
