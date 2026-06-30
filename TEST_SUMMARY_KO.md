# 테스트 요약

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
