# Roadmap v1.0.0 to v1.3.0

## Baseline Summary

M0 audit confirms the project is at the documented v0.9.0-stable baseline from `program_make6_to_9.txt` and `ROADMAP_V06_TO_V09.md`.

Preserved baseline features include PNG/JPG/JPEG input, drag and drop, default `32x32` / `median` / `png` / palette `off`, Custom size default off, width and height presets `16`, `32`, `64`, `128`, `256`, source-dimension output validation, large-output warning banners, result-header preview refresh and format selector, `median` / `average` / `center` / `dominant` sampling, palette modes, generated/built-in/imported palette sources, dithering, Palette Editor replace/merge, preprocess controls, Icon Assist outline, PNG/JPG/Aseprite export, warning banners, clean preview placeholders, and generated browser tests.

The current conversion pipeline remains tile-based and is not a resize shortcut. The only full-size `drawImage` use copies the source image into a same-size canvas for `ImageData` extraction before tile sampling.

Current implementation constraints found during audit:
- Processing is synchronous on the main thread in `src/app.js`, `src/imageProcessor.js`, `src/paletteQuantizer.js`, and `src/iconAssistProcessor.js`.
- `state.resultCanvas` is the single-image final preview/export source after palette mapping, manual edits, and outline.
- `state.convertedCanvas` stores the editable pre-outline canvas for Palette Editor edits.
- `src/exporter.js` currently writes one Aseprite frame with one layer chunk and one raw RGBA cel chunk.
- `tests/testImageFactory.js` already provides deterministic generated canvases that can be expanded into v1.2.0 examples.
- Existing docs are accurate for v0.9.0 but need v1.0-v1.3 updates as each milestone completes.

## Active Command File

- `program_make10_to_13.txt`

## v1.0.0 Goals and Checklist

- [x] Add optional worker-backed conversion path.
- [x] Preserve main-thread fallback for direct `index.html` usage.
- [x] Add processing status UI.
- [x] Add cancel support for active worker requests.
- [x] Add worker and fallback equivalence tests for controlled images.
- [x] Preserve PNG/JPG/Aseprite export consistency through the final canvas.

## v1.1.0 Goals and Checklist

- [x] Add local settings presets with `localStorage`.
- [x] Save, load, delete, reset, export, and import presets.
- [x] Validate stale or invalid preset data safely.
- [x] Ensure presets store settings only, not image data.
- [x] Preserve default behavior.

## v1.2.0 Goals and Checklist

- [x] Add generated example gallery or QA set.
- [x] Use only generated or repository-owned images.
- [x] Add apply-settings flow for examples.
- [x] Add deterministic QA checks without network access.
- [x] Keep `index.html` as the main entry point.

## v1.3.0 Goals and Checklist

- [x] Add Layered Mode defaulting to off.
- [x] Add multiple image layers with rename, reorder, visibility, and delete.
- [x] Process each layer independently using global settings.
- [x] Composite visible processed layers for preview and flattened PNG/JPG export.
- [x] Extend Aseprite export for visible processed layers.
- [x] Preserve single-image behavior when Layered Mode is off.

## Per-Milestone Status

- M0 Audit and Startup Documentation: complete.
- M1 v1.0.0 Performance Stabilization / Web Worker: implementation complete; browser execution blocked by local headless GPU failure.
- M2 v1.1.0 Settings Preset Save / Load: implementation complete; browser execution blocked by local headless GPU failure.
- M3 v1.2.0 Example Gallery / QA Set: implementation complete; browser execution blocked by local headless GPU failure.
- M4 v1.3.0 Layered PNG Input / Layered Aseprite Export: implementation complete; browser execution blocked by local headless GPU failure.
- M5 Final Stabilization: complete with available non-browser verification; browser execution blocked by local headless GPU failure.

## Per-Milestone Test Status

- M0: startup static checks passed. `node --check` passed for all current app JS files and `tests/testImageFactory.js`. Static search found no ES Module `import/export`, no browser `alert()`, and no resize shortcut conversion.
- M1: JS syntax checks passed; test page inline script parsed; static checks passed. Headless Edge/Chrome execution was attempted but blocked before page execution by GPU process initialization failures.
- M2: JS syntax checks passed; test page inline script parsed; preset manager VM checks passed; static checks passed. Browser execution remains blocked before page execution by GPU process initialization failures.
- M3: JS syntax checks passed; test page inline script parsed; static checks passed. Browser execution remains blocked before page execution by GPU process initialization failures.
- M4: JS syntax checks passed; test page inline script parsed; static checks passed. Browser execution remains blocked before page execution by GPU process initialization failures.
- M5: all app JS syntax checks passed; test page inline script parsed; preset VM checks passed; static checks passed. Browser execution remains blocked before page execution by GPU process initialization failures.

## Per-Milestone Known Risks

- M0: v0.9.0 docs are complete but still describe the previous task as final; v1.0-v1.3 docs must be layered on without deleting verified history.
- M1: Web Workers can fail under some `file://` browser contexts, so fallback must remain stable and documented. Worker code must avoid DOM-only APIs.
- M2: stale presets must not crash, must not store image data, and must not bypass source-dimension validation.
- M3: examples must remain deterministic, repository-owned, and separate from external/network assets.
- M4: layered Aseprite export must preserve existing single-canvas export behavior and must not turn layered input into batch conversion or ZIP export.
- M5: final verification must cover all preserved v0.9.0 behavior and new v1.0-v1.3 behavior.

## M0 Audit Findings

- Active command file created as `program_make10_to_13.txt` from the attached instruction.
- `ROADMAP_V10_TO_V13.md` was missing and has been created.
- Required English and Korean documents exist.
- `index.html` remains the maintained app entry point and uses normal script tags.
- Current UI grouping is Output Size, Pixel Processing, Preprocess, Palette source/limit, Icon Assist, Palette Editor, and Export metadata/download. Future milestones should add Presets, Examples / QA, and Layered Mode without replacing the four-panel layout.
- Worker migration should start from a serializable `ImageData` pipeline: source `ImageData` extraction can remain on the main thread, while preprocess, tile sampling, palette mapping/dithering, palette analysis, and outline can move to a worker-compatible path.
- Preset serialization should be built from `ui.getSelectedOptions()` / `getNormalizedOptions()` and should exclude `state.currentFile`, `state.sourceImage`, `state.sourceDataURL`, canvases, blobs, and local paths.
- Example gallery can reuse and extend `tests/testImageFactory.js`.
- Layered mode should add separate state rather than mixing layer arrays into the existing single-image state path.

## Next Milestone Plan

M5 final stabilization will rerun available syntax, parser, static, and local non-browser checks; update final documentation; and record that full browser assertion execution remains blocked in this environment unless the headless GPU issue is resolved.

## Final Stabilization Checklist

- [x] Reread active command file and all Markdown documents.
- [x] Run all available tests.
- [x] Verify default `32x32`, `median`, `png`, palette `off`, dithering `off`, neutral preprocess, outline `off` by static/default configuration review and parser checks.
- [x] Verify worker fallback coverage exists in the test page and `WorkerClient({ forceFallback: true })` path.
- [x] Verify preset persistence and JSON import/export through Node VM checks and test-page coverage.
- [x] Verify generated examples and QA set coverage in the test page.
- [x] Verify layered mode and layered Aseprite export coverage in the test page.
- [x] Verify no ES Module `import/export`.
- [x] Verify no browser `alert()`.
- [x] Verify no simple resize shortcut conversion.
- [x] Update English technical documents.
- [x] Update Korean user-facing documents.
- [x] Record final summary and known limitations.

M5 note: full browser assertion execution could not be completed in this environment because headless Edge/Chrome exited before page execution with GPU process initialization failures. The test page has been extended for v1.0-v1.3 behavior and its inline script parses successfully.
