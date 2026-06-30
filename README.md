# Pixel Icon Generator

## 1. Overview
This is a local browser app that converts PNG/JPG/JPEG images into pixel icons.

The default behavior is `32x32`, `median`, `PNG`, palette limit `off`.

The conversion is not a simple resize. The source image is divided into an output-width by output-height grid, each tile is sampled, and optional palette limiting is applied after tile conversion.

## 2. Main Features
- PNG/JPG/JPEG image input
- Drag-and-drop support
- Separate Width and Height presets: `16`, `32`, `64`, `128`, `256`
- Custom size toggle, default off
- Hidden numeric width/height inputs while Custom size is off
- Source-dimension defaults for numeric width/height inputs after image load
- Output size validation against original image dimensions
- Output sizes above 256 when the source image is large enough
- Large-output performance warnings through the warning banner
- Output format selector in the result preview header with PNG, JPG, and Aseprite options
- Sampling modes: `median`, `average`, `center`, `dominant`
- Palette limit modes: `off`, `auto`, `4`, `8`, `16`, `32`, `64`, `128`, `256`, `custom`
- Palette source modes: `generated`, `builtIn`, `imported`
- Generic built-in palettes and local pasted/file-based HEX palette import
- Fixed nearest-color palette mapping
- Result palette swatches with HEX, usage count, percentage, and transparent pixel count
- Palette Editor actions: Copy HEX, Replace color, and Merge color
- Manual palette edits reflected in preview and PNG/JPG/Aseprite export
- Collapsed source Preprocess controls for brightness, contrast, saturation, and sharpen
- Background cleanup by picked RGB color and tolerance
- Collapsed Icon Assist with `off`, `1px black`, and `1px dark` outline
- Median cut palette quantization
- Dithering modes: `off`, `floydSteinberg`, `bayer4x4`
- Palette-dependent Floyd-Steinberg and Bayer 4x4 mapping
- Palette-on alpha normalization to `0` or `255`
- Transparent PNG handling
- Checkerboard preview backgrounds
- Clean preview placeholders without broken image icons
- Result-header `미리보기 갱신` action
- Result preview zoom options: `Fit`, `Actual`, `8x`, `16x`
- PNG export
- JPG export with white background compositing
- `.aseprite` binary export
- Download filenames with size, sampling mode, palette suffix when enabled, and extension
- Manual/browser test page

## 3. How to Run
Open `index.html` directly in a modern browser.

No package installation or build step is required.

If a browser blocks local execution in your environment, run a simple local server from the project directory:

```bash
python -m http.server 8000
```

Then open:

```txt
http://localhost:8000/
```

## 4. How to Use
1. Open `index.html`.
2. Choose a PNG/JPG/JPEG image or drag an image into the drop area.
3. Choose Width and Height presets separately.
4. Turn on `Custom size` only when you need manually entered dimensions.
5. When Custom size is on after image load, the numeric fields default to the source image size.
6. Select `median`, `average`, `center`, or `dominant` sampling.
7. Select PNG, JPG, or Aseprite output from the result preview header.
8. Choose palette mode. Leave it `off` for original behavior.
9. For palette `custom`, enter a color count from 2 to 256.
10. Keep Palette source at `Generated` for median-cut behavior, or choose `Built-in` / `Imported` for fixed palette mapping.
11. For Imported, paste HEX colors or load a local `.txt` / `.hex` file, then apply the palette.
12. Choose Dithering only when palette mapping is active. Leave it `off` for original behavior.
13. Use result-header `미리보기 갱신` when an explicit refresh is needed.
14. Open Preprocess when source adjustment or background cleanup is needed.
15. Open Icon Assist to add a black or derived dark outline.
16. Open the collapsed Palette Editor to inspect result swatches.
17. Select a swatch to copy its HEX, replace it with another HEX, or merge it into another result color.
18. Check the generated preview, result summary, and palette summary.
19. Download the result.

Large valid output sizes may show a warning and ask you to use `미리보기 갱신` to avoid repeated heavy auto-conversions. The warning does not block explicit conversion.

## 5. Output Size Policy
Output size is limited by the original image dimensions.

Hard validation rules:
- Width must be an integer.
- Height must be an integer.
- Width must be at least 1.
- Height must be at least 1.
- Width must not exceed original image width.
- Height must not exceed original image height.

There is no fixed 256x256 output limit.

If output pixels exceed `65,536`, the app shows a moderate performance warning. If output pixels exceed `262,144`, the app shows a stronger warning. These warnings do not block explicit conversion.

## 6. Sampling Modes
- `median`: Uses the median visible RGBA channel values in each tile.
- `average`: Uses the average visible RGBA channel values in each tile.
- `center`: Uses the center source pixel for each tile.
- `dominant`: Quantizes visible tile pixels into RGB buckets, chooses the most frequent bucket, and outputs the average RGBA of that bucket. If a tile has no visible pixels, it becomes transparent.

## 7. Palette Limit
Palette limiting is a post-processing step:

```txt
input image -> tile conversion -> palette limit -> optional dithering-aware mapping -> preview/export
```

Palette `off` preserves the converted canvas alpha behavior.

When palette mode is enabled, visible RGB colors are limited and alpha is normalized by default:
- alpha below `TRANSPARENT_ALPHA_THRESHOLD` becomes `0`
- alpha at or above the threshold becomes `255`

This keeps unique RGBA output controlled, generally within the effective palette count plus transparent.

### Auto Palette Rules
- 16x16 or smaller: 4 colors
- up to 24x24: 8 colors
- up to 32x32: 16 colors
- up to 48x48: 16 colors
- up to 64x64: 32 colors
- larger than 64x64: 32 colors

The larger of output width and height is used.

## 8. Dithering
Dithering is available after palette mapping.

Modes:
- `off`: default. Preserves previous palette behavior.
- `floydSteinberg`: uses RGB error diffusion on visible pixels only.
- `bayer4x4`: uses deterministic ordered Bayer 4x4 mapping.

Dithering runs only when palette mapping is active. In v0.6.0 this means palette mode is not `off`. If dithering is selected while palette mode is `off`, the app skips dithering and shows a warning banner.

Transparent pixels remain transparent. Palette-enabled alpha normalization still applies before dithering, so visible pixels use alpha `255` and transparent pixels use alpha `0`.

Dithering strength is fixed at `1`; there is no strength control in v0.6.0.

## 9. Palette Sources
- `generated`: default. Uses the existing `off` / `auto` / numeric / `custom` median-cut palette limit.
- `builtIn`: maps visible pixels to one of the included generic fixed palettes.
- `imported`: maps visible pixels to a pasted or locally loaded HEX palette.

Imported text accepts 3-digit or 6-digit HEX values with optional `#`, separated by whitespace, commas, or semicolons. Duplicate colors are removed while preserving order. Imported palettes must contain 2 to 256 unique valid colors.

Built-in and imported palettes perform fixed nearest-color mapping, preserve transparent pixels, and normalize mapped alpha to `0` or `255`. Palette import is local only; no URL fetching is performed.

## 10. Output Formats
- PNG: Preserves transparency.
- JPG: Does not preserve transparency. Transparent pixels are composited over white and a warning is shown.
- `.aseprite`: Exports a binary Aseprite file with one frame, one layer, and raw RGBA cel data.

## 11. Palette Editor
The collapsed Palette Editor analyzes the current final canvas and shows:
- visible RGB swatches
- normalized lowercase HEX
- pixel usage count
- percentage of visible pixels
- total visible pixels
- transparent pixel count

Select a swatch before using an action:
- `Copy HEX`: writes the selected HEX to the clipboard when browser permission allows it.
- `Replace color`: replaces every visible pixel with the selected exact RGB value using the entered HEX.
- `Merge color`: replaces the selected source color with another current result swatch.

Manual edits preserve current alpha and skip transparent pixels. The edited canvas becomes `state.resultCanvas`, so preview and PNG/JPG/Aseprite export use the edited result.

Any new conversion, including conversion triggered by a settings change, clears manual edits. This reset policy is shown in the Palette Editor.

## 12. Preprocess and Background Cleanup
Preprocess is collapsed by default. Neutral defaults preserve previous output:
- brightness: `0`
- contrast: `0`
- saturation: `0`
- sharpen: `off`
- background cleanup: `off`

Brightness, contrast, and saturation operate on visible source RGB and preserve alpha. Sharpen supports `low` and `medium` using a lightweight blended cross-neighbor convolution.

Background cleanup runs before the adjustments. Choose a color and tolerance from `0` to `255`; visible source pixels whose Euclidean RGB distance is within the tolerance become transparent. Existing transparent pixels remain transparent.

## 13. Icon Assist
Outline options:
- `off`: default, no post-processing.
- `1px black`: fills transparent 8-neighbors of visible output pixels with black.
- `1px dark`: derives one darker color from the average visible RGB and fills the same neighbors.

Outline is applied after palette/manual-edit processing and before preview/export. It never overwrites existing visible pixels. When palette limiting is enabled, outline may add one extra visible color.

## 14. Output Filename
Palette `off`:

```txt
sample_32x32_median.png
```

Palette enabled:

```txt
sample_32x32_median_p16.png
sample_64x64_average_p32.jpg
sample_48x32_dominant_p8.aseprite
```

Custom source-size output uses the resolved numeric size:

```txt
sample_512x384_median.png
```

## 15. Testing
Open `tests/test-cases.html` to run generated test cases.

The current test page verifies legacy conversion behavior, size controls, validation, placeholders, sampling, palette limiting, dithering, palette sources, Palette Editor, neutral preprocess regression, brightness, contrast, saturation, sharpen, cleanup tolerance, black/dark outline, transparency, and final-canvas PNG/JPG/Aseprite export consistency.

The final M5 browser run reported `94 / 94 cases passed.` The real app file-processing path was also checked with a generated PNG and produced the default `sample_32x32_median.png` result plus non-empty PNG/JPG and structurally valid 32-bit RGBA Aseprite output.

Recorded test results are in `TEST_PLAN.md`. `index.html` is the maintained application entry point; the obsolete `Dotprogram.html` duplicate was removed.

## 16. Known Limitations
- Generated palette limiting uses median cut only.
- Dithering strength is fixed at `1`.
- Dithering requires active palette mapping; it is skipped when palette mode is `off`.
- Palette import supports local HEX text and `.txt` / `.hex` files only; URL fetch and `.gpl` parsing are not included.
- Clipboard copy depends on browser clipboard permission. The selected HEX remains visible when copying is blocked.
- Palette edits use exact RGB matching and do not provide undo/redo in v0.8.0.
- Preprocess, sharpen, and outline run on the browser main thread.
- Background cleanup uses RGB distance only and does not perform AI segmentation.
- Outline is limited to one 8-neighbor pixel layer.
- Aseprite export remains RGBA, not indexed color.
- Very large images are processed on the main browser thread after explicit conversion.
- `.aseprite` export is structurally validated, but this environment did not include the Aseprite desktop app or CLI for external open/save validation.
