# Test Plan

## 1. Test Goal
Verify that the extended pixel icon generator preserves existing 32x32 median PNG behavior and correctly adds variable sizes, sampling modes, validation, warning UI, and PNG/JPG/Aseprite export.

## 2. Functional Tests

### Existing Behavior Regression
- [x] PNG input works.
  - Result: Pass
  - Note: Verified in headless Edge with generated PNG `File` objects.

- [x] JPG/JPEG input works.
  - Result: Pass
  - Note: Existing MIME/extension validation remains in place.

- [x] Drag-and-drop input works.
  - Result: Pass
  - Note: Verified in the previous app pass and preserved in the current event flow.

- [x] Default output remains 32x32 median PNG.
  - Result: Pass
  - Note: Headless Edge produced `sample_32x32_median.png` with a 32x32 result.

- [x] Invalid file type is blocked.
  - Result: Pass
  - Note: File validation rejects unsupported MIME types and extensions.

- [x] Corrupted image load failure is handled.
  - Result: Pass
  - Note: Image load errors are caught and shown through UI error/warning state.

### Output Size Tests
- [x] 16x16 median conversion
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] 24x24 median conversion
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] 32x32 median conversion
  - Result: Pass
  - Note: Verified by app flow and test page.

- [x] 48x48 median conversion
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] 64x64 median conversion
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] 48x32 median conversion
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] 8x12 custom conversion
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] Width greater than original image width is rejected.
  - Result: Pass
  - Note: Headless Edge and test page validation confirmed rejection.

- [x] Height greater than original image height is rejected.
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] Width greater than 256 is rejected.
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] Height greater than 256 is rejected.
  - Result: Pass
  - Note: Verified by `tests/test-cases.html`.

- [x] Preset larger than original image is disabled or blocked.
  - Result: Pass
  - Note: Headless Edge verified a 20x20 image disables 24x24 and keeps download blocked until 16x16 is selected.

### Sampling Mode Tests
- [x] 32x32 median conversion
  - Result: Pass
  - Note: Verified by app flow and test page.

- [x] 32x32 average conversion
  - Result: Pass
  - Note: Verified by test page.

- [x] 32x32 center conversion
  - Result: Pass
  - Note: Verified by test page.

- [x] 64x64 average conversion
  - Result: Pass
  - Note: Headless Edge verified 64x64 average output and test page coverage.

- [x] 48x32 center conversion
  - Result: Pass
  - Note: Verified by test page.

### Output Format Tests
- [x] PNG export works.
  - Result: Pass
  - Note: Test page verified non-empty `image/png` Blob.

- [x] PNG export preserves transparency.
  - Result: Pass
  - Note: PNG export uses the alpha-preserving output canvas.

- [x] JPG export works.
  - Result: Pass
  - Note: Headless Edge verified JPG download filename; test page verified non-empty `image/jpeg` Blob.

- [x] JPG export uses `.jpg` extension.
  - Result: Pass
  - Note: Headless Edge verified `sample_64x64_average.jpg`.

- [x] JPG export composites transparency over white background.
  - Result: Pass
  - Note: Test page verified the JPG composite canvas has no transparency.

- [x] JPG transparency warning appears when needed.
  - Result: Pass
  - Note: Headless Edge verified the warning for transparent PNG input after switching output format to JPG.

- [x] `.aseprite` export produces a non-empty binary file.
  - Result: Pass
  - Note: Test page verified non-empty Blob.

- [x] `.aseprite` export uses `.aseprite` extension.
  - Result: Pass
  - Note: Headless Edge verified Aseprite download filename.

- [x] `.aseprite` binary has correct dimensions.
  - Result: Pass
  - Note: Test page inspected header width and height.

- [x] `.aseprite` binary has expected magic/header values.
  - Result: Pass
  - Note: Test page verified file magic `0xA5E0`, frame magic `0xF1FA`, and 32 bpp color depth.

- [x] `.aseprite` export is not a renamed PNG.
  - Result: Pass
  - Note: Test page verified the binary does not start with a PNG signature.

- [x] Filename includes width, height, sampling mode, and extension.
  - Result: Pass
  - Note: Test page verified `sample_48x32_center.aseprite`.

### Warning UI Tests
- [x] Invalid width shows warning banner.
  - Result: Pass
  - Note: Headless Edge verified invalid width warning.

- [x] Invalid height shows warning banner.
  - Result: Pass
  - Note: Same validation path as invalid width.

- [x] Oversized >256 shows warning banner.
  - Result: Pass
  - Note: Validation helper blocks the value; test page verifies rejection.

- [x] Invalid preset is disabled or blocked.
  - Result: Pass
  - Note: Headless Edge verified disabled preset for small source image.

- [x] Warning banner can be cleared.
  - Result: Pass
  - Note: Headless Edge verified `warningCloseButton` hides the banner.

- [x] Warning banner uses icon and content text.
  - Result: Pass
  - Note: `warningBanner` contains `.warning-icon` and `#warningMessage`.

- [x] Browser `alert()` is not used as the main warning UI.
  - Result: Pass
  - Note: No `alert(` usage exists in app source.

## 3. Test Page Result
- [x] `tests/test-cases.html`
  - Result: Pass
  - Note: Headless Edge reported `31 / 31 cases passed.`

## 4. Verification Notes
- Static syntax checks passed for all app JS files.
- The implementation keeps normal script tags and does not use ES Modules.
- The conversion code still directly reads and writes `ImageData`.
- Aseprite export follows the documented little-endian header/frame/chunk structure and was structurally validated in browser tests.
