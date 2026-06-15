# Test Plan

## 1. Test Goal
Verify that the pixel icon generator preserves existing behavior and correctly adds palette color limiting.

## 2. Regression Tests
- [x] Default `32x32`, `median`, `png`, palette `off` still works.
  - Result: Pass
  - Note: Headless Edge verified `palette_32x32_median.png`.

- [x] Existing input/preview/download flow still works.
  - Result: Pass
  - Note: Browser flow and test page passed.

- [x] Existing output format selection still works.
  - Result: Pass
  - Note: PNG/JPG/Aseprite export remains functional.

- [x] Warning banner still works.
  - Result: Pass
  - Note: Invalid palette values use the existing warning banner.

## 3. Palette Option Tests
- [x] Palette mode `off` preserves current behavior.
  - Result: Pass
  - Note: Test page confirms the original canvas is preserved.

- [x] Palette mode `auto` works.
  - Result: Pass
  - Note: Headless Edge verified filename suffix `_p16` for 32x32 auto.

- [x] Palette mode `4` works.
  - Result: Pass
  - Note: Test page verified visible color count is <= 4.

- [x] Palette mode `8` works.
  - Result: Pass
  - Note: Test page verified visible color count is <= 8.

- [x] Palette mode `16` works.
  - Result: Pass
  - Note: Test page verified visible color count is <= 16.

- [x] Palette mode `32` works.
  - Result: Pass
  - Note: Test page verified visible color count is <= 32.

- [x] Palette mode `custom` works.
  - Result: Pass
  - Note: Headless Edge verified custom count 8 and filename `palette_32x32_average_p8.jpg`.

- [x] Custom palette count less than 2 is rejected.
  - Result: Pass
  - Note: Headless Edge verified warning and disabled download for value `1`.

- [x] Custom palette count greater than 256 is rejected.
  - Result: Pass
  - Note: Headless Edge verified warning and disabled download for value `257`.

- [x] One-color image does not crash.
  - Result: Pass
  - Note: Test page verified.

- [x] Fully transparent image does not crash.
  - Result: Pass
  - Note: Test page verified.

## 4. Auto Palette Tests
- [x] 16x16 resolves to 4 colors.
  - Result: Pass

- [x] 24x24 resolves to 8 colors.
  - Result: Pass

- [x] 32x32 resolves to 16 colors.
  - Result: Pass

- [x] 48x32 resolves to 16 colors.
  - Result: Pass

- [x] 64x64 resolves to 32 colors.
  - Result: Pass

## 5. Palette Correctness Tests
- [x] Visible RGB color count after palette limit is <= effective palette count.
  - Result: Pass
  - Note: Test page verifies this for auto, numeric, and custom modes.

- [x] Transparent pixels are excluded from color count.
  - Result: Pass
  - Note: `countUniqueVisibleColors` ignores alpha below `TRANSPARENT_ALPHA_THRESHOLD`.

- [x] Palette limit does not turn transparent pixels opaque.
  - Result: Pass
  - Note: Test page compares alpha before and after quantization.

- [x] Palette limit handles fewer source colors than requested palette count.
  - Result: Pass
  - Note: One-color case passed.

## 6. Sampling Compatibility Tests
- [x] `median` + palette limit works.
  - Result: Pass

- [x] `average` + palette limit works.
  - Result: Pass

- [x] `center` + palette limit works.
  - Result: Pass

## 7. Export Compatibility Tests
- [x] PNG export reflects palette-limited output.
  - Result: Pass
  - Note: Test page exports the palette-limited canvas.

- [x] JPG export reflects palette-limited output.
  - Result: Pass
  - Note: Headless Edge verified palette-limited JPG filename and download.

- [x] `.aseprite` export reflects palette-limited output.
  - Result: Pass
  - Note: Test page validates Aseprite dimensions from the palette-limited canvas.

- [x] Filename includes palette suffix when palette mode is not `off`.
  - Result: Pass
  - Note: Verified examples include `_p16` and `_p8`.

## 8. UI / Warning Tests
- [x] Invalid custom palette count shows warning banner.
  - Result: Pass

- [x] Warning banner uses icon and message text.
  - Result: Pass

- [x] Warning banner can be cleared.
  - Result: Pass

- [x] Browser `alert()` is not used as the main warning UI.
  - Result: Pass
  - Note: Source search found no `alert(` usage.

## 9. Test Page Result
- [x] `tests/test-cases.html`
  - Result: Pass
  - Note: Headless Edge reported `48 / 48 cases passed.`

## 10. Verification Notes
- Static syntax checks passed for app JS files.
- The implementation keeps normal script tags and does not use ES Modules.
- The conversion code still directly reads and writes `ImageData`.
- Palette quantization is post-processing and does not replace tile conversion.
