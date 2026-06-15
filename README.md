# Pixel Icon Generator

## 1. Overview
This is a local browser app that converts PNG/JPG/JPEG images into small pixel icons.

The default behavior is `32x32`, `median`, `PNG`, palette limit `off`.

The conversion is not a simple resize. The source image is divided into an output-width by output-height grid, each tile is sampled, and optional palette limiting is applied after tile conversion.

## 2. Main Features
- PNG/JPG/JPEG image input
- Drag-and-drop support
- Preset output sizes: 16x16, 24x24, 32x32, 48x48, 64x64
- Custom output width and height
- Sampling modes: `median`, `average`, `center`
- Palette limit modes: `off`, `auto`, `4`, `8`, `16`, `32`, `64`, `128`, `256`, `custom`
- Median cut palette quantization
- Transparent PNG handling
- PNG export
- JPG export with white background compositing
- `.aseprite` binary export
- Warning banner for invalid options and transparency limitations
- Download filenames with size, sampling mode, palette suffix when enabled, and extension
- Manual test page

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
3. Select a preset size or enter custom width and height.
4. Select `median`, `average`, or `center` sampling.
5. Select PNG, JPG, or Aseprite output.
6. Choose palette mode. Leave it `off` for original behavior.
7. For `custom`, enter a color count from 2 to 256.
8. Check the generated preview and palette summary.
9. Download the result.

## 5. Palette Limit
Palette limiting is a post-processing step:

```txt
input image -> tile conversion -> palette limit -> preview/export
```

Palette count means visible RGB colors only. Fully transparent pixels are not counted. Semi-transparent visible pixels keep their alpha while their RGB values are mapped to the limited palette.

### Auto Palette Rules
- 16x16 or smaller: 4 colors
- up to 24x24: 8 colors
- up to 32x32: 16 colors
- up to 48x48: 16 colors
- up to 64x64: 32 colors
- larger than 64x64: 32 colors

The larger of output width and height is used.

## 6. Output Formats
- PNG: Preserves transparency.
- JPG: Does not preserve transparency. Transparent pixels are composited over white and a warning is shown.
- `.aseprite`: Exports a binary Aseprite file with one frame, one layer, and raw RGBA cel data.

## 7. Output Filename
Palette `off`:

```txt
sample_32x32_median.png
```

Palette enabled:

```txt
sample_32x32_median_p16.png
sample_64x64_average_p32.jpg
sample_48x32_center_p8.aseprite
```

## 8. Testing
Open `tests/test-cases.html` to run generated test cases.

The current test page verifies legacy behavior, variable sizes, sampling modes, validation behavior, PNG/JPG/Aseprite export, palette auto rules, palette custom validation, transparency preservation, and palette filename suffixes.

Recorded test results are in `TEST_PLAN.md`.

## 9. Known Limitations
- Palette limiting uses median cut only.
- Dithering and external palette import are not included.
- Aseprite export remains RGBA, not indexed color.
- Very large images are processed on the main browser thread.
- `.aseprite` export is structurally validated, but this environment did not include the Aseprite desktop app or CLI for external open/save validation.
