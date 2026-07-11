# Design Specification

## 1. Program Goal
The program converts a user-provided image into a pixel icon with selectable output width, output height, sampling mode, palette limit, and export format.

The default remains 32x32 median PNG output with palette limit off.

## 2. Core Pipeline
The program does not simply resize the image.

```txt
input image
-> optional worker or main-thread processing path
-> optional source cleanup / brightness / contrast / saturation / sharpen
-> tile conversion using median / average / center / dominant
-> palette source resolution using generated / built-in / imported colors
-> optional palette limit or fixed nearest-color mapping
-> optional dithering-aware palette mapping
-> optional exact-RGB palette replacement / merge
-> optional 1px black / dark outline
-> preview
-> PNG / JPG / Aseprite export
```

## 3. Conversion Options
- `customSizeEnabled`: boolean. Defaults to `false`.
- `widthOption`: preset value `16`, `32`, `64`, `128`, or `256` when Custom size is off.
- `heightOption`: preset value `16`, `32`, `64`, `128`, or `256` when Custom size is off.
- `customWidth`: numeric input used when Custom size is on.
- `customHeight`: numeric input used when Custom size is on.
- `outputWidth`: resolved numeric output width.
- `outputHeight`: resolved numeric output height.
- `samplingMode`: `median`, `average`, `center`, or `dominant`.
- `outputFormat`: `png`, `jpg`, or `aseprite`.
- `paletteMode`: `off`, `auto`, numeric mode, or `custom`.
- `customPaletteCount`: integer 2 to 256 when custom palette mode is selected.
- `paletteSource`: `generated`, `builtIn`, or `imported`. Defaults to `generated`.
- `builtInPaletteId`: selected generic built-in palette identifier.
- `importedPaletteText`: local pasted or file-loaded HEX list.
- `ditheringMode`: `off`, `floydSteinberg`, or `bayer4x4`. Defaults to `off`.
- `convertedCanvas`: unedited converted/palette-processed canvas for the current conversion.
- `resultCanvas`: final canvas used by preview and export, including manual palette edits.
- `resultPalette`: current visible palette analysis.
- `paletteEditCount`: number of manual replacement/merge actions since the latest conversion.
- `preprocess`: brightness, contrast, saturation, sharpen, cleanup enabled/color/tolerance.
- `outlineMode`: `off`, `black`, or `dark`.
- `outlineInfo`: applied state, added pixel count, and generated color.
- `workerStatus`: active request id, stage text, and cancel state for optional worker-backed conversion.

## 4. Size UI Rules
Width and Height are selected independently.

```txt
Width presets:  16 / 32 / 64 / 128 / 256
Height presets: 16 / 32 / 64 / 128 / 256
```

Defaults:
- Width: `32`
- Height: `32`
- Custom size: off

Custom size off:
- Preset buttons are visible.
- Numeric width/height inputs are hidden and disabled.

Custom size on:
- Preset buttons are hidden.
- Numeric width/height inputs are visible and enabled.
- After a valid image is loaded, numeric inputs default to source image width and height.

Preset buttons larger than the loaded source dimension are disabled.

## 5. Output Size Validation
The fixed 256x256 hard limit has been removed.

Hard validation:
- Width must be an integer.
- Height must be an integer.
- Width must be at least 1.
- Height must be at least 1.
- Width must not exceed source image width.
- Height must not exceed source image height.

Valid sizes above 256 are allowed when the source image is large enough.

## 6. Performance Warning Policy
Large output sizes are not blocked.

Thresholds:
- `outputWidth * outputHeight > 65,536`: moderate warning.
- `outputWidth * outputHeight > 262,144`: stronger warning.

For large sizes, automatic reconversion on option changes is deferred. The app shows the warning banner and asks the user to press `미리보기 갱신` for explicit conversion. The result preview header keeps this action visible. The older lower/input-area duplicate refresh button is intentionally removed.

## 7. Image Processing Rules
- Draw the source image onto a temporary canvas only to read pixels.
- Read the source canvas with `getImageData`.
- Divide the source into outputWidth by outputHeight tile bounds.
- Calculate each output pixel using the selected sampling mode.
- Write the result into output `ImageData`.
- Apply palette limit post-processing only when palette mode is not `off`.
- Apply dithering only during palette mapping when a palette is active.

Sampling modes:
- `median`: visible tile channels are sorted and reduced by median.
- `average`: visible tile channels are averaged.
- `center`: center source pixel is used.
- `dominant`: visible tile pixels are quantized into RGB buckets; the most frequent bucket wins and outputs average RGBA. If no visible pixel exists, the tile is transparent.

## 8. Palette Quantization
Palette limiting is implemented in `src/paletteQuantizer.js`.

Rules:
- Use median cut quantization.
- Extract visible pixels only.
- Do not count pixels whose alpha is below `TRANSPARENT_ALPHA_THRESHOLD`.
- Build a limited RGB palette.
- Map visible pixels to nearest palette RGB values.
- Keep transparent pixels transparent.
- Palette `off` returns the original canvas and preserves alpha behavior.
- Palette enabled normalizes alpha to binary `0` or `255` by default.
- If visible color count is 0, return a transparent alpha-normalized result.
- If effective palette count is greater than or equal to the visible RGB color count, still return the alpha-normalized result when palette is enabled.

The palette summary reports visible RGB color counts and unique RGBA counts before/after palette application.

## 9. Dithering
Dithering is implemented in `src/paletteQuantizer.js` as part of palette mapping.

Rules:
- Default mode is `off`.
- Supported modes are `off`, `floydSteinberg`, and `bayer4x4`.
- `floydSteinberg` diffuses RGB error to neighboring visible pixels only.
- `bayer4x4` applies a deterministic 4x4 Bayer offset before nearest-palette mapping.
- Transparent pixels are preserved and do not receive error diffusion.
- Dithering runs only when palette mapping is active. In v0.6.0, that means palette mode is not `off`.
- If palette mode is `off`, dithering is skipped and the app reports that with the warning banner.
- Dithering strength is fixed at `1` in v0.6.0.

## 10. Palette Sources
- `generated` preserves the existing median-cut path and palette limit controls.
- `builtIn` resolves a generic fixed palette from `constants.js`.
- `imported` parses pasted or locally loaded `.txt` / `.hex` content.
- Imported HEX supports 3-digit and 6-digit forms with optional `#`.
- Duplicate imported colors are removed while preserving order.
- Imported palettes require 2 to 256 unique colors.
- Built-in and imported sources bypass median-cut generation and map visible pixels to the nearest fixed RGB color.
- Fixed palette mapping preserves transparent pixels and uses palette-on binary alpha normalization.
- Palette import is local only and does not fetch URLs.

## 11. Palette Editor
- Analyze the final canvas after each conversion or manual edit.
- Ignore pixels below `TRANSPARENT_ALPHA_THRESHOLD` when building visible swatches.
- Show lowercase 6-digit HEX, usage count, visible usage percentage, and transparent pixel count.
- Sort swatches by descending usage, then HEX.
- Replace color uses exact visible RGB matching and preserves existing alpha.
- Merge color is the same exact-RGB operation using another result swatch as the target.
- Skip transparent pixels during replacement/merge.
- Assign every edited canvas to `state.resultCanvas`.
- Clear manual edit state whenever a new conversion runs.
- Keep the Palette Editor collapsed by default.

## 12. Source Preprocessing
- Defaults are brightness `0`, contrast `0`, saturation `0`, sharpen `off`, cleanup `off`.
- Background cleanup runs first and compares Euclidean RGB distance against tolerance `0` to `255`.
- Matching visible source pixels become transparent.
- Existing transparent pixels remain transparent.
- Brightness, contrast, and saturation process visible RGB only and preserve alpha.
- Saturation `-100` produces grayscale.
- Sharpen uses a cross-neighbor convolution blended at `low` or `medium`.
- Preprocessing occurs before tile bounds and representative sampling.

## 13. Outline Assist
- Supported modes are `off`, `black`, and `dark`.
- Outline operates on the post-palette/manual-edit canvas.
- Only transparent pixels adjacent to visible 8-neighbors are filled.
- Existing visible pixels are never overwritten.
- `black` uses `#000000`.
- `dark` derives one color from 35% of the average visible RGB.
- Outline may add one visible color beyond a palette limit.
- Preview and all exports use the outlined final canvas.

## 14. Auto Palette Rules
Use the larger of output width and height:
- `<= 16`: 4 colors
- `<= 24`: 8 colors
- `<= 32`: 16 colors
- `<= 48`: 16 colors
- `<= 64`: 32 colors
- `> 64`: 32 colors

## 15. Transparency Rules
- PNG and Aseprite preserve final output alpha.
- JPG composites the final RGBA result onto white.
- JPG may contain white background in addition to palette-limited visible colors because JPG cannot store transparency.
- Palette enabled reduces alpha to `0` or `255`; palette off does not.
- Manual Palette Editor actions preserve the alpha already present in the final canvas.
- Background cleanup can add transparency before tile conversion.
- Outline only turns eligible transparent output neighbors opaque.

## 16. Preview Rules
- Original and result preview `<img>` elements start hidden and without `src`.
- Placeholders are visible before upload/conversion.
- Preview image errors clear `src`, hide the image, restore the placeholder, and show the warning banner.
- Preview stages use a subtle checkerboard background for transparency inspection.
- The result preview header includes a visible `미리보기 갱신` action.
- The result preview header includes the output format selector so PNG/JPG/Aseprite is visible without scrolling.
- Result preview supports `Fit`, `Actual`, `8x`, and `16x` zoom.

## 17. GUI Layout
The app keeps the four-section layout.

- Top-left: input image preview
- Top-right: generated result preview, output format selector, `미리보기 갱신`, and zoom control
- Bottom-left: image input and conversion options
- Bottom-right: output metadata and download

The options area is grouped into:
- Output Size
- Pixel Processing

The Pixel Processing group includes collapsed Preprocess, Sampling, Dithering, Palette source, Palette limit, and collapsed Icon Assist controls.

The output panel shows filename, size, sampling mode, format, palette text, a compact result summary, and a collapsed Palette Editor.

The upper-center warning banner is reused for invalid values, JPG transparency limitations, palette notices, and large output warnings. Browser `alert()` is not used.

Desktop layout uses viewport-height panels with internal scrolling where needed, so the page does not become larger than the viewport on ordinary desktop sizes.

## 18. Module Responsibilities
- `app.js`: Connects events, current source state, validation, conversion, palette limiting, manual palette edits, final-canvas export, and download.
- `imageProcessor.js`: Loads images, preprocesses source pixels, performs background cleanup/sharpen, and runs tile-based conversion.
- `iconAssistProcessor.js`: Adds black or derived dark outline to the post-processing canvas.
- `paletteQuantizer.js`: Performs visible color counting, median cut palette generation, fixed nearest-color mapping, dithering, result palette analysis, exact-RGB replacement/merge, and palette alpha normalization.
- `fileHandler.js`: Validates files, output size, palette options, imported HEX palettes, performance warnings, and filenames.
- `exporter.js`: Creates PNG/JPG/Aseprite export blobs.
- `presetManager.js`: Owns settings-only preset defaults, sanitization, `localStorage` persistence, JSON import/export, and built-in recommended templates.
- `exampleGallery.js`: Owns generated example definitions, canvas factories, matching settings recipes, and deterministic example QA conversion checks.
- `uiController.js`: Handles DOM state, size controls, placeholders, zoom, palette sources, result swatches, Palette Editor controls, summaries, warnings, and output metadata.
- `constants.js`: Stores size presets, defaults, thresholds, modes, formats, palette rules, alpha policy, and Aseprite constants.
- `workerClient.js`: Creates optional conversion workers, reports stage progress, exposes cancellation, and signals fallback when workers are unavailable.
- `conversionWorker.js`: Runs serializable source `ImageData` through preprocess, tile conversion, palette/dither processing, palette analysis, and outline processing without DOM access.

## 18A. Worker Processing Rules
- The worker path is optional and must not be required for direct `index.html` usage.
- Source image decoding and source `ImageData` extraction remain on the main thread.
- Worker messages pass serializable data only; no DOM nodes, canvas elements, or image elements are sent.
- If worker creation or execution fails, `app.js` uses the existing main-thread conversion path.
- Canceled worker requests are terminated and guarded by request id so stale results cannot replace the current valid result.
- Export preparation remains on the main thread in v1.0.0.

## 18B. Preset Rules
- Presets store serializable settings only.
- Presets may include size mode, width/height choices, sampling, output format, palette source/limit, dithering, preprocess, cleanup, and outline settings.
- Presets must not store uploaded image data, file objects, data URLs, canvases, blobs, clipboard data, generated output, or private local paths.
- Loading a preset updates the existing UI controls and then uses the normal validation/conversion flow.
- Source-dimension validation still applies after a preset is loaded; a preset cannot bypass output-size rules.
- Stale or partial preset data is sanitized back to safe defaults instead of crashing.

## 18C. Example Gallery / QA Rules
- Examples are generated canvases or repository-owned data only.
- The app does not fetch network images for examples.
- Example settings are normal UI settings and use the same validation/conversion path as manual settings.
- Loading an example must not change the default startup behavior.
- Example QA checks are deterministic and do not replace the main browser test suite.

## 18D. Layered Mode Rules
- Layered Mode defaults off.
- When Layered Mode is off, the existing single-image source, preview, Palette Editor, and export flow remain the active behavior.
- Layered state is stored separately from single-image state.
- Layered Mode accepts multiple local PNG/JPG/JPEG image files.
- Each image becomes one layer with a file-derived editable name, visibility state, and source dimensions.
- All layers use the same resolved output width and height.
- Each layer is processed independently through preprocess, tile conversion, palette/dither, and outline using shared global settings.
- Source layers are not flattened before pixel conversion.
- Processed visible layers are composited in layer order at top-left for preview and flattened PNG/JPG export.
- v1.3.0 does not support per-layer positioning; all processed layers align at top-left.
- Hidden layers are omitted from the composite and from v1.3.0 Aseprite export.
- Layered Aseprite export preserves visible processed layers as separate 32-bit RGBA layer/cel records with layer names.
- Manual Palette Editor edits are disabled in Layered Mode.

## 19. Future Extensions
- Dithering strength control
- Palette edit undo/redo
- AI or edge-aware background removal
- Web Worker quantization
- Aseprite CLI validation
- Indexed-color Aseprite export

## 20. Final Verification Status
- v1.0.0-v1.3.0 M5 syntax checks pass for all app JavaScript files and `tests/testImageFactory.js`.
- `tests/test-cases.html` inline script parses successfully with the v1.0-v1.3 coverage added.
- Static checks confirm no ES Modules, no browser `alert()`, no framework/build system, and no output resize shortcut.
- Preset manager VM checks pass for save/load/delete/import/export/sanitization and exclusion of private image/path fields.
- Full browser assertion execution is blocked in this environment because headless Edge/Chrome exits before page execution with GPU process initialization failures.
- `state.resultCanvas` is the shared preview/export source after palette mapping, manual edits, preprocessing, cleanup, and outline processing.
- `state.layered` is the separate Layered Mode state and Layered Mode defaults off.
- External Aseprite desktop/CLI open/save validation remains pending.
