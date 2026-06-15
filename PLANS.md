# PLANS.md

## 1. Current Objective
Complete a dependency-free local 32x32 pixel icon generator that uses tile-based median color sampling, supports PNG/JPG/JPEG input, preserves transparent PNG behavior, provides preview and download, and includes verification documentation.

## 2. Current Step
Step 10. Final self evaluation is complete after implementing, reviewing, and verifying the initial version.

## 3. Step Checklist
- [x] Step 0. Initial directory structure and documentation
- [x] Step 1. Basic GUI layout
- [x] Step 2. Image input
- [x] Step 3. 32x32 conversion algorithm
- [x] Step 4. Result preview and download
- [x] Step 5. Self testing and fixes
- [x] Step 6. Documentation cleanup
- [x] Step 7. Refactoring and structure review
- [x] Step 8. Algorithm verification test images
- [x] Step 9. Manual test checklist execution
- [x] Step 10. Final self evaluation

## 4. Decisions
- The project uses plain HTML, CSS, and JavaScript with no build step.
- ES Modules are not used. Scripts are loaded in dependency order from `index.html`.
- Source files expose small namespaces on `window` to keep direct browser execution simple.
- `imageProcessor.js` owns image loading and conversion logic only.
- `fileHandler.js` owns file validation, file reading, and output filename generation.
- `uiController.js` owns DOM updates and screen state only.
- `app.js` connects events, validation, conversion, UI updates, and download.
- The conversion algorithm draws the source image onto a temporary canvas at original source dimensions only to read pixels, then directly samples `ImageData` by tile.
- The output canvas is filled from calculated tile medians. It is not produced by resizing the original image to 32x32.
- Transparent pixels use `TRANSPARENT_ALPHA_THRESHOLD` and `MIN_OPAQUE_RATIO` constants.
- Browser verification was performed with installed Microsoft Edge in headless mode because the in-app browser runtime and bundled Playwright browser binary were unavailable in this environment.

## 5. Risks
- Browser download behavior cannot be fully automated from a `file://` page without user interaction, so the test page verifies canvas output and the app code path uses `canvas.toBlob`.
- Extremely large images can still take noticeable CPU time because the app intentionally samples every source pixel in each tile.
- Some browsers may restrict local file access differently. The app itself uses user-selected `File` objects and data URLs, so normal browser execution should work.

## 6. Next Actions
- Open `index.html` in a browser and use the app with real user images.
- Open `tests/test-cases.html` to rerun algorithm verification cases.
- Consider adding progress indication or worker-based processing if very large images become a usability issue.

## 7. Verification Log
- JS syntax checks passed for all files in `src/` and `tests/testImageFactory.js` using the bundled Node runtime.
- Source search found no ES Module `import/export` usage in app source files.
- Source search found no `drawImage(image, 0, 0, 32, 32)` shortcut.
- Headless Edge opened `index.html` through `file://` and verified generated PNG, JPG, JPEG, transparent PNG, 17x17 small image, and 1920x1080 large image flows.
- Headless Edge verified invalid file rejection and disabled download state.
- Headless Edge dispatched a drag-and-drop `DataTransfer` file and verified output generation.
- Headless Edge verified the download suggested filename as `dropped_32x32.png`.
- Headless Edge opened `tests/test-cases.html`; the algorithm test page reported `10 / 10 cases passed.`
- Headless Edge verified corrupted PNG-like input shows an error and keeps download disabled.
- Headless Edge verified the 390px mobile layout has no horizontal overflow and still shows four panels.

# Final Self Evaluation

## 1. Requirement Satisfaction
The initial implementation satisfies the requested local 32x32 pixel icon generator behavior: PNG/JPG/JPEG file input, drag-and-drop, original preview, generated preview, PNG download, four-section GUI layout, and test documentation are present.

## 2. Algorithm Accuracy
The algorithm divides the source image into 32 columns and 32 rows. For every output pixel, it calculates tile bounds, collects source pixels from that tile, filters very low-alpha pixels, and calculates median R, G, B, and A values.

## 3. Why This Is Not Simple Resize
`src/imageProcessor.js` creates a 32x32 output `ImageData` and writes each output pixel from tile median values. It does not call `drawImage(image, 0, 0, 32, 32)` to generate the icon.

## 4. Transparent PNG Handling
Pixels with alpha below `TRANSPARENT_ALPHA_THRESHOLD` are treated as transparent. If a tile's opaque pixel ratio is lower than `MIN_OPAQUE_RATIO`, that output pixel becomes fully transparent. Otherwise, RGB and alpha medians are calculated from opaque pixels only.

## 5. GUI Usability
The UI presents input preview and result preview in the top row for direct comparison. The bottom-left pane handles file input and drag-and-drop. The bottom-right pane shows generated file information and a disabled/enabled download button.

## 6. Remaining Limitations
The app uses synchronous canvas processing on the main thread. Very large files may briefly block interaction. The first version does not include output size options, dithering, palette reduction, or Web Worker processing.

## 7. Future Improvements
Useful future additions include a Web Worker conversion path, selectable output sizes, selectable median/average/dominant color modes, palette limiting, transparent threshold controls, and batch conversion.
