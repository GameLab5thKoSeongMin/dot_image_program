# Test Plan

## 1. Test Goal
Verify that the pixel icon generator preserves default behavior while adding Custom size, dithering, palette sources, Palette Editor, and v0.9.0 Preprocess / Icon Assist.

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

## 11. Dithering Tests
- [x] Dithering option list is `off`, `floydSteinberg`, `bayer4x4`.
- [x] Dithering default is `off`.
- [x] Explicit dithering `off` matches previous palette mapping output.
- [x] Floyd-Steinberg works with palette `16`.
- [x] Bayer 4x4 works with palette `16`.
- [x] Dithering preserves transparent pixels.
- [x] Dithering is skipped when palette mode is `off`.
- [x] Dithered PNG export uses the final dithered canvas.
- [x] Dithered JPG export uses the final dithered canvas with white compositing.
- [x] Dithered `.aseprite` export uses the final dithered canvas.

Result: Pass. Dithering strength is fixed at `1`; no strength UI was tested because it was not implemented in v0.6.0.

## 12. Test Page Result
- [x] `tests/test-cases.html`
  - Result: Pass
  - Note: Local Edge headless reported `94 / 94 cases passed.`

## 13. Browser App Flow Result
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
    - Dithering selector exposed `off`, `floydSteinberg`, and `bayer4x4`.
    - Initial result summary stayed `32x32 / median / palette off / PNG`.
    - After loading a generated 512x384 PNG, default output was `sample_32x32_median.png`.
    - Custom inputs defaulted to `512` and `384`.
    - Custom source-size output showed a warning and deferred automatic conversion.
    - Pressing `미리보기 갱신` produced `sample_512x384_median.png`.
    - `dominant + palette 4 + Aseprite` produced `sample_32x32_dominant_p4.aseprite`.
    - Palette summary included unique RGBA and `alpha 0/255`.

## 14. Verification Notes
- Static syntax checks passed for app JS files.
- The implementation keeps normal script tags and does not use ES Modules.
- Source search found no `alert(` usage.
- Source search found no fixed `drawImage(image, 0, 0, 32, 32)` conversion shortcut.
- The conversion code still directly reads and writes `ImageData`.
- Palette quantization remains post-processing and does not replace tile conversion.
- v0.6.0 syntax checks passed for `constants.js`, `fileHandler.js`, `paletteQuantizer.js`, `uiController.js`, and `app.js`.
- v0.6.0 static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` shortcut.
- v0.7.0 syntax checks passed for `constants.js`, `fileHandler.js`, `paletteQuantizer.js`, `uiController.js`, and `app.js`.
- v0.7.0 static checks found no ES module syntax, no `alert()`, and no fixed `drawImage(image, 0, 0, 32, 32)` shortcut.

## 15. Palette Source Tests
- [x] Palette source options are `generated`, `builtIn`, and `imported`.
- [x] Palette source defaults to `generated`.
- [x] Generated source preserves existing median-cut behavior.
- [x] Built-in fixed palette mapping works.
- [x] Imported pasted HEX mapping works.
- [x] 3-digit and 6-digit HEX values normalize correctly.
- [x] Duplicate imported colors are removed while preserving order.
- [x] Invalid imported HEX tokens are rejected.
- [x] Imported palettes below 2 or above 256 colors are rejected.
- [x] Fixed palette mapping preserves transparent pixels.
- [x] Dithering works with imported fixed palettes.
- [x] PNG/JPG/Aseprite export use the fixed-palette final canvas.

Result: Pass. Included in the Local Edge headless `78 / 78 cases passed.` result.

## 16. Palette Editor Tests
- [x] Result palette swatches expose visible HEX colors.
- [x] Swatches report usage count and percentage.
- [x] Transparent pixel count is reported separately.
- [x] Copy HEX action exists and enables after palette render.
- [x] Replace color updates exact matching visible RGB pixels.
- [x] Replace color preserves current alpha.
- [x] Merge color reduces visible color count.
- [x] Transparent pixels remain transparent and are not RGB-replaced.
- [x] Palette Editor reset clears swatches and disables actions.
- [x] The reset policy is visible in the UI.
- [x] PNG/JPG/Aseprite export use the manually edited canvas.

Result: Pass. Included in the Local Edge headless `84 / 84 cases passed.` result.

## 17. v0.8.0 Browser App Result
- [x] `index.html` loads with the default `32x32 / median / palette off / PNG` summary.
- [x] Palette Editor exists and is collapsed by default.
- [x] Copy HEX, Replace color, and Merge color start disabled before conversion.
- [x] Result-header `미리보기 갱신` remains visible.
- [x] PNG/JPG/Aseprite output selector remains visible.

Result: Pass.

## 18. Preprocess and Icon Assist Tests
- [x] Neutral preprocess defaults preserve the original `ImageData` path.
- [x] Brightness changes visible RGB and preserves alpha.
- [x] Contrast increases channel separation.
- [x] Saturation `-100` produces grayscale.
- [x] Sharpen `medium` completes and increases local edge contrast.
- [x] Background cleanup removes exact picked color.
- [x] Cleanup tolerance removes nearby RGB colors.
- [x] Existing transparent pixels remain transparent during cleanup.
- [x] Black outline fills transparent 8-neighbors.
- [x] Dark outline derives a darker non-black RGB color.
- [x] Outline does not overwrite visible pixels.
- [x] PNG/JPG/Aseprite export use the preprocessed and outlined final canvas.

Result: Pass. Included in the Local Edge headless `94 / 94 cases passed.` result.

## 19. v0.9.0 Browser App Result
- [x] `index.html` retains `32x32 / median / palette off / PNG`.
- [x] Brightness, contrast, and saturation default to `0`.
- [x] Sharpen defaults to `off`.
- [x] Background cleanup defaults to off and its controls are disabled.
- [x] Preprocess and Icon Assist are collapsed by default.
- [x] Outline options expose `off`, `black`, and `dark`.
- [x] Result-header refresh and PNG/JPG/Aseprite selector remain visible.

Result: Pass.

## 20. M5 Final Stabilization Result
- [x] The active command file and all Markdown documents were reread.
- [x] Syntax checks passed for every file in `src/*.js`.
- [x] No ES Module `import/export`, browser `alert()`, framework, or build system was found.
- [x] Tile-based conversion remains intact. The source `drawImage` call copies into a same-size preprocessing canvas and is not the output conversion path.
- [x] Normal ordered script-tag loading works in `index.html` and the test page.
- [x] The final local-browser test run reported `94 / 94 cases passed.` with zero failures.
- [x] `index.html` loaded without console errors and showed clean placeholders without broken image sources.
- [x] Custom size defaulted off, preset controls were visible, and custom numeric fields were hidden.
- [x] Sampling exposed `median`, `average`, `center`, and `dominant`.
- [x] Dithering, palette source, palette editor, neutral Preprocess, and Icon Assist controls were present with safe defaults.
- [x] A generated 64x64 PNG passed through `PixelIconApp.handleFile` and produced a visible 32x32 result named `sample_32x32_median.png`.
- [x] The actual app result canvas produced a non-empty PNG blob and JPG blob.
- [x] The actual app result canvas produced an Aseprite buffer with one frame, 32x32 dimensions, 32-bit RGBA color depth, and valid file/frame magic values.
- [x] The test suite verified final-canvas export consistency for dithering, built-in/imported palettes, Replace/Merge, brightness, contrast, saturation, sharpen, cleanup, and black/dark outline.
- [x] The obsolete `Dotprogram.html` duplicate was removed; `index.html` is the maintained entry point.
- [x] English and Korean documents were synchronized to the final verified state.

Result: Pass. Final automated browser result: `94 / 94 cases passed.` External Aseprite desktop/CLI open/save validation remains pending.

## 21. v1.0.0 Worker Stabilization Tests
- [x] Worker client and conversion worker files parse successfully.
- [x] App JS syntax checks pass after worker integration.
- [x] Worker fallback path exists through `WorkerClient({ forceFallback: true })` and is covered in the test page.
- [x] Worker conversion equivalence test was added for a controlled generated image with preprocess, palette/dither, and outline.
- [x] Processing status UI and cancel button fixture tests were added.
- [x] Cancel request handling was added so a terminated worker cannot resolve into the current result.
- [x] PNG/JPG/Aseprite export still read from the final canvas path.
- [x] Static checks found no ES Module `import/export`.
- [x] Static checks found no browser `alert()`.
- [x] Static checks found no fixed `32x32` resize shortcut.

Result: Partially executed in this environment.

Executed:
- `node --check` for all `src/*.js` files and `tests/testImageFactory.js`: Pass.
- Inline script parse for `tests/test-cases.html`: Pass.
- Static search for ES Modules, `alert()`, and fixed resize shortcut: Pass.

Blocked:
- Headless Edge and Chrome were both attempted against `http://127.0.0.1:8000/tests/test-cases.html?autorun=1`.
- Both browsers exited before page execution with GPU process initialization failures (`GPU process isn't usable`).
- Because the browser could not execute the page, no browser assertion result is recorded for v1.0.0 in this environment.

## 22. v1.1.0 Settings Preset Tests
- [x] `src/presetManager.js` parses successfully.
- [x] App JS syntax checks pass after preset integration.
- [x] Preset manager saves settings to `localStorage`.
- [x] Preset manager loads saved settings.
- [x] Preset manager deletes user presets.
- [x] Built-in recommended presets are present and treated as non-deletable templates in UI state.
- [x] Preset JSON export includes saved user presets.
- [x] Preset JSON import accepts valid preset payloads.
- [x] Invalid preset JSON returns a warning/error result instead of throwing.
- [x] Stale or partial preset settings are normalized to safe defaults or clamped values.
- [x] Preset storage excludes uploaded image data keys and local path keys.
- [x] UI restore test covers custom size, sampling, palette source, preprocess, cleanup, outline, and output format controls.
- [x] Static checks found no ES Module `import/export`.
- [x] Static checks found no browser `alert()`.
- [x] Static checks found no fixed `32x32` resize shortcut.

Result: Partially executed in this environment.

Executed:
- `node --check` for preset-related app JS: Pass.
- Inline script parse for `tests/test-cases.html`: Pass.
- Node VM preset-manager checks for save/load/delete/import/export/sanitization: Pass.
- Static search for ES Modules, `alert()`, and fixed resize shortcut: Pass.

Blocked:
- Browser execution remains blocked by the local headless GPU process initialization failure already recorded for v1.0.0.
- The added browser fixture tests are present in `tests/test-cases.html`, but a full browser assertion count is not recorded in this environment.

## 23. v1.2.0 Example Gallery / QA Tests
- [x] `src/exampleGallery.js` parses successfully.
- [x] App JS syntax checks pass after example integration.
- [x] Example gallery UI section exists in `index.html`.
- [x] Examples are generated by code and do not reference network URLs or external files.
- [x] Each example has a matching settings recipe.
- [x] Example settings fit within the generated source dimensions.
- [x] Example loading is wired through app handlers and the normal conversion path.
- [x] Example QA test functions are added to `tests/test-cases.html`.
- [x] Example gallery UI rendering and click selection fixture tests are added.
- [x] Static checks found no ES Module `import/export`.
- [x] Static checks found no browser `alert()`.
- [x] Static checks found no fixed `32x32` resize shortcut.

Result: Partially executed in this environment.

Executed:
- `node --check` for `src/exampleGallery.js`, `src/uiController.js`, and `src/app.js`: Pass.
- Inline script parse for `tests/test-cases.html`: Pass.
- Static search for ES Modules, `alert()`, and fixed resize shortcut: Pass.

Blocked:
- Browser execution remains blocked by the local headless GPU process initialization failure already recorded for v1.0.0 and v1.1.0.
- The generated example conversion QA is present in the browser test page, but full browser assertion execution is not recorded in this environment.

## 24. v1.3.0 Layered Mode Tests
- [x] `src/app.js`, `src/uiController.js`, and `src/exporter.js` parse successfully after Layered Mode integration.
- [x] Layered Mode toggle exists and defaults off.
- [x] Layer file input is disabled while Layered Mode is off.
- [x] Layer list UI fixture covers rename, visibility toggle, reorder, and delete callbacks.
- [x] Visible-layer composite helper draws visible layers in order.
- [x] Hidden layers are omitted from the visible composite.
- [x] Layered Aseprite export creates multiple layer chunks.
- [x] Layered Aseprite export creates matching cel chunks.
- [x] Layered Aseprite export preserves layer names in the binary inspection helper.
- [x] Existing single-canvas Aseprite export helper remains available.
- [x] Static checks found no ES Module `import/export`.
- [x] Static checks found no browser `alert()`.
- [x] Static checks found no fixed `32x32` resize shortcut.

Result: Partially executed in this environment.

Executed:
- `node --check` for `src/app.js`, `src/uiController.js`, and `src/exporter.js`: Pass.
- Inline script parse for `tests/test-cases.html`: Pass.
- Static search for ES Modules, `alert()`, and fixed resize shortcut: Pass.

Blocked:
- Browser execution remains blocked by the local headless GPU process initialization failure already recorded for earlier v1.x milestones.
- Full browser assertions for layered file input and actual multi-file processing are present or represented in fixture tests but not executed in this environment.

## 25. v1.0.0-v1.3.0 Final Stabilization Result
- [x] Active command file and Markdown documents were reread.
- [x] Syntax checks passed for every app JavaScript file.
- [x] Syntax check passed for `tests/testImageFactory.js`.
- [x] `tests/test-cases.html` inline script parsed successfully.
- [x] Preset manager VM checks passed.
- [x] Static checks found no ES Module `import/export`.
- [x] Static checks found no browser `alert()`.
- [x] Static checks found no fixed `32x32` resize shortcut.
- [x] English technical documents were updated.
- [x] Korean user-facing documents were updated.

Result: Available non-browser verification passed.

Blocked:
- Full browser assertion execution remains blocked in this environment because headless Edge/Chrome exits before page execution with GPU process initialization failures.
- The v1.0-v1.3 browser tests are present in `tests/test-cases.html`, but a final browser pass count is not recorded here.

## 26. 2026-07-11 Stabilization and Product-Polish Verification

Environment:
- App served from a local HTTP server on `127.0.0.1`.
- Browser execution used the in-app local browser surface.

Executed:
- [x] `node --check` passed for every app JavaScript file.
- [x] `node --check tests/testImageFactory.js` passed.
- [x] The single inline script in `tests/test-cases.html` parsed successfully.
- [x] Full browser suite: `110 / 110 cases passed.`
- [x] Browser console errors/warnings during the final test and app runs: 0.
- [x] Worker URL resolves from `workerClient.js` on the nested test page.
- [x] Worker success, forced fallback, cancel, and main-thread equivalence passed.
- [x] Real app PNG, JPG, and JPEG files decoded and produced a final canvas.
- [x] A real `drop` event passed a PNG through the normal app file handler and completed conversion.
- [x] Unsupported file metadata and corrupted PNG bytes cleared source state and used the warning banner.
- [x] Default state remained `32x32 / median / palette off / PNG`; Custom size, preprocess, and outline defaults remained off/neutral.
- [x] Custom size off/on visibility policy passed.
- [x] Generated-example conversion produced an enabled download state and the expected PNG filename.
- [x] JPG and Aseprite format changes produced the expected extensions and enabled download state; JPG transparency showed the white-background warning.
- [x] PNG/JPG/Aseprite blob and Aseprite binary-structure tests passed.
- [x] 1280x720 retained the four-panel layout with page width/height equal to the viewport.
- [x] Approximately 390x844 retained a single column with no horizontal overflow.
- [x] No duplicate IDs, unnamed form controls, nested interactive drop-zone controls, or visible broken images were found.
- [x] Static checks found no ES Module syntax or browser `alert()`.
- [x] The only full-source `drawImage` call copies the decoded image into a same-size source canvas before tile sampling; no output resize shortcut was found.

Not executed:
- Direct `file://` navigation was blocked by the browser-control security policy. The local HTTP path and Worker fallback behavior passed.
- Aseprite desktop/CLI was not installed, so external open/save validation remains pending.

Result: The implemented stabilization and polish scope passed all executable automated and browser checks. The two external/manual items above remain explicitly unverified.

## 27. 2026-07-24 Portfolio Readiness Verification

Environment:
- App served from a local HTTP server on `127.0.0.1`.
- Browser execution used the in-app local browser surface.
- The responsive integration path loaded the real app in a 390x844 same-origin frame.

Executed:
- [x] `node --check` passed for every app JavaScript file.
- [x] The inline script in `tests/test-cases.html` parsed successfully.
- [x] `git diff --check` passed.
- [x] Full browser suite: `111 / 111 cases passed.`
- [x] Browser console errors/warnings during the app and test runs: 0.
- [x] Default state remained `32x32 / median / palette off / PNG`.
- [x] The real app exposes one semantic page heading, panel-level headings, a description, theme color, and local-processing notice.
- [x] The optional workflow tools and core conversion controls render in two independent desktop columns.
- [x] Expanding Examples / QA does not create a paired blank row beside Output Size and Pixel Processing.
- [x] At 1280x720, page width and height match the viewport, output content has no internal overflow, and the full-width download action is visible.
- [x] The 390x844 integration frame uses one panel column and has no horizontal overflow.
- [x] Generated example conversion produced the expected `example_skill_badge_32x32_median_p16.png` filename and enabled download state.
- [x] No runtime console errors or warnings were recorded.

Not executed:
- Direct `file://` navigation remains blocked by browser-control security policy.
- Aseprite desktop/CLI external open/save validation remains unavailable.

Result: The portfolio presentation changes passed all executable checks without altering conversion behavior or required defaults.
