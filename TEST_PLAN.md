# Test Plan

## 1. Test Goal
Verify that the pixel icon generator preserves existing behavior while adding the separated width/height UI, original-size output support, source-dimension validation, large-output warnings, and clean preview placeholders.

## 2. Regression Tests
- [x] Default `32x32`, `median`, `png`, palette `off` still works.
  - Result: Pass
  - Note: Browser app flow verified `sample_32x32_median.png`.

- [x] Existing input/preview/download flow still works.
  - Result: Pass
  - Note: Browser app flow generated a result and enabled download.

- [x] Existing output format selection still works.
  - Result: Pass
  - Note: Test page validates PNG/JPG/Aseprite export.

- [x] Warning banner still works.
  - Result: Pass
  - Note: Large output and palette/JPG warnings use the existing banner.

## 3. Size UI Tests
- [x] Default Width option is `32`.
- [x] Default Height option is `32`.
- [x] Width options include `16`, `32`, `64`, `Original`, `Custom`.
- [x] Height options include `16`, `32`, `64`, `Original`, `Custom`.
- [x] Custom width input is hidden until Width `Custom` is selected.
- [x] Custom height input is hidden until Height `Custom` is selected.
- [x] Original options are disabled before image load.
- [x] Original options are enabled after image load.
- [x] Presets larger than source dimension are disabled.

Result: Pass. Covered by `tests/test-cases.html` UI fixture tests and browser app flow.

## 4. Output Size Validation Tests
- [x] Width greater than source width is rejected.
- [x] Height greater than source height is rejected.
- [x] Width `0` is rejected.
- [x] Height `0` is rejected.
- [x] Non-integer width is rejected.
- [x] Non-integer height is rejected.
- [x] Width above 256 is accepted when source width is large enough.
- [x] Height above 256 is accepted when source height is large enough.
- [x] Output size equal to source dimensions is accepted.

Result: Pass.

## 5. Performance Warning Tests
- [x] 256x256 does not warn because the policy is strictly greater than 65,536 pixels.
- [x] 320x240 shows a moderate performance warning.
- [x] 800x600 shows a strong performance warning.
- [x] Large output warning does not block explicit conversion.
- [x] The result preview header exposes a visible `미리보기 갱신` button.
- [x] The result preview header exposes the output format selector with PNG, JPG, and Aseprite.

Result: Pass. Browser app flow verified Original 512x384 warns, defers automatic conversion, and then converts after `미리보기 갱신`.

## 6. Preview Placeholder Tests
- [x] Initial original preview image is hidden and has no `src`.
- [x] Initial result preview image is hidden and has no `src`.
- [x] Original placeholder is visible before image load.
- [x] Result placeholder is visible before conversion.
- [x] Clearing preview removes `src`.
- [x] Failed original preview load hides the image and restores placeholder state.
- [x] Result zoom can apply `8x`.

Result: Pass.

## 7. Palette Option Tests
- [x] Palette mode `off` preserves current behavior.
- [x] Palette mode `auto` works.
- [x] Palette modes `4`, `8`, `16`, and `32` work.
- [x] Palette mode `custom` works.
- [x] Custom palette count less than 2 is rejected.
- [x] Custom palette count greater than 256 is rejected.
- [x] One-color image does not crash.
- [x] Fully transparent image does not crash.

Result: Pass.

## 8. Palette Correctness Tests
- [x] Visible RGB color count after palette limit is <= effective palette count.
- [x] Transparent pixels are excluded from color count.
- [x] Palette limit does not turn transparent pixels opaque.
- [x] Palette limit handles fewer source colors than requested palette count.

Result: Pass.

## 9. Sampling Compatibility Tests
- [x] `median` + palette limit works.
- [x] `average` + palette limit works.
- [x] `center` + palette limit works.

Result: Pass.

## 10. Export Compatibility Tests
- [x] PNG export reflects the final canvas.
- [x] JPG export reflects the final canvas with white background compositing.
- [x] `.aseprite` export reflects the final canvas.
- [x] Filename includes palette suffix when palette mode is not `off`.
- [x] Original-size filename uses resolved numeric dimensions.

Result: Pass.

## 11. Test Page Result
- [x] `tests/test-cases.html`
  - Result: Pass
  - Note: Local Edge reported `61 / 61 cases passed.`

## 12. Browser App Flow Result
- [x] `index.html`
  - Result: Pass
  - Notes:
    - Initial preview images were hidden and had no `src`.
    - Custom width/height inputs were hidden initially.
    - `Original` options were disabled before image load.
    - After loading a generated 512x384 PNG, default output was `sample_32x32_median.png`.
    - Selecting Original width/height showed a performance warning and deferred automatic conversion.
    - Pressing `미리보기 갱신` produced `sample_512x384_median.png`.
    - Palette `4` produced `sample_32x32_median_p4.png`.

## 13. Preview Refresh Visibility Check
- [x] Result-header `미리보기 갱신` is visible on a 1280x720 desktop viewport.
- [x] Result-header `미리보기 갱신` is visible on a 390x844 mobile viewport.
- [x] The lower Export `미리보기 갱신` button remains in the option panel.

Result: Pass. Local Edge confirmed the header button was inside the viewport on desktop and mobile after the follow-up CSS/HTML update.

## 14. Layout and Output Format Visibility Check
- [x] Desktop 1366x768 document height equals viewport height.
- [x] Desktop 1280x720 document height equals viewport height.
- [x] Page-level vertical scrolling is removed on desktop; panels scroll internally when needed.
- [x] Output format selector is visible in the result preview header.
- [x] Output format selector options are `png`, `jpg`, and `aseprite`.
- [x] Selecting Aseprite produces `.aseprite` filename and `Aseprite` output label.

Result: Pass. Local Edge verified `formatcheck_32x32_median.aseprite`.

## 15. Verification Notes
- Static syntax checks passed for app JS files.
- The implementation keeps normal script tags and does not use ES Modules.
- Source search found no `alert(` usage.
- Source search found no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.
- The conversion code still directly reads and writes `ImageData`.
- Palette quantization remains post-processing and does not replace tile conversion.
