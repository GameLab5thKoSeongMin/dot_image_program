# 테스트 요약

## 1. 테스트 목적
이번 테스트는 UI/UX 및 출력 크기 정책 변경 후 기존 pixel icon generator 기능이 유지되는지 확인하기 위한 것입니다.

## 2. 주요 테스트 결과
- 기본 `32x32`, `median`, `png`, palette `off`: Pass
- PNG/JPG/JPEG 입력 흐름: Pass
- drag-and-drop 흐름: Pass
- Width 기본값 `32`: Pass
- Height 기본값 `32`: Pass
- Width 옵션 `16`, `32`, `64`, `Original`, `Custom`: Pass
- Height 옵션 `16`, `32`, `64`, `Original`, `Custom`: Pass
- `Custom Width` 숨김/표시 동작: Pass
- `Custom Height` 숨김/표시 동작: Pass
- 이미지 업로드 전 `Original` 비활성화: Pass
- 이미지 업로드 후 `Original` 활성화: Pass
- 원본보다 큰 preset 비활성화: Pass
- width가 원본 너비보다 큰 경우 차단: Pass
- height가 원본 높이보다 큰 경우 차단: Pass
- width `0` 차단: Pass
- height `0` 차단: Pass
- non-integer width 차단: Pass
- non-integer height 차단: Pass
- 원본이 충분히 큰 경우 width 256 초과 허용: Pass
- 원본이 충분히 큰 경우 height 256 초과 허용: Pass
- 원본 크기 출력 허용: Pass
- 큰 출력 크기 warning banner 표시: Pass
- 큰 출력 크기 explicit conversion 허용: Pass
- 초기 preview broken image icon 없음: Pass
- original preview placeholder: Pass
- result preview placeholder: Pass
- failed preview load 처리: Pass
- result preview zoom: Pass
- sampling `median`: Pass
- sampling `average`: Pass
- sampling `center`: Pass
- palette `off`: Pass
- palette `auto`: Pass
- palette `4`, `8`, `16`, `32`: Pass
- palette `custom`: Pass
- custom palette count 2 미만 차단: Pass
- custom palette count 256 초과 차단: Pass
- transparent pixel 보존: Pass
- one-color image 처리: Pass
- fully transparent image 처리: Pass
- PNG export: Pass
- JPG export: Pass
- `.aseprite` export: Pass
- palette filename suffix `_pN`: Pass
- warning banner: Pass
- 테스트 페이지: Pass, `61 / 61 cases passed.`

## 3. 브라우저 앱 검증
Local Edge에서 `index.html`을 열고 실제 앱 흐름을 확인했습니다.

확인 결과:
- 초기 original/result preview `<img>`는 숨겨져 있고 `src`가 없습니다.
- `Custom Width`, `Custom Height`는 처음에 숨겨져 있습니다.
- `Original` 옵션은 이미지 업로드 전 비활성화되어 있습니다.
- `512x384` PNG 업로드 후 기본 결과는 `sample_32x32_median.png`입니다.
- Width/Height `Original` 선택 시 큰 출력 warning banner가 표시됩니다.
- `미리보기 갱신` 후 `sample_512x384_median.png`가 생성됩니다.
- palette `4` 선택 후 `sample_32x32_median_p4.png`가 생성됩니다.

## 4. 실패한 테스트
현재 기록된 실패 테스트는 없습니다.

## 5. 검증 메모
- JS 문법 검사를 통과했습니다.
- ES Module `import/export`를 사용하지 않았습니다.
- browser `alert()`를 사용하지 않았습니다.
- 고정 `32x32` resize shortcut을 사용하지 않았습니다.
- palette limit은 기존처럼 tile conversion 이후에 적용됩니다.
- PNG/JPG/`.aseprite` export는 최종 canvas를 사용합니다.

## 6. 남은 리스크
- 매우 큰 출력은 브라우저 메인 스레드에서 처리되므로 시간이 걸릴 수 있습니다.
- Web Worker는 아직 없습니다.
- dithering과 external palette import는 없습니다.
- `.aseprite` export는 indexed color가 아니라 RGBA mode입니다.
