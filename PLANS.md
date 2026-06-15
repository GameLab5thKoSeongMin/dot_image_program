# PLANS.md

## 1. Current Objective
Refine the pixel icon generator GUI and output-size policy while preserving conversion, palette, and export behavior.

## 2. Current Step
UI/size policy update U7 is complete: audit, implementation, tests, browser verification, and documentation updates are complete.

## 3. UI and Size Policy Checklist
- [x] U0. Audit current implementation
- [x] U1. Update size policy
- [x] U2. Simplify size controls
- [x] U3. Fix preview placeholder / broken image icon behavior
- [x] U4. Improve option panel UX
- [x] U5. Connect and validate
- [x] U6. Expand tests
- [x] U7. Final cleanup and documentation

## 4. Audit Findings
- The previous UI used combined size presets (`16x16`, `24x24`, `32x32`, `48x48`, `64x64`) plus always-visible custom width/height inputs.
- `src/fileHandler.js` enforced a fixed `MAX_OUTPUT_DIMENSION` of 256.
- `src/uiController.js` already owned preview image state, warning banner state, metadata, palette summary, and option controls.
- `src/app.js` already centralized option reading, validation, conversion, palette post-processing, filename creation, and download state.
- Original and result preview images were intended to start hidden, but explicit `onerror` handling and a stricter no-empty-src policy were missing.
- Palette limiting was already correctly placed after tile conversion and before preview/export.

## 5. Decisions
- Keep Vanilla HTML/CSS/JavaScript and normal script tags.
- Replace combined size presets with independent Width and Height button groups.
- Keep default Width `32` and Height `32`.
- Remove `MAX_OUTPUT_DIMENSION` from hard validation.
- Allow valid output sizes up to source image dimensions.
- Disable `Original` before image load.
- Disable numeric size buttons that exceed the loaded source dimension.
- Keep custom inputs hidden until their axis is set to `Custom`.
- Use performance warnings for large output sizes instead of hard blocking.
- Defer automatic reconversion for large output sizes and require `미리보기 갱신`.
- Keep palette and export behavior unchanged.
- Add result summary and result zoom controls because they fit the existing preview flow without a layout rewrite.

## 6. Risks
- Very large output sizes still run on the main browser thread after explicit conversion.
- The app warns and defers repeated auto-conversions, but it does not yet use a Web Worker.
- `.aseprite` export remains structurally validated in-browser but was not opened in the Aseprite desktop app or CLI in this environment.

## 7. Verification Log
- JS syntax checks passed for updated app files.
- Source search found no ES Module `import/export` statements in app JS.
- Source search found no `alert(` usage.
- Source search found no `drawImage(image, 0, 0, 32, 32)` shortcut.
- Local Edge opened `tests/test-cases.html?autorun=1`.
- Test page reported `61 / 61 cases passed.`
- Local Edge opened `index.html`.
- Browser app flow verified initial preview images are hidden and have no `src`.
- Browser app flow verified custom width/height inputs start hidden.
- Browser app flow verified `Original` width/height options are disabled before image load.
- Browser app flow loaded a generated 512x384 PNG and verified default `sample_32x32_median.png`.
- Browser app flow verified `Original` width/height warns and defers automatic conversion.
- Browser app flow verified pressing `미리보기 갱신` produces `sample_512x384_median.png`.
- Browser app flow verified palette `4` produces `sample_32x32_median_p4.png`.

## 8. Next Actions
- Try real artwork with Original-size palette reduction.
- Open generated `.aseprite` files in Aseprite if the desktop app is available.
- Consider a Web Worker if large-image processing becomes a usability issue.

# Final Self Evaluation

## 1. Requirement Satisfaction
The GUI now uses separate Width and Height controls with `16`, `32`, `64`, `Original`, and `Custom`. Custom inputs are hidden until needed, Original is source-size aware, presets larger than the source are disabled, and the hard 256 limit is removed.

## 2. Validation Accuracy
`src/fileHandler.js` validates integer dimensions, minimum 1, and maximum source dimensions. It allows sizes above 256 when source dimensions allow them.

## 3. Performance Behavior
Large output sizes show warning banners. Automatic reconversion is deferred for large sizes, and explicit conversion through `미리보기 갱신` remains available.

## 4. Preview Behavior
Preview images start hidden and without `src`. Reset and failed preview paths remove `src`, hide the image, and show placeholders.

## 5. Existing Behavior Preservation
Default 32x32 median PNG palette-off output remains intact. Sampling modes, palette limit, PNG/JPG/Aseprite export, drag-and-drop, warning banner, filenames, and tests remain functional.

## 6. Remaining Limitations
No Web Worker is included. No dithering, external palette import, or indexed-color Aseprite export is included.
