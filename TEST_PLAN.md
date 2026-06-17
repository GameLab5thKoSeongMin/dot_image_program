# Test Plan

## 1. Test Goal
Verify that the pixel icon generator preserves default behavior while adding the v0.5.0 Custom size flow, `dominant` sampling, palette alpha normalization, source-dimension validation, large-output warnings, result-header refresh behavior, and clean preview placeholders.

## 2. Regression Tests
- [x] Default `32x32`, `median`, `png`, palette `off` still works.
  - Result: Pass
  - Note: Browser app flow verified `sample_32x32_median.png`.

- [x] Existing input/preview/download state still works.
  - Result: Pass
  - Note: Browser app flow generated a result and enabled preview refresh/download state.

- [x] Existing output format selection still works.
  - Result: Pass
  - Note: Test page validates PNG/JPG/Aseprite export.

- [x] Warning banner still works.
  - Result: Pass
  - Note: Large output and palette/JPG warnings use the existing banner.

## 3. Size UI Tests
- [x] Default Width option is `32`.
- [x] Default Height option is `32`.
- [x] Width presets include `16`, `32`, `64`, `128`, `256`.
- [x] Height presets include `16`, `32`, `64`, `128`, `256`.
- [x] Custom size toggle starts off.
- [x] Custom width input is hidden and disabled while Custom size is off.
- [x] Custom height input is hidden and disabled while Custom size is off.
- [x] Preset buttons hide when Custom size is on.
- [x] Custom width/height inputs show and enable when Custom size is on.
- [x] Custom inputs default to source image dimensions after load.
- [x] Presets larger than source dimension are disabled.
- [x] Old `Original` and per-axis `Custom` buttons are absent.

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
- [x] Output size equal to source dimensions is accepted through Custom size.

Result: Pass.

## 5. Performance Warning Tests
- [x] 256x256 does not warn because the policy is strictly greater than 65,536 pixels.
- [x] 320x240 shows a moderate performance warning.
- [x] 800x600 shows a strong performance warning.
- [x] Large output warning does not block explicit conversion.
- [x] The result preview header exposes a visible `미리보기 갱신` button.
- [x] The lower/input-area duplicate `미리보기 갱신` button is removed.
- [x] The result preview header exposes the output format selector with PNG, JPG, and Aseprite.

Result: Pass. Browser app flow verified Custom source-size `512x384` warns, defers automatic conversion, and then converts after `미리보기 갱신`.

## 6. Preview Placeholder Tests
- [x] Initial original preview image is hidden and has no `src`.
- [x] Initial result preview image is hidden and has no `src`.
- [x] Original placeholder is visible before image load.
- [x] Result placeholder is visible before conversion.
- [x] Clearing preview removes `src`.
- [x] Failed original preview load hides the image and restores placeholder state.
- [x] Result zoom can apply `8x`.

Result: Pass.

## 7. Sampling Tests
- [x] `median` conversion works.
- [x] `average` conversion works.
- [x] `center` conversion works.
- [x] `dominant` conversion works and selects the most frequent visible RGB bucket.
- [x] Sampling selector options are `median`, `average`, `center`, and `dominant`.

Result: Pass.

## 8. Palette Option Tests
- [x] Palette mode `off` preserves current behavior and original canvas object.
- [x] Palette mode `auto` works.
- [x] Palette modes `4`, `8`, `16`, and `32` work.
- [x] Palette mode `custom` works.
- [x] Custom palette count less than 2 is rejected.
- [x] Custom palette count greater than 256 is rejected.
- [x] One-color image does not crash.
- [x] Fully transparent image does not crash.

Result: Pass.

## 9. Palette Correctness Tests
- [x] Visible RGB color count after palette limit is <= effective palette count.
- [x] Transparent pixels are excluded from visible color count.
- [x] Palette limit does not turn transparent pixels opaque.
- [x] Palette limit handles fewer source colors than requested palette count.
- [x] Palette enabled normalizes alpha to `0` or `255`.
- [x] Unique RGBA count after palette limit is controlled, generally <= effective palette count + transparent.
- [x] Palette summary reports visible RGB and unique RGBA before/after counts.

Result: Pass.

## 10. Export Compatibility Tests
- [x] PNG export reflects the final canvas.
- [x] JPG export reflects the final canvas with white background compositing.
- [x] `.aseprite` export reflects the final canvas.
- [x] Filename includes palette suffix when palette mode is not `off`.
- [x] Custom source-size filename uses resolved numeric dimensions.
- [x] `dominant + palette + Aseprite` produces `sample_32x32_dominant_p4.aseprite`.

Result: Pass.

## 11. Test Page Result
- [x] `tests/test-cases.html`
  - Result: Pass
  - Note: Local Edge reported `64 / 64 cases passed.`

## 12. Browser App Flow Result
- [x] `index.html`
  - Result: Pass
  - Notes:
    - Desktop 1280x720 document height equaled viewport height.
    - Initial Custom size was off and numeric inputs were hidden.
    - Width/Height presets were `16,32,64,128,256`.
    - Old `Original` and per-axis `Custom` buttons were absent.
    - The lower duplicate preview refresh button was absent.
    - Output selector was visible in the result preview header with `png,jpg,aseprite`.
    - Sampling selector exposed `median,average,center,dominant`.
    - After loading a generated 512x384 PNG, default output was `sample_32x32_median.png`.
    - Custom inputs defaulted to `512` and `384`.
    - Custom source-size output showed a warning and deferred automatic conversion.
    - Pressing `미리보기 갱신` produced `sample_512x384_median.png`.
    - `dominant + palette 4 + Aseprite` produced `sample_32x32_dominant_p4.aseprite`.
    - Palette summary included unique RGBA and `alpha 0/255`.

## 13. Verification Notes
- Static syntax checks passed for app JS files.
- The implementation keeps normal script tags and does not use ES Modules.
- Source search found no `alert(` usage.
- Source search found no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.
- The conversion code still directly reads and writes `ImageData`.
- Palette quantization remains post-processing and does not replace tile conversion.
