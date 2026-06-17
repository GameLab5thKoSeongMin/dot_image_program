# PLANS.md

## 1. Current Objective
Complete the v0.5.0 refinement of the pixel icon generator while preserving default conversion behavior and export support.

## 2. Current Step
`program_make5.txt` is complete: audit, implementation, tests, browser verification, and documentation updates are complete.

## 3. v0.5.0 Checklist
- [x] Audit current docs, UI, conversion, palette, export, and tests.
- [x] Remove the lower/input-area duplicate `미리보기 갱신` button.
- [x] Keep the result-header `미리보기 갱신` button visible.
- [x] Replace per-axis `Original`/`Custom` buttons with a Custom size toggle.
- [x] Use Width/Height presets `16`, `32`, `64`, `128`, `256`.
- [x] Keep default output `32x32`, `median`, `png`, palette `off`.
- [x] Default Custom size to off.
- [x] Hide numeric width/height inputs while Custom size is off.
- [x] Hide preset buttons and show numeric inputs while Custom size is on.
- [x] Default Custom width/height to source image dimensions after valid image load.
- [x] Keep output validation based on source dimensions.
- [x] Keep valid output above 256 when source dimensions allow it.
- [x] Keep large-output warnings and avoid repeated heavy automatic conversion.
- [x] Add `dominant` sampling.
- [x] Preserve `median`, `average`, and `center` sampling.
- [x] Normalize alpha to `0`/`255` when palette mode is enabled.
- [x] Keep palette `off` alpha behavior unchanged.
- [x] Report visible RGB and unique RGBA palette summary counts.
- [x] Ensure preview and PNG/JPG/Aseprite export use the final palette-limited canvas.
- [x] Update tests and documentation.

## 4. Key Decisions
- Keep Vanilla HTML/CSS/JavaScript and normal script tags.
- Keep tile-based conversion and do not replace it with canvas resize.
- Use one global Custom size toggle instead of independent per-axis Custom buttons.
- Remove the old `Original` size button; source-size output is handled by Custom mode defaults.
- Keep the output format selector in the result preview header.
- Keep only one preview refresh action, in the result preview header.
- Treat palette alpha normalization as part of palette-on post-processing only.
- Keep Aseprite export RGBA.

## 5. Verification Log
- JS syntax checks passed for updated app files.
- Source search found no ES Module `import/export` statements in app JS.
- Source search found no `alert(` usage.
- Source search found no `drawImage(image, 0, 0, 32, 32)` shortcut.
- Local Edge opened `tests/test-cases.html?autorun=1`.
- Test page reported `64 / 64 cases passed.`
- Local Edge opened `index.html`.
- Browser app flow verified desktop 1280x720 document height equals viewport height.
- Browser app flow verified the result-header refresh button is visible.
- Browser app flow verified the lower duplicate refresh button is absent.
- Browser app flow verified output format options are `png,jpg,aseprite`.
- Browser app flow verified sampling options are `median,average,center,dominant`.
- Browser app flow verified Custom size defaults off and numeric inputs start hidden.
- Browser app flow verified preset options are `16,32,64,128,256`.
- Browser app flow loaded a generated 512x384 PNG and verified default `sample_32x32_median.png`.
- Browser app flow verified Custom inputs default to `512` and `384`.
- Browser app flow verified Custom source-size output warns and defers automatic conversion.
- Browser app flow verified pressing `미리보기 갱신` produces `sample_512x384_median.png`.
- Browser app flow verified `dominant + palette 4 + Aseprite` produces `sample_32x32_dominant_p4.aseprite`.
- Browser app flow verified palette summary includes unique RGBA counts and `alpha 0/255`.

## 6. Next Actions
- Open generated `.aseprite` files in Aseprite if the desktop app is available.
- Consider a Web Worker if large-image processing becomes a usability issue.
- Consider palette swatches or external palette import only after the current palette behavior is stable.

# Final Self Evaluation

## 1. Requirement Satisfaction
The v0.5.0 requirements are implemented. The app now uses Width/Height presets with a Custom size toggle, supports `dominant` sampling, normalizes alpha for palette-on output, keeps output/Aseprite selection visible, and removes the duplicate lower refresh button.

## 2. Validation Accuracy
`src/fileHandler.js` validates integer dimensions, minimum 1, and maximum source dimensions. It allows sizes above 256 when source dimensions allow them.

## 3. Performance Behavior
Large output sizes show warning banners. Automatic reconversion is deferred for large sizes, and explicit conversion through the result-header `미리보기 갱신` remains available.

## 4. Preview Behavior
Preview images start hidden and without `src`. Reset and failed preview paths remove `src`, hide the image, and show placeholders.

## 5. Existing Behavior Preservation
Default 32x32 median PNG palette-off output remains intact. PNG/JPG/Aseprite export, drag-and-drop, warning banner, filenames, and tests remain functional.

## 6. Remaining Limitations
No Web Worker is included. No dithering, external palette import, or indexed-color Aseprite export is included.
