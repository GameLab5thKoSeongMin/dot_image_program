# Design Specification

## 1. Program Goal
The program converts a user-provided image into a pixel icon with selectable output size, sampling mode, palette limit, and export format.

The default remains 32x32 median PNG output with palette limit off.

## 2. Core Pipeline
The program does not simply resize the image.

```txt
input image
-> tile conversion using median / average / center
-> optional palette limit using median cut
-> preview
-> PNG / JPG / Aseprite export
```

## 3. Conversion Options
- `outputWidth`: integer output width.
- `outputHeight`: integer output height.
- `samplingMode`: `median`, `average`, or `center`.
- `outputFormat`: `png`, `jpg`, or `aseprite`.
- `paletteMode`: `off`, `auto`, numeric mode, or `custom`.
- `customPaletteCount`: integer 2 to 256 when custom mode is selected.

## 4. Image Processing Rules
- Draw the source image onto a temporary canvas only to read pixels.
- Read the source canvas with `getImageData`.
- Divide the source into outputWidth by outputHeight tile bounds.
- Calculate each output pixel using the selected sampling mode.
- Write the result into output `ImageData`.
- Apply palette limit post-processing only when palette mode is not `off`.

## 5. Palette Quantization
Palette limiting is implemented in `src/paletteQuantizer.js`.

Rules:
- Use median cut quantization.
- Extract visible pixels only.
- Do not count pixels whose alpha is below `TRANSPARENT_ALPHA_THRESHOLD`.
- Build a limited RGB palette.
- Map visible pixels to nearest palette RGB values.
- Preserve alpha values.
- Keep transparent pixels transparent.
- If visible color count is 0, return a transparent result unchanged.
- If effective palette count is greater than or equal to the visible RGB color count, return the result unchanged.

## 6. Auto Palette Rules
Use the larger of output width and height:
- `<= 16`: 4 colors
- `<= 24`: 8 colors
- `<= 32`: 16 colors
- `<= 48`: 16 colors
- `<= 64`: 32 colors
- `> 64`: 32 colors

## 7. Transparency Rules
- PNG and Aseprite preserve output alpha.
- JPG composites the palette-limited RGBA result onto white.
- JPG may contain white background in addition to palette-limited visible colors because JPG cannot store transparency.

## 8. GUI Layout
The app keeps the four-section layout.

- Top-left: input image preview
- Top-right: generated result preview
- Bottom-left: image input and conversion options
- Bottom-right: output metadata and download

Palette controls are in the existing options area. The output metadata panel shows palette mode and visible color count summary.

The upper-center warning banner is reused for invalid palette count and other warnings. Browser `alert()` is not used as the main warning UI.

## 9. Module Responsibilities
- `app.js`: Connects events, current source state, validation, conversion, palette limiting, export, and download.
- `imageProcessor.js`: Loads images and performs tile-based conversion.
- `paletteQuantizer.js`: Performs visible color counting, median cut palette generation, nearest-color mapping, and transparency-preserving palette application.
- `fileHandler.js`: Validates files, output size, palette options, and filenames.
- `exporter.js`: Creates PNG/JPG/Aseprite export blobs.
- `uiController.js`: Handles DOM state, controls, palette summary, previews, warning banner, and output metadata.
- `constants.js`: Stores presets, defaults, limits, palette rules, formats, thresholds, and Aseprite constants.

## 10. Future Extensions
- Dithering
- External palette import
- Palette swatches
- Web Worker quantization
- Aseprite CLI validation
- Indexed-color Aseprite export
