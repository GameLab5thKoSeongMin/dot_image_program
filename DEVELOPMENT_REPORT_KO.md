# 개발 진행 보고서

## 2026-07-24 포트폴리오 완성도 점검

기능 회귀 없이 첫인상과 사용 동선을 다듬는 작업을 진행했습니다.

주요 개선 내용:
- 예제, 프리셋, 레이어 모드를 열었을 때 옆 열에 큰 빈 공간이 생기던 옵션 배치를 독립된 두 열 구조로 정리했습니다.
- 자주 사용하는 출력 크기와 픽셀 처리 옵션을 별도 열로 유지해 고급 도구를 펼쳐도 핵심 설정을 바로 확인할 수 있습니다.
- 결과 정보를 두 열로 압축하고 다운로드 버튼을 전체 너비로 배치해 1280x720 화면에서도 스크롤 없이 보이도록 개선했습니다.
- 한글 표시가 자연스러운 시스템 글꼴, 부드러운 배경과 패널 그림자, 세부 컨트롤 강조, 모션 감소 설정을 추가했습니다.
- 이미지가 외부로 업로드되지 않고 브라우저 안에서만 처리된다는 안내를 입력 영역에 표시했습니다.
- 문서 설명, 테마 색상, SVG 파비콘, 하나의 문서 수준 제목을 추가해 포트폴리오와 접근성 품질을 보강했습니다.

검증 결과:
- 전체 브라우저 테스트 `111 / 111 cases passed.`
- 앱과 테스트 실행 중 콘솔 오류·경고 0건
- 1280x720 4패널 레이아웃과 390x844 단일 열 통합 화면 통과
- 생성 예제 변환, 예상 파일명, 다운로드 활성화 확인
- 기본값 `32x32 / median / palette off / PNG` 유지

직접 `file://` 탐색과 Aseprite 데스크톱/CLI 외부 열기·저장 검증은 기존과 동일하게 미검증 항목으로 남아 있습니다.

## 1. 현재 진행 단계
`program_make6_to_9.txt` 기준 v0.6.0부터 v0.9.0까지의 확장과 M5 Final Stabilization을 완료했습니다.

M0 audit와 시작 문서 동기화는 완료되었습니다.
M1 v0.6.0 Dithering 구현, 테스트, 문서 업데이트도 완료되었습니다.

M2 v0.7.0 Palette Source / External Palette 구현, 테스트, 문서 업데이트도 완료되었습니다.

M3 v0.8.0 Palette Swatch / Palette Editor / Color Merge 구현, 테스트, 문서 업데이트도 완료되었습니다.

M4 v0.9.0 Preprocess / Icon Assist 구현, 테스트, 문서 업데이트도 완료되었습니다.

M5에서 전체 문서 재검토, 전체 JS syntax check, 정적 정책 검사, `94 / 94` 브라우저 회귀 테스트, 실제 앱 파일 처리 및 export 흐름 검증을 완료했습니다.

## 2. M0에서 확인한 기준 상태
- 기존 v0.5.0 기능은 테스트 페이지 기준으로 유지되고 있었습니다.
- 기본값은 `32x32`, `median`, `PNG`, palette `off`입니다.
- Custom size toggle, Width/Height preset, `dominant` sampling, palette alpha normalization, PNG/JPG/Aseprite export가 유지되어야 합니다.
- 작업 시작 시 `index.html`이 없어 명령 파일과 문서 기준에 맞게 복구했습니다.
- `Dotprogram.html` legacy duplicate는 제거했고 `index.html`을 유일한 관리 대상 진입점으로 사용합니다.
- 모든 새 기능은 최종 canvas에 반영되어야 하며, export는 이 최종 canvas를 사용해야 합니다.

## 3. v0.6.0 Dithering 구현 내용
추가된 dithering 모드:
- `off`
- `floydSteinberg`
- `bayer4x4`

구현 방식:
- `src/constants.js`에 dithering mode와 기본값을 추가했습니다.
- `src/fileHandler.js`에 dithering mode 정규화를 추가했습니다.
- `src/paletteQuantizer.js`에 Floyd-Steinberg와 Bayer 4x4 mapping을 추가했습니다.
- `src/uiController.js`와 `index.html`에 Dithering select를 추가했습니다.
- `src/app.js`에서 선택된 dithering mode를 palette mapping 단계로 전달하도록 연결했습니다.

동작 정책:
- 기본값은 `off`입니다.
- palette mode가 `off`이면 dithering은 실행되지 않습니다.
- palette mode가 `off`인 상태에서 dithering을 선택하면 warning banner로 안내합니다.
- 투명 픽셀은 dithering 이후에도 투명하게 유지됩니다.
- palette가 켜진 경우 기존 alpha `0/255` 정규화 정책을 유지합니다.
- v0.6.0에서는 dithering strength UI를 추가하지 않았고, strength는 `1`로 고정했습니다.

## 4. v0.6.0 검증 결과
실행한 검증:
- JS syntax check: Pass
- `tests/test-cases.html?autorun=1`: Pass
- Local Edge headless 결과: `70 / 70 cases passed.`
- `index.html` 로딩 및 Dithering selector 표시: Pass
- 기본 summary `32x32 / median / palette off / PNG`: Pass
- ES Module `import/export` 문법 없음: Pass
- browser `alert()` 사용 없음: Pass
- 고정 `drawImage(image, 0, 0, 32, 32)` resize shortcut 없음: Pass

추가된 테스트:
- dithering `off` 회귀 테스트
- Floyd-Steinberg + palette `16`
- Bayer 4x4 + palette `16`
- dithering 투명 픽셀 보존
- palette `off` 상태에서 dithering skip
- dithered PNG/JPG/Aseprite export consistency

## 5. 최종 완료 상태
- v0.6.0 Dithering: 완료
- v0.7.0 Palette Source / External Palette: 완료
- v0.8.0 Palette Swatch / Palette Editor: 완료
- v0.9.0 Preprocess / Icon Assist: 완료
- M5 Final Stabilization: 완료

## 6. 현재 리스크와 제한
- Floyd-Steinberg는 큰 출력에서 처리 비용이 커질 수 있습니다. 기존 large-output warning banner 정책으로 대응합니다.
- dithering strength 조절은 v0.6.0에 포함하지 않았습니다.
- `.aseprite` export는 RGBA 방식이며 indexed color 방식이 아닙니다.
- Palette Editor는 exact RGB replacement만 지원하며 undo/redo는 없습니다.
- preprocess와 outline은 main thread에서 처리됩니다.

## 7. M2 완료 내용
M2에서 완료한 내용:
- palette source `generated`, `builtIn`, `imported` 상태 추가
- safe built-in palette 목록 추가
- HEX textarea parsing 추가
- `.txt` / `.hex` file text import 경로 추가
- fixed palette nearest-color mapping 추가
- palette source UI 추가
- 관련 테스트 케이스 추가

검증 결과:
- JS syntax check: Pass
- ES Module, `alert()`, 고정 `32x32` resize shortcut 정적 검사: Pass
- Local Edge headless `tests/test-cases.html?autorun=1`: `78 / 78 cases passed.`
- generated/built-in/imported palette source: Pass
- invalid/too-small/too-large HEX palette validation: Pass
- fixed palette transparency와 dithering: Pass
- PNG/JPG/Aseprite export consistency: Pass

## 8. M3 완료 내용
M3에서 완료한 내용:
- 결과 palette swatch 표시
- HEX, 사용 pixel 수, visible pixel 비율 표시
- visible pixel 수와 transparent pixel 수 표시
- Copy HEX
- Replace color
- Merge color
- 새 변환 시 수동 edit 초기화 안내
- edited canvas를 `state.resultCanvas`로 사용

검증 결과:
- JS syntax check: Pass
- Local Edge headless `tests/test-cases.html?autorun=1`: `84 / 84 cases passed.`
- swatch 분석과 UI reset: Pass
- Replace와 Merge: Pass
- alpha 및 transparent pixel 보존: Pass
- edited PNG/JPG/Aseprite export: Pass
- `index.html` 기본 summary와 Palette Editor 초기 상태: Pass

## 9. M4 완료 내용
M4에서 완료한 내용:
- brightness, contrast, saturation
- sharpen `off`, `low`, `medium`
- background cleanup color와 tolerance
- outline `off`, `1px black`, `1px dark`
- preprocess와 outline을 최종 export canvas에 연결

구현 정책:
- 기본값은 brightness/contrast/saturation `0`, sharpen `off`, cleanup `off`, outline `off`
- background cleanup은 source adjustment보다 먼저 실행
- 모든 preprocess는 tile conversion 전에 실행
- outline은 palette/manual edit 결과 뒤에 다시 생성
- black outline은 `#000000`
- dark outline은 visible 평균 RGB의 35%로 생성

검증 결과:
- JS syntax check: Pass
- Local Edge headless `tests/test-cases.html?autorun=1`: `94 / 94 cases passed.`
- neutral preprocess 회귀: Pass
- brightness/contrast/saturation/sharpen: Pass
- background cleanup과 tolerance: Pass
- black/dark outline과 visible pixel 보존: Pass
- processed PNG/JPG/Aseprite export: Pass
- `index.html` 중립 기본값과 접힌 Preprocess/Icon Assist: Pass

## 10. M5 최종 안정화 결과
- active command와 전체 Markdown 문서 재확인: 완료
- 전체 `src/*.js` syntax check: Pass
- ES Module `import/export`, browser `alert()`, framework/build system: 없음
- output resize shortcut: 없음. 원본 크기 `drawImage`는 tile sampling 전 전처리 canvas 복사용입니다.
- 최종 브라우저 테스트: `94 / 94 cases passed.`, 실패 0건
- `index.html` 초기 placeholder, Custom size off, preset 표시, sampling/palette/dithering/Preprocess/Icon Assist 기본 상태: Pass
- 메모리에서 생성한 64x64 PNG를 실제 앱 파일 처리 경로로 변환: Pass
- 기본 결과 `sample_32x32_median.png`, 32x32 preview, download 활성화: Pass
- 실제 최종 canvas의 PNG/JPG blob과 32-bit RGBA Aseprite binary 생성: Pass
- dithering, built-in/imported palette, Replace/Merge, preprocess, cleanup, black/dark outline의 최종 export 반영: Pass

## 11. 최종 요약과 다음 개발 후보
v0.6.0~v0.9.0의 승인된 범위는 모두 완료되었습니다. 기본 `32x32`, `median`, `PNG`, palette `off` 동작도 유지됩니다.

남은 제한:
- 큰 이미지의 main-thread 처리 비용
- dithering strength 고정
- 로컬 HEX palette import만 지원
- Palette Editor undo/redo 없음
- RGB 거리 기반 배경 제거
- 1px outline 제한
- RGBA Aseprite 출력
- Aseprite 데스크톱 앱/CLI 직접 열기 검증 미수행

새 범위를 승인하는 경우 첫 후보는 Aseprite 데스크톱/CLI 호환성 검증입니다. 이후 성능 개선이 필요하면 Web Worker 적용을 우선 검토할 수 있습니다. 이번 작업에서는 v1.0이나 새 기능을 시작하지 않았습니다.

---

## v1.0.0~v1.3.0 M0 시작 점검 요약

새 작업 범위는 `program_make10_to_13.txt` 기준 v1.0.0부터 v1.3.0까지의 순차 확장입니다. 첨부 지시문을 프로젝트 루트의 `program_make10_to_13.txt`로 저장했고, 새 동기화 문서 `ROADMAP_V10_TO_V13.md`를 생성했습니다.

현재 기준선은 v0.9.0 안정 버전입니다. 기본값 `32x32`, `median`, `png`, palette `off`, dithering `off`, preprocess 중립값, outline `off`가 보존되어야 합니다. 기존 변환은 단순 resize가 아니라 `ImageData`를 읽은 뒤 tile 단위 대표 색상을 계산하는 방식입니다.

점검 결과:
- `index.html`은 계속 유지되는 메인 진입점이며 normal script tag 로딩을 사용합니다.
- `src/app.js`의 `state.resultCanvas`가 단일 이미지 모드 preview/export의 최종 canvas입니다.
- `state.convertedCanvas`는 Palette Editor 편집 후 outline을 다시 적용하기 위한 pre-outline canvas로 사용됩니다.
- `src/imageProcessor.js`, `src/paletteQuantizer.js`, `src/iconAssistProcessor.js`가 v1.0.0 Web Worker 분리 후보입니다.
- `src/exporter.js`의 Aseprite export는 현재 1 frame, 1 layer, 1 cel RGBA 구조입니다. v1.3.0에서 layered Aseprite export 확장이 필요합니다.
- `tests/testImageFactory.js`의 생성형 test canvas는 v1.2.0 Example Gallery / QA Set의 기반으로 재사용할 수 있습니다.
- `node --check`로 현재 `src/*.js`와 `tests/testImageFactory.js` syntax check를 통과했습니다.
- 정적 검색에서 ES Module `import/export`, browser `alert()`, 단순 output resize shortcut은 발견되지 않았습니다.

다음 단계는 M1 v1.0.0 Performance Stabilization / Web Worker입니다. Web Worker가 `file://` 환경에서 제한될 수 있으므로 main-thread fallback과 직접 `index.html` 실행 호환성을 반드시 유지해야 합니다.

---

## v1.0.0 M1 진행 요약

M1 Performance Stabilization / Web Worker 구현을 완료했습니다.

구현 내용:
- `src/conversionWorker.js` 추가
- `src/workerClient.js` 추가
- worker 사용 가능 시 preprocess, tile conversion, palette/dithering, palette 분석, outline 처리를 worker에서 수행
- worker 생성 또는 실행 실패 시 main-thread fallback 수행
- worker 처리 단계 status 표시
- worker 변환 취소 버튼 추가
- 취소된 worker 결과가 기존 preview/export 결과를 덮어쓰지 않도록 request id guard 추가
- 기존 `state.resultCanvas` 기반 PNG/JPG/Aseprite export 흐름 유지

검증 내용:
- 전체 `src/*.js` syntax check: Pass
- `tests/test-cases.html` inline script parse: Pass
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색: Pass

제한 및 참고:
- source image decode와 source `ImageData` 추출은 main thread에 남아 있습니다.
- PNG/JPG/Aseprite export blob 준비도 main thread에 남아 있습니다.
- 로컬 headless Edge/Chrome 실행은 GPU process 초기화 실패로 page 실행 전에 종료되어 browser autorun 결과를 기록하지 못했습니다. 이 환경 문제는 `TEST_PLAN.md`와 `CHANGELOG.md`에 기록했습니다.

다음 단계는 M5 Final Stabilization입니다.

## v1.3.0 M4 진행 요약

M4에서 Layered PNG Input / Layered Aseprite Export를 구현했습니다.

완료 내용:
- Layered Mode UI를 추가했고 기본값은 off입니다.
- `state.layered`를 추가해 단일 이미지 상태와 layer 상태를 분리했습니다.
- 여러 이미지 파일을 layer로 추가할 수 있고, layer 이름 변경, 순서 변경, 표시/숨김, 삭제를 지원합니다.
- 각 layer는 전역 설정을 공유하며 독립적으로 변환됩니다.
- visible processed layer를 순서대로 top-left 기준 합성해 preview와 flattened PNG/JPG export에 사용합니다.
- Aseprite export는 visible processed layer를 별도 RGBA layer/cel로 저장합니다.
- 숨긴 layer는 v1.3.0 Aseprite export와 flattened composite에서 제외됩니다.

검증 내용:
- `src/app.js`, `src/uiController.js`, `src/exporter.js` syntax check가 통과했습니다.
- `tests/test-cases.html` inline script parse가 통과했습니다.
- Layered Mode default off, layer row action, visible composite, hidden layer 제외, layered Aseprite layer/cel count와 layer name 검사를 browser test page에 추가했습니다.
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색에서 문제가 없었습니다.

제한 사항:
- 이 환경에서는 headless Edge/Chrome이 GPU process initialization 실패로 page 실행 전에 종료되어 전체 browser assertion count는 기록하지 못했습니다.

## 현재 최종 상태

2026-07-24의 최신 검증 결과는 `111 / 111 cases passed.`이며 browser console error/warning은 0건입니다. 위 문서에 남아 있는 GPU 초기화 실패는 과거 milestone 실행 기록입니다. 직접 `file://` 실행과 Aseprite desktop/CLI 외부 open/save만 이번 실행에서 미검증 상태로 남았습니다.

## 2026-07-11 v1.3 안정화 및 제품 폴리싱

이번 단계는 신규 기능을 추가하지 않고 Worker 안정화, UI 용어 정리, 접근성, 반응형 화면, 실제 입력 경로 검증에 집중했습니다.

핵심 변경:
- `workerClient.js`가 현재 페이지가 아니라 자신의 script URL을 기준으로 `conversionWorker.js`를 찾도록 수정했습니다.
- main thread와 Worker가 동일한 ImageData 타일 변환 함수를 사용하도록 중복 로직을 통합했습니다.
- 한국어 우선 UI로 프리셋, 예제, 레이어, 출력 크기, 픽셀 처리, 팔레트, 상태 메시지를 정리했습니다.
- 드롭존을 중첩 버튼 구조가 아닌 레이블이 있는 group으로 바꾸고, 파일·range·레이어 컨트롤의 접근성 이름과 focus 표시를 보강했습니다.
- PNG/JPG/JPEG 실제 앱 입력, 실제 drop 이벤트, 잘못된 확장자, 손상 이미지 데이터를 같은 출처의 실제 `index.html` 통합 테스트로 검증했습니다.

검증 결과:
- 모든 app JavaScript 및 `tests/testImageFactory.js` syntax check: Pass
- `tests/test-cases.html` inline script parse: Pass
- 전체 로컬 HTTP 브라우저 테스트: `110 / 110 cases passed.`
- 최종 테스트와 앱 실행의 browser console error/warning: 0건
- 기본 `32x32 / median / palette off / PNG`, Custom size off, 중립 전처리, outline off: 유지
- Worker 성공, 강제 fallback, cancel, main-thread equivalence: Pass
- PNG/JPG/Aseprite blob 및 Aseprite binary 구조: Pass
- 1280x720 4패널과 약 390x844 단일 열·가로 넘침 없음: Pass

남은 수동 확인:
- 직접 `file://` 탐색은 브라우저 제어 보안 정책이 차단해 이번 실행에서는 재검증하지 못했습니다. 로컬 HTTP 실행과 Worker fallback 테스트는 통과했습니다.
- Aseprite 데스크톱 앱/CLI가 설치되어 있지 않아 외부 open/save 검증은 미수행입니다.

## v1.0.0~v1.3.0 M5 최종 안정화 요약

사용 가능한 비브라우저 검증은 통과했습니다.

완료한 검증:
- 활성 command 파일과 Markdown 문서를 다시 확인했습니다.
- 모든 app JavaScript 파일 syntax check가 통과했습니다.
- `tests/testImageFactory.js` syntax check가 통과했습니다.
- `tests/test-cases.html` inline script parse가 통과했습니다.
- preset manager Node VM 검증이 통과했습니다.
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색에서 문제가 없었습니다.
- 영어 기술 문서와 한국어 사용자-facing 문서를 업데이트했습니다.

남은 제한:
- 이 환경에서는 headless Edge/Chrome이 GPU process initialization 실패로 page 실행 전에 종료되어 최종 browser assertion pass count를 기록하지 못했습니다.
- v1.0.0~v1.3.0 browser test 항목은 `tests/test-cases.html`에 추가되어 있지만, 실제 브라우저 실행 검증은 GPU 문제가 해결된 환경에서 다시 실행해야 합니다.

## v1.2.0 M3 진행 요약

M3에서 생성형 Example Gallery / QA Set을 구현했습니다.

완료 내용:
- `src/exampleGallery.js`를 추가해 외부 파일 없이 생성되는 예제 canvas와 설정 recipe를 관리합니다.
- 앱 UI에 접힌 `Examples / QA` 섹션을 추가했습니다.
- 예제를 선택하면 이전 원본 상태를 지우고, 예제 설정을 적용한 뒤, 생성된 예제 이미지를 기존 변환 흐름으로 처리합니다.
- 예제 QA 버튼은 네트워크 없이 생성 예제를 검사하는 흐름으로 연결했습니다.
- 예제는 네트워크 이미지, 외부 파일, 비공개 경로를 참조하지 않습니다.

검증 내용:
- `src/exampleGallery.js`, `src/uiController.js`, `src/app.js` syntax check가 통과했습니다.
- `tests/test-cases.html` inline script parse가 통과했습니다.
- example metadata, generated canvas, settings 적용, QA conversion, UI render/click 테스트를 browser test page에 추가했습니다.
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색에서 문제가 없었습니다.

제한 사항:
- 이 환경에서는 headless Edge/Chrome이 GPU process initialization 실패로 page 실행 전에 종료되어 전체 browser assertion count는 기록하지 못했습니다.
## v1.1.0 M2 진행 요약

M2에서 설정 프리셋 저장/불러오기를 구현했습니다.

완료 내용:
- `src/presetManager.js`를 추가해 프리셋 schema, 안전한 정규화, `localStorage` 저장, JSON export/import를 담당하게 했습니다.
- 앱 UI에 접힌 `설정 프리셋` 섹션을 추가했습니다.
- 현재 설정 저장, 프리셋 불러오기, 사용자 프리셋 삭제, 기본값 복원, JSON 내보내기/가져오기를 지원합니다.
- 기본 제공 추천 프리셋을 추가했습니다.
- 프리셋은 설정만 저장하며 이미지 파일, 이미지 데이터, data URL, canvas, blob, 생성 결과, 로컬 파일 경로를 저장하지 않습니다.
- 프리셋을 불러온 뒤에도 기존 출력 크기 검증과 큰 출력 경고 정책을 그대로 사용합니다.

검증 내용:
- preset 관련 JavaScript syntax check가 통과했습니다.
- `tests/test-cases.html` inline script parse가 통과했습니다.
- Node VM에서 save/load/delete/import/export, invalid JSON 처리, stale preset 정규화, private image/path field 제외를 확인했습니다.
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색에서 문제가 없었습니다.

제한 사항:
- 이 환경에서는 headless Edge/Chrome이 GPU process initialization 실패로 page 실행 전에 종료되어 전체 browser assertion count는 기록하지 못했습니다.

## 문서 최신 상태

2026-07-24 최신 검증은 `111 / 111 cases passed.`와 browser console error/warning 0건입니다. 바로 위의 GPU 초기화 실패는 과거 v1.1 milestone 기록이며 현재 상태를 의미하지 않습니다. 이번 실행에서 남은 미검증 항목은 직접 `file://` 탐색과 Aseprite desktop/CLI 외부 open/save입니다.
