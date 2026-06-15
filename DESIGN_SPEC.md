# Design Specification

## 1. Program Goal
The program converts a user-provided image into a pixel icon with selectable output size, sampling mode, and export format.

The default remains 32x32 median PNG output.

## 2. Core Conversion Method
The program does not simply resize the image.

The original image is divided into `outputWidth` columns and `outputHeight` rows. Each tile is converted into one output pixel using the selected representative color method.

## 3. Conversion Options
- `outputWidth`: integer output width.
- `outputHeight`: integer output height.
- `samplingMode`: `median`, `average`, or `center`.
- `outputFormat`: `png`, `jpg`, or `aseprite`.

## 4. Image Processing Rules
- Load PNG/JPG/JPEG files through the browser File API.
- Draw the source image onto a temporary canvas at natural dimensions only to read pixels.
- Read the source canvas with `getImageData`.
- Divide the source image into outputWidth by outputHeight tile bounds.
- Calculate each output pixel using the selected sampling mode.
- Write the result into a new output `ImageData`.
- Render that `ImageData` into an output canvas.

## 5. Sampling Modes
- `median`: Collect non-transparent tile pixels and use channel medians.
- `average`: Collect non-transparent tile pixels and use channel averages.
- `center`: Use the center source pixel from the tile.

Median remains the default mode.

## 6. Transparency Rules
- Pixels with alpha below `TRANSPARENT_ALPHA_THRESHOLD` are treated as transparent.
- If a median/average tile has no opaque pixels, the output pixel is transparent.
- If a median/average tile's opaque pixel ratio is below `MIN_OPAQUE_RATIO`, the output pixel is transparent.
- PNG and Aseprite preserve output alpha.
- JPG composites the output over white and shows a warning if transparency exists.

## 7. Output Size Validation
Output width and height must:
- be integers,
- be at least 1,
- not exceed source image dimensions,
- not exceed 256.

Preset buttons larger than the current source image are disabled.

## 8. Export Formats
- PNG uses `canvas.toBlob("image/png")`.
- JPG draws the result onto a white-background canvas and uses `canvas.toBlob("image/jpeg")`.
- `.aseprite` uses a binary writer to create an Aseprite file with:
  - 128-byte header,
  - one frame,
  - one layer chunk,
  - one raw RGBA cel chunk.

## 9. GUI Layout
The app keeps the four-section layout.

- Top-left: input image preview
- Top-right: generated result preview
- Bottom-left: image input and conversion options
- Bottom-right: output metadata and download

An upper-center warning banner displays validation and JPG transparency warnings. Browser `alert()` is not used as the main warning UI.

## 10. Module Responsibilities
- `app.js`: Connects events, current source state, validation, conversion, export, and download.
- `imageProcessor.js`: Loads images and performs tile-based conversion.
- `fileHandler.js`: Validates files and output size, normalizes options, generates filenames.
- `exporter.js`: Creates PNG/JPG/Aseprite export blobs.
- `uiController.js`: Handles DOM state, controls, previews, warning banner, and output metadata.
- `constants.js`: Stores presets, defaults, limits, formats, thresholds, and Aseprite constants.

## 11. Future Extensions
- Web Worker conversion for large images
- Palette limit
- Dithering
- Batch conversion
- Aseprite CLI validation
- Multiple frames or layers in Aseprite export
