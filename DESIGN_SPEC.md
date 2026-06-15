# Design Specification

## 1. Program Goal
The program converts a user-provided image into a pixel icon with selectable output width, output height, sampling mode, palette limit, and export format.

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
- `widthOption`: `16`, `32`, `64`, `original`, or `custom`.
- `heightOption`: `16`, `32`, `64`, `original`, or `custom`.
- `outputWidth`: resolved numeric output width.
- `outputHeight`: resolved numeric output height.
- `samplingMode`: `median`, `average`, or `center`.
- `outputFormat`: `png`, `jpg`, or `aseprite`.
- `paletteMode`: `off`, `auto`, numeric mode, or `custom`.
- `customPaletteCount`: integer 2 to 256 when custom palette mode is selected.

## 4. Size UI Rules
Width and Height are selected independently.

```txt
Width:  16 / 32 / 64 / Original / Custom
Height: 16 / 32 / 64 / Original / Custom
```

Defaults:
- Width: `32`
- Height: `32`

`Custom Width` is hidden until Width `Custom` is selected. `Custom Height` is hidden until Height `Custom` is selected.

`Original` is disabled until a valid image has loaded. After load:
- Width `Original` resolves to source image width.
- Height `Original` resolves to source image height.
- Numeric options larger than the source dimension are disabled.

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

For large sizes, automatic reconversion on option changes is deferred. The app shows the warning banner and asks the user to press `미리보기 갱신` for explicit conversion.

## 7. Image Processing Rules
- Draw the source image onto a temporary canvas only to read pixels.
- Read the source canvas with `getImageData`.
- Divide the source into outputWidth by outputHeight tile bounds.
- Calculate each output pixel using the selected sampling mode.
- Write the result into output `ImageData`.
- Apply palette limit post-processing only when palette mode is not `off`.

## 8. Palette Quantization
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

## 9. Auto Palette Rules
Use the larger of output width and height:
- `<= 16`: 4 colors
- `<= 24`: 8 colors
- `<= 32`: 16 colors
- `<= 48`: 16 colors
- `<= 64`: 32 colors
- `> 64`: 32 colors

## 10. Transparency Rules
- PNG and Aseprite preserve output alpha.
- JPG composites the palette-limited RGBA result onto white.
- JPG may contain white background in addition to palette-limited visible colors because JPG cannot store transparency.

## 11. Preview Rules
- Original and result preview `<img>` elements start hidden and without `src`.
- Placeholders are visible before upload/conversion.
- Preview image errors clear `src`, hide the image, restore the placeholder, and show the warning banner.
- Preview stages use a subtle checkerboard background for transparency inspection.
- Result preview supports `Fit`, `Actual`, `8x`, and `16x` zoom.

## 12. GUI Layout
The app keeps the four-section layout.

- Top-left: input image preview
- Top-right: generated result preview and zoom control
- Bottom-left: image input and conversion options
- Bottom-right: output metadata and download

The options area is grouped into:
- Output Size
- Pixel Processing
- Export

The output panel shows filename, size, sampling mode, format, palette text, and a compact result summary.

The upper-center warning banner is reused for invalid values, JPG transparency limitations, palette notices, and large output warnings. Browser `alert()` is not used.

## 13. Module Responsibilities
- `app.js`: Connects events, current source state, width/height option resolution, validation, conversion, palette limiting, performance warnings, export, and download.
- `imageProcessor.js`: Loads images and performs tile-based conversion.
- `paletteQuantizer.js`: Performs visible color counting, median cut palette generation, nearest-color mapping, and transparency-preserving palette application.
- `fileHandler.js`: Validates files, output size, palette options, performance warnings, and filenames.
- `exporter.js`: Creates PNG/JPG/Aseprite export blobs.
- `uiController.js`: Handles DOM state, size axis controls, custom input visibility, placeholders, zoom, summaries, palette summary, warning banner, and output metadata.
- `constants.js`: Stores size axis options, defaults, thresholds, modes, formats, palette rules, and Aseprite constants.

## 14. Future Extensions
- Dithering
- External palette import
- Palette swatches
- Web Worker quantization
- Aseprite CLI validation
- Indexed-color Aseprite export
