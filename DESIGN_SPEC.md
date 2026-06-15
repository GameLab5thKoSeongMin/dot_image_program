# Design Specification

## 1. Program Goal
The program converts a user-provided image into a 32x32 pixel icon that can be previewed and downloaded as a PNG.

## 2. Core Conversion Method
The program does not simply resize the image.

The original image is divided into 32 columns and 32 rows. Each tile is converted into one output pixel using the median color of pixels inside that tile.

## 3. Image Processing Rules
- Load PNG/JPG/JPEG files through the browser File API.
- Draw the source image onto a temporary canvas at its natural dimensions.
- Read the source canvas using `getImageData`.
- Divide the source image into 32x32 tile bounds.
- Calculate RGBA medians for each tile.
- Write the calculated RGBA values into a new 32x32 `ImageData`.
- Render the output `ImageData` into a 32x32 canvas.
- Export the result as PNG.

## 4. Transparency Rules
- Pixels with alpha below `TRANSPARENT_ALPHA_THRESHOLD` are treated as transparent.
- If a tile has no opaque pixels, the output pixel is `(0, 0, 0, 0)`.
- If the tile opaque-pixel ratio is below `MIN_OPAQUE_RATIO`, the output pixel is `(0, 0, 0, 0)`.
- For visible tiles, RGB and alpha medians are calculated from opaque pixels only.
- Threshold values are managed in `src/constants.js`.

## 5. GUI Layout
The app uses a four-section layout.

- Top-left: input image preview
- Top-right: generated 32x32 result preview
- Bottom-left: image input area
- Bottom-right: download and file information area

The top row is taller than the bottom row so image comparison is the primary screen focus.

## 6. Module Responsibilities
- `app.js`: Initializes the app, connects event listeners, handles the file-to-result flow, and triggers download.
- `imageProcessor.js`: Loads images, calculates tile bounds, samples image data, computes median colors, and creates the 32x32 output canvas.
- `fileHandler.js`: Validates selected files, reads files as data URLs, and creates safe output filenames.
- `uiController.js`: Updates previews, messages, file information, drag state, and download button state.
- `constants.js`: Stores output size, transparency thresholds, supported types, default filename, and UI timing constants.

## 7. Future Extensions
- 16x16 / 64x64 output options
- Average / median / dominant color mode selection
- Palette limit
- Background removal option
- Dithering option
- Preview zoom control
- UI control for transparency thresholds
- Web Worker conversion for very large images
