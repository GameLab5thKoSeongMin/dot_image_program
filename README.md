# Pixel Icon Generator

## 1. Overview
This is a local browser app that converts PNG/JPG/JPEG images into small pixel icons.

The default behavior remains a 32x32 median-sampled PNG output. The app also supports variable output sizes, additional sampling modes, and multiple export formats.

The conversion is not a simple resize. The source image is divided into an output-width by output-height grid. Each tile is converted into one output pixel using the selected sampling mode.

## 2. Main Features
- PNG/JPG/JPEG image input
- Drag-and-drop support
- Preset output sizes: 16x16, 24x24, 32x32, 48x48, 64x64
- Custom output width and height
- Output size validation
- Sampling modes: `median`, `average`, `center`
- Transparent PNG handling
- Result preview with pixelated rendering
- Warning banner for invalid options and JPG transparency limitations
- PNG export
- JPG export with white background compositing
- `.aseprite` binary export
- Download filenames that include size, sampling mode, and extension
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
6. Check the generated preview.
7. Download the result.

## 5. Output Size Rules
- Width and height must be integers.
- Width and height must be at least 1.
- Width and height must not exceed the source image dimensions.
- Width and height must not exceed 256.
- Presets larger than the loaded source image are disabled.

## 6. Output Formats
- PNG: Preserves transparency.
- JPG: Does not preserve transparency. Transparent pixels are composited over white and a warning is shown.
- `.aseprite`: Exports a binary Aseprite file with one frame, one layer, and raw RGBA cel data.

## 7. Output Filename
Filenames use:

```txt
originalName_widthxheight_samplingMode.extension
```

Example:

```txt
sample_64x64_average.jpg
sample_48x32_center.aseprite
```

## 8. Testing
Open `tests/test-cases.html` to run generated test cases.

The current test page verifies legacy 32x32 behavior, variable sizes, sampling modes, validation behavior, PNG/JPG export, Aseprite binary structure, and filename generation.

Recorded test results are in `TEST_PLAN.md`.

## 9. Known Limitations
- Very large images are processed on the main browser thread.
- `.aseprite` export is structurally validated, but this environment did not include the Aseprite desktop app or CLI for external open/save validation.
