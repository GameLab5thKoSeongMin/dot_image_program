# PLANS.md

## 1. Current Objective
Extend the completed fixed 32x32 median PNG generator into a flexible pixel icon generator while preserving existing behavior.

## 2. Current Step
Extension E9 is complete: implementation, browser verification, test page expansion, and documentation updates are complete.

## 3. Extension Checklist
- [x] E0. Audit current implementation
- [x] E1. Generalize conversion options
- [x] E2. Generalize image processing
- [x] E3. Add sampling modes
- [x] E4. Add output format pipeline
- [x] E5. Add UI controls and warning banner
- [x] E6. Add validation blocking
- [x] E7. Update filename generation and download flow
- [x] E8. Expand tests
- [x] E9. Refactor carefully and finalize docs

## 4. Audit Findings
- The previous app hard-coded `OUTPUT_SIZE = 32` in `src/constants.js` and `src/imageProcessor.js`.
- Download filenames were fixed to `original_32x32.png`.
- The UI had a four-section layout that could be preserved.
- `imageProcessor.js` already separated image conversion from DOM work, so it was extended instead of replaced.
- `uiController.js` owned DOM state, so new controls and warning banner behavior were added there.
- `app.js` owned event flow and was extended to reprocess when options change.
- Tests existed and were expanded instead of removed.

## 5. Decisions
- Keep Vanilla HTML/CSS/JavaScript and normal script tags.
- Add `src/exporter.js` to keep PNG/JPG/Aseprite export out of `app.js`.
- Keep default options as 32x32, median, PNG.
- Use output width and height separately instead of a single `OUTPUT_SIZE`.
- Validate output size before conversion.
- Disable preset buttons that are larger than the loaded source image.
- Use an upper-center warning banner with icon and text for validation and JPG transparency warnings.
- Export JPG by compositing the result over white because JPG cannot preserve alpha.
- Export `.aseprite` as a real binary file with an Aseprite header, one frame, one layer chunk, and one raw cel chunk.

## 6. Risks
- `.aseprite` export is structurally validated in-browser but was not opened in the Aseprite desktop app or CLI in this environment.
- Very large images are still processed synchronously on the main browser thread.
- The app intentionally blocks output sizes larger than the source image, so small images such as 20x20 cannot use the default 32x32 preset until the user selects a valid smaller size.

## 7. Verification Log
- JS syntax checks passed for all files in `src/` and `tests/testImageFactory.js`.
- Source search found no ES Module `import/export` statements in app JS.
- Source search found no `drawImage(image, 0, 0, 32, 32)` shortcut.
- Headless Edge opened `index.html` through `file://`.
- Headless Edge verified default `sample_32x32_median.png` behavior.
- Headless Edge verified 64x64 average JPG generation and download filename.
- Headless Edge verified JPG transparency warning for transparent PNG input and warning close behavior.
- Headless Edge verified Aseprite download filename.
- Headless Edge verified invalid width warning and blocked download.
- Headless Edge verified small 20x20 input blocks 24x24 and allows 16x16.
- Headless Edge verified the mobile 390px layout has no horizontal overflow and still shows four panels.
- `tests/test-cases.html` reported `31 / 31 cases passed.`

## 8. Next Actions
- Open `index.html` in a browser and test with real production images.
- Open generated `.aseprite` files in Aseprite if the desktop app is available.
- Consider a Web Worker if large-image processing becomes a usability issue.

# Final Self Evaluation

## 1. Requirement Satisfaction
The extension preserves the original 32x32 median PNG behavior and adds variable size, presets, custom width/height, sampling modes, output validation, warning banner UI, PNG/JPG/Aseprite export, updated filenames, tests, and documentation.

## 2. Algorithm Accuracy
The conversion still divides the source image into outputWidth by outputHeight tiles. Each output pixel is calculated from source tile pixels using `median`, `average`, or `center` mode.

## 3. Why This Is Not Simple Resize
`src/imageProcessor.js` reads source `ImageData`, calculates tile bounds, collects or samples pixels, and writes a new output `ImageData`. It does not resize the source image into the output canvas as the conversion method.

## 4. Transparent PNG Handling
Median and average modes ignore very low-alpha pixels and make low-opaque-ratio tiles transparent. PNG and Aseprite export preserve alpha. JPG export composites onto white and shows a warning when transparency exists.

## 5. GUI Usability
The four-section layout is preserved. Output settings are grouped in the bottom-left panel. Result size, mode, format, and filename are shown in the bottom-right panel. Warnings appear near the top center.

## 6. Remaining Limitations
The Aseprite binary is structurally validated but not externally opened. Large images can still briefly block the UI.

## 7. Future Improvements
Useful next work includes Aseprite CLI validation, Web Worker processing, palette limiting, dithering, batch processing, and richer Aseprite layer metadata.
