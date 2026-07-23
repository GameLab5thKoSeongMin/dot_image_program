# 테스트 요약

## 2026-07-24 포트폴리오 점검 결과

- 결과: `111 / 111 cases passed.`
- 브라우저 콘솔 오류·경고: 0건
- 전체 앱 JavaScript 문법 검사: 통과
- 테스트 페이지 inline script parse: 통과
- `git diff --check`: 통과
- 기본값 `32x32 / median / palette off / PNG`: 통과
- PNG/JPG/JPEG 실제 입력, 드래그 앤 드롭, 잘못된 파일과 손상 파일 처리: 통과
- Worker 성공, fallback, 취소, main-thread 결과 동등성: 통과
- 생성 예제 변환과 PNG 다운로드 활성화: 통과
- 1280x720 4패널 화면, 결과 패널 무스크롤 다운로드 노출: 통과
- 390x844 실제 앱 통합 frame의 단일 열 배치와 가로 넘침 방지: 통과
- 문서 메타 정보, 로컬 처리 안내, 제목 구조, 독립 옵션 열: 통과

미검증 항목:
- 브라우저 제어 보안 정책으로 차단된 직접 `file://` 탐색
- Aseprite 데스크톱/CLI에서의 외부 open/save

## 1. 테스트 목적
이번 테스트는 v0.9.0 Preprocess / Icon Assist 추가 이후 M5 최종 안정화 시점에도 기존 Pixel Icon Generator의 기본 변환, UI, palette, editor, export 기능이 유지되는지 확인하기 위한 것입니다.

기본 동작은 계속 `32x32`, `median`, `PNG`, palette `off`, dithering `off`여야 합니다.

## 2. 실행 결과
- 테스트 페이지: `tests/test-cases.html?autorun=1`
- 실행 브라우저: 로컬 브라우저 자동화(`127.0.0.1` 로컬 HTTP)
- 결과: Pass
- 통과 수: `94 / 94 cases passed.`
- 실패 수: `0`
- `index.html` 실제 로딩과 Dithering selector 표시: Pass
- 초기 summary `32x32 / median / palette off / PNG`: Pass

## 3. 주요 회귀 테스트 결과
- 기본 `32x32`, `median`, `png`, palette `off`: Pass
- PNG/JPG/JPEG 입력 흐름: Pass
- drag-and-drop 관련 기존 테스트 흐름: Pass
- Width/Height preset `16`, `32`, `64`, `128`, `256`: Pass
- Custom size toggle 기본 off: Pass
- Custom size off에서 숫자 입력 숨김/비활성화: Pass
- Custom size on에서 숫자 입력 표시/활성화: Pass
- 원본보다 큰 preset 비활성화: Pass
- 출력 크기 검증: Pass
- 256보다 큰 출력 허용 조건: Pass
- 큰 출력 warning banner: Pass
- 결과 미리보기 상단 `미리보기 갱신`: Pass
- 결과 미리보기 상단 Output format selector: Pass
- sampling `median`, `average`, `center`, `dominant`: Pass
- palette `off`, `auto`, numeric, `custom`: Pass
- custom palette count 2 미만/256 초과 차단: Pass
- transparent pixel 보존: Pass
- palette-on alpha `0/255` 정규화: Pass
- PNG/JPG/`.aseprite` export: Pass
- palette filename suffix `_pN`: Pass
- warning banner: Pass
- preview placeholder: Pass

## 4. v0.6.0 Dithering 테스트 결과
- Dithering option list `off`, `floydSteinberg`, `bayer4x4`: Pass
- Dithering 기본값 `off`: Pass
- dithering `off`가 기존 palette mapping 결과를 유지: Pass
- Floyd-Steinberg + palette `16`: Pass
- Bayer 4x4 + palette `16`: Pass
- dithering 후 transparent pixel 보존: Pass
- palette `off` 상태에서 dithering skip: Pass
- dithered PNG export: Pass
- dithered JPG export: Pass
- dithered `.aseprite` export: Pass

## 5. 정적 검증 결과
- JS syntax check: Pass
- ES Module `import/export` 문법 없음: Pass
- browser `alert()` 사용 없음: Pass
- 고정 `drawImage(image, 0, 0, 32, 32)` resize shortcut 없음: Pass
- tile-based conversion 유지: Pass
- palette limit은 tile conversion 이후 후처리로 유지: Pass
- PNG/JPG/`.aseprite` export는 최종 canvas 사용: Pass

## 6. v0.7.0 Palette Source 테스트 결과
- Palette source `generated`, `builtIn`, `imported`: Pass
- 기본 Palette source `generated`: Pass
- generated median-cut 회귀: Pass
- built-in fixed palette mapping: Pass
- pasted HEX imported palette mapping: Pass
- 3자리/6자리 HEX 정규화: Pass
- 중복 HEX 제거와 입력 순서 유지: Pass
- invalid HEX 차단: Pass
- 2개 미만/256개 초과 palette 차단: Pass
- fixed palette transparent pixel 보존: Pass
- imported palette + dithering: Pass
- fixed palette PNG/JPG/Aseprite export: Pass

## 7. v0.8.0 Palette Editor 테스트 결과
- 결과 swatch HEX 표시: Pass
- 사용 pixel 수와 비율 계산: Pass
- transparent pixel 수 별도 계산: Pass
- Copy HEX action 존재와 활성화: Pass
- Replace color exact RGB 교체: Pass
- Replace 후 alpha 보존: Pass
- Merge color 후 visible 색상 수 감소: Pass
- transparent pixel 비가시 상태 유지: Pass
- 새 변환용 Palette Editor reset 동작: Pass
- edited PNG/JPG/Aseprite export: Pass
- `index.html` Palette Editor 기본 접힘과 초기 action 비활성화: Pass

## 8. v0.9.0 Preprocess / Icon Assist 테스트 결과
- neutral preprocess 기본값 회귀: Pass
- brightness visible RGB 변경과 alpha 보존: Pass
- contrast channel separation 증가: Pass
- saturation `-100` grayscale: Pass
- sharpen `medium`: Pass
- background cleanup exact color: Pass
- cleanup tolerance에 따른 near-color 제거: Pass
- 기존 transparent pixel 보존: Pass
- `1px black` outline: Pass
- `1px dark` derived color outline: Pass
- outline visible pixel 비덮어쓰기: Pass
- processed PNG/JPG/Aseprite export: Pass
- `index.html` Preprocess/Icon Assist 기본 접힘과 중립값: Pass

## 9. 남은 제한
- dithering strength 조절 UI는 없습니다. v0.6.0에서는 strength `1` 고정입니다.
- dithering은 palette mapping이 활성화된 상태에서만 적용됩니다.
- palette import는 로컬 HEX text와 `.txt` / `.hex` 파일만 지원합니다.
- clipboard 권한 정책에 따라 Copy HEX가 차단될 수 있습니다.
- Palette Editor는 undo/redo와 fuzzy matching을 지원하지 않습니다.
- preprocess, sharpen, outline은 browser main thread에서 실행됩니다.
- background cleanup은 RGB 거리 기반이며 AI segmentation이 아닙니다.
- outline은 1px 8방향 레이어만 지원합니다.
- `.aseprite` export는 RGBA 방식이며 indexed color 방식이 아닙니다.
- Aseprite 데스크톱 앱/CLI에서 직접 열기 검증은 이 환경에서 수행하지 않았습니다.

## 10. M5 최종 테스트 요약
- 전체 app JS syntax check: Pass
- 정적 정책 검사: Pass
- 브라우저 회귀 테스트: `94 / 94`, 실패 0건
- 초기 placeholder와 broken image 방지 상태: Pass
- Custom size 기본 off와 Width/Height preset 표시: Pass
- sampling `median`, `average`, `center`, `dominant`: Pass
- palette, dithering, palette source, Palette Editor, Preprocess, Icon Assist UI: Pass
- 실제 앱 파일 처리 경로에 생성 PNG 입력: Pass
- 기본 결과 파일명 `sample_32x32_median.png`: Pass
- 32x32 최종 preview와 download 활성화: Pass
- PNG export: Pass
- JPG 흰색 합성 export: Pass
- Aseprite 32-bit RGBA binary export: Pass
- dithering 최종 export 반영: Pass
- built-in/imported palette 최종 export 반영: Pass
- Replace/Merge 최종 export 반영: Pass
- brightness/contrast/saturation/sharpen/cleanup 최종 export 반영: Pass
- black/dark outline 최종 export 반영: Pass
- 남은 미검증 항목: Aseprite 데스크톱 앱/CLI에서 실제 파일 열기 및 다시 저장하기

---

## v1.0.0 M1 테스트 요약

추가된 테스트 범위:
- worker 변환 결과와 main-thread pipeline 결과 비교
- worker fallback signal
- worker cancel 처리
- processing status UI와 cancel 버튼 표시
- default behavior 유지 정적 검증

실행 결과:
- `node --check src/*.js`: Pass
- `node --check tests/testImageFactory.js`: Pass
- `tests/test-cases.html` inline script parse: Pass
- ES Module `import/export`: 발견되지 않음
- browser `alert()`: 발견되지 않음
- 고정 `32x32` resize shortcut: 발견되지 않음

Browser autorun:
- `http://127.0.0.1:8000/tests/test-cases.html?autorun=1`로 Edge와 Chrome headless 실행을 시도했습니다.
- 두 브라우저 모두 GPU process 초기화 실패로 page 실행 전에 종료되었습니다.
- 따라서 이 환경에서는 v1.0.0 browser assertion pass count를 기록하지 못했습니다.
## v1.1.0 M2 설정 프리셋 테스트 요약

결과: 부분 실행 완료.

통과한 항목:
- `src/presetManager.js`, `src/uiController.js`, `src/app.js` syntax check 통과
- `tests/test-cases.html` inline script parse 통과
- Node VM preset manager 검증 통과
- 프리셋 저장, 불러오기, 삭제 동작 확인
- JSON export/import 동작 확인
- 잘못된 JSON이 오류 결과로 처리되는지 확인
- 오래되었거나 일부 field가 빠진 preset이 안전한 기본값 또는 clamp 값으로 정규화되는지 확인
- 이미지 데이터 key와 로컬 경로 key가 저장되지 않는지 확인
- UI restore test가 custom size, sampling, palette source, preprocess, cleanup, outline, output format 적용을 포함하도록 추가됨
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색 문제 없음

제한:
- 이 로컬 환경에서는 headless browser가 GPU process initialization 실패로 page 실행 전에 종료되었습니다.
- 따라서 v1.1.0 browser assertion 총 통과 개수는 기록하지 않았습니다.

## v1.2.0 M3 Example Gallery / QA 테스트 요약

결과: 부분 실행 완료.

통과한 항목:
- `src/exampleGallery.js`, `src/uiController.js`, `src/app.js` syntax check 통과
- `tests/test-cases.html` inline script parse 통과
- Example Gallery UI section 추가 확인
- 예제가 코드 생성 canvas를 사용하고 외부 URL이나 외부 파일을 참조하지 않도록 테스트 추가
- 각 예제에 settings recipe가 있고 생성 원본 크기 안에서 출력 크기가 유효한지 테스트 추가
- 예제 QA conversion 테스트 추가
- 예제 UI render와 click selection fixture 테스트 추가
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색 문제 없음

제한:
- 이 로컬 환경에서는 headless browser가 GPU process initialization 실패로 page 실행 전에 종료되었습니다.
- 따라서 v1.2.0 browser assertion 총 통과 개수는 기록하지 않았습니다.

## v1.3.0 M4 Layered Mode 테스트 요약

결과: 부분 실행 완료.

통과한 항목:
- `src/app.js`, `src/uiController.js`, `src/exporter.js` syntax check 통과
- `tests/test-cases.html` inline script parse 통과
- Layered Mode toggle 기본 off 확인 테스트 추가
- Layered Mode off 상태에서 layer file input disabled 확인 테스트 추가
- layer rename, visibility toggle, reorder, delete callback fixture 테스트 추가
- visible layer composite가 layer 순서대로 합성되는지 테스트 추가
- hidden layer가 composite에서 제외되는지 테스트 추가
- layered Aseprite export가 여러 layer chunk와 cel chunk를 만드는지 테스트 추가
- layered Aseprite binary inspection에서 layer name을 확인하는 테스트 추가
- ES Module `import/export`, browser `alert()`, 고정 `32x32` resize shortcut 정적 검색 문제 없음

제한:
- 이 로컬 환경에서는 headless browser가 GPU process initialization 실패로 page 실행 전에 종료되었습니다.
- 따라서 v1.3.0 browser assertion 총 통과 개수는 기록하지 않았습니다.

## v1.0.0~v1.3.0 M5 최종 안정화 테스트 요약

결과: 사용 가능한 비브라우저 검증 통과.

통과한 항목:
- 모든 app JavaScript 파일 syntax check 통과
- `tests/testImageFactory.js` syntax check 통과
- `tests/test-cases.html` inline script parse 통과
- preset manager Node VM 검증 통과
- ES Module `import/export` 정적 검색 문제 없음
- browser `alert()` 정적 검색 문제 없음
- 고정 `32x32` resize shortcut 정적 검색 문제 없음
- 영어/한국어 문서 업데이트 완료

제한:
- headless Edge/Chrome이 GPU process initialization 실패로 page 실행 전에 종료되어 최종 browser assertion pass count는 기록하지 못했습니다.
- 브라우저 실행이 가능한 환경에서 `tests/test-cases.html?autorun=1`을 다시 실행해야 최종 browser pass count를 확정할 수 있습니다.

## 2026-07-11 최종 안정화·폴리싱 테스트 요약

결과: `110 / 110 cases passed.`

통과한 핵심 항목:
- 모든 app JavaScript와 `tests/testImageFactory.js` syntax check
- `tests/test-cases.html` inline script parse
- Worker script URL 중첩 경로 회귀 테스트
- Worker 성공, 강제 fallback, cancel, main-thread pixel equivalence
- PNG/JPG/JPEG 실제 앱 디코딩·변환
- 실제 drop 이벤트를 통한 드래그앤드롭 변환
- 잘못된 파일과 손상 이미지의 source 초기화 및 warning banner 표시
- 기본 `32x32 / median / palette off / PNG`
- Custom size 기본 off 및 preset/input 표시 전환
- 팔레트, 디더링, 수동 색상 편집, 전처리, 배경 제거, 외곽선
- PNG/JPG/Aseprite blob, 파일명, 투명도, Aseprite binary 구조
- 1280x720 4패널 화면과 약 390x844 단일 열 화면
- 가로 넘침 없음, 중복 ID 없음, 이름 없는 form control 없음, 중첩 interactive control 없음
- 기본·초기화 상태의 깨진 이미지 없음
- browser console error/warning 0건
- ES Module `import/export`, browser `alert()`, output resize shortcut 없음

이번 실행에서 확인하지 못한 항목:
- 직접 `file://` 탐색: 브라우저 제어 보안 정책으로 차단
- Aseprite desktop/CLI 외부 open/save: 실행 파일 미설치

과거 v1.0~v1.3 기록의 GPU 초기화 실패와 2026-07-11의 `110 / 110`은 당시 실행 이력입니다. 최신 브라우저 검증 결과는 문서 상단의 2026-07-24 `111 / 111`입니다.
