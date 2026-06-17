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
- Median cut palette quantization
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
10. Use result-header `미리보기 갱신` when an explicit refresh is needed.
11. Check the generated preview, result summary, and palette summary.
12. Download the result.

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
input image -> tile conversion -> palette limit -> preview/export
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

## 8. Output Formats
- PNG: Preserves transparency.
- JPG: Does not preserve transparency. Transparent pixels are composited over white and a warning is shown.
- `.aseprite`: Exports a binary Aseprite file with one frame, one layer, and raw RGBA cel data.

## 9. Output Filename
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

## 10. Testing
Open `tests/test-cases.html` to run generated test cases.

The current test page verifies legacy conversion behavior, separate size controls, Custom size toggle behavior, source-size custom defaults, source-dimension validation, output above 256, performance warnings, placeholder behavior, sampling modes including `dominant`, PNG/JPG/Aseprite export, palette rules, palette custom validation, transparency preservation, palette alpha normalization, and palette filename suffixes.

Recorded test results are in `TEST_PLAN.md`.

## 11. Known Limitations
- Palette limiting uses median cut only.
- Dithering and external palette import are not included.
- Aseprite export remains RGBA, not indexed color.
- Very large images are processed on the main browser thread after explicit conversion.
- `.aseprite` export is structurally validated, but this environment did not include the Aseprite desktop app or CLI for external open/save validation.
