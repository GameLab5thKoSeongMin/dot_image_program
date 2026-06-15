# 32x32 Pixel Icon Generator

## 1. Overview
This is a local browser app that converts a PNG/JPG/JPEG image into a 32x32 pixel icon.

The conversion is not a simple resize. The app divides the original image into a 32-column by 32-row grid, calculates the median color for each tile, and writes those median colors into a new 32x32 PNG image.

## 2. Main Features
- PNG/JPG/JPEG image input
- Drag-and-drop support
- 32x32 tile-based median color conversion
- Transparent PNG handling
- Original image preview
- Generated result preview with pixelated scaling
- PNG download
- Manual algorithm test page

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
2. Choose a PNG/JPG/JPEG image with the file button, or drag an image into the drop area.
3. Check the original preview in the top-left panel.
4. Check the generated 32x32 icon in the top-right panel.
5. Save the PNG using the download button in the bottom-right panel.

## 5. Supported File Types
- PNG
- JPG
- JPEG

## 6. Output Specification
- Size: 32x32 px
- Format: PNG
- Transparent background support for PNG input
- Filename: `pixel_icon_32x32.png` or `original_filename_32x32.png`

## 7. Testing
Open `tests/test-cases.html` in a browser to run generated canvas test cases.

The test page creates synthetic images, runs them through the same tile median algorithm, and verifies that each result canvas is exactly 32x32.

Manual test expectations and recorded results are in `TEST_PLAN.md`.

## 8. Known Limitations
- Very large images are processed on the main browser thread and may briefly pause the UI.
- The initial version does not support custom output sizes.
- The initial version does not include average color, dominant color, dithering, or palette reduction modes.
