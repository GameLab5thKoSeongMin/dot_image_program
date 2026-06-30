# 사용자 가이드

## 1. 프로그램 개요
이 프로그램은 PNG, JPG, JPEG 이미지를 픽셀 아이콘으로 변환하는 로컬 브라우저 앱입니다.

기본값은 `32x32`, `median`, `PNG`, palette limit `off`, dithering `off`입니다.

변환은 단순 리사이즈가 아닙니다. 원본 이미지를 출력 Width와 Height에 맞는 타일로 나누고, 각 타일의 대표 색상을 계산한 뒤 필요한 경우 palette limit과 dithering을 적용합니다.

## 2. 실행 방법
브라우저에서 `index.html` 파일을 직접 열면 실행됩니다.

브라우저에서 직접 열기가 제한되면 프로젝트 폴더에서 아래 명령을 실행한 뒤 `http://localhost:8000/`으로 접속하세요.

```bash
python -m http.server 8000
```

## 3. 기본 사용 방법
1. `index.html`을 엽니다.
2. `파일 선택`을 누르거나 이미지를 드래그해서 업로드합니다.
3. Width와 Height preset을 각각 선택합니다.
4. 직접 숫자를 입력하려면 `Custom size`를 켭니다.
5. sampling 방식으로 `median`, `average`, `center`, `dominant` 중 하나를 선택합니다.
6. palette limit을 선택합니다. 기존 동작을 원하면 `off`로 둡니다.
7. Palette source는 기본 `Generated`를 사용하거나, 고정 색상 매핑이 필요하면 `Built-in` 또는 `Imported`를 선택합니다.
8. `Imported`에서는 HEX 목록을 붙여넣거나 로컬 `.txt` / `.hex` 파일을 불러온 뒤 `Apply palette`를 누릅니다.
9. dithering은 palette mapping이 켜진 상태에서만 사용합니다. 기본값은 `off`입니다.
10. 결과 미리보기 상단 Output에서 `PNG`, `JPG`, `Aseprite` 중 하나를 선택합니다.
11. 필요한 경우 결과 미리보기 상단의 `미리보기 갱신`을 누릅니다.
12. 원본 보정이 필요하면 접힌 `Preprocess`에서 밝기, 대비, 채도, sharpen, 배경 제거를 설정합니다.
13. 외곽선이 필요하면 접힌 `Icon Assist`에서 outline을 선택합니다.
14. 결과 panel의 접힌 `Palette Editor`를 열어 결과 색상을 확인합니다.
15. swatch를 선택한 뒤 `Copy HEX`, `Replace color`, `Merge color`를 사용할 수 있습니다.
16. 결과 미리보기, 파일 정보, palette summary를 확인합니다.
17. `다운로드` 버튼으로 결과 파일을 저장합니다.

## 4. Dithering
v0.6.0부터 dithering 옵션이 추가되었습니다.

지원 모드:
- `off`: 기본값입니다. 기존 palette mapping 결과를 유지합니다.
- `floydSteinberg`: visible pixel에 RGB 오차 확산을 적용합니다.
- `bayer4x4`: 4x4 Bayer matrix를 사용한 ordered dithering을 적용합니다.

Dithering은 palette mapping이 켜진 상태에서만 적용됩니다. generated palette limit 또는 built-in/imported fixed palette mapping과 함께 사용할 수 있습니다.

palette mode가 `off`인 상태에서 dithering을 선택하면 변환은 계속 가능하지만 dithering은 건너뛰고 warning banner가 표시됩니다.

투명 픽셀은 dithering 이후에도 투명하게 유지됩니다. palette가 켜진 경우 기존 정책대로 alpha는 `0` 또는 `255`로 정규화됩니다.

v0.6.0에서는 dithering strength 조절 UI가 없습니다. strength는 고정값 `1`로 동작합니다.

## 5. Palette Limit
palette limit은 tile conversion 이후에 적용되는 후처리입니다.

```txt
input image -> tile conversion -> palette limit -> optional dithering -> preview/export
```

palette `off`는 기존 alpha 동작을 유지합니다.

palette를 켜면 alpha가 기본적으로 `0` 또는 `255`로 정리됩니다.
- alpha가 투명 기준보다 낮으면 `0`
- alpha가 투명 기준 이상이면 `255`

## 6. Palette Source
- `Generated`: 기본값입니다. 기존 median-cut palette limit을 사용합니다.
- `Built-in`: `grayscale4`, `gameboyLike4`, `picoLike16`, `warm8`, `cool8` 중 하나를 선택합니다.
- `Imported`: HEX 색상 목록을 붙여넣거나 로컬 `.txt` / `.hex` 파일에서 불러옵니다.

HEX는 `#fff`, `ffffff`, `#ff0000, #00ff00` 형식을 지원합니다. 중복 색상은 입력 순서를 유지하면서 제거됩니다. 유효한 고유 색상이 2개 이상 256개 이하여야 합니다.

Built-in과 Imported는 보이는 픽셀을 가장 가까운 palette 색상으로 매핑합니다. 투명 픽셀은 투명하게 유지되고, 매핑이 활성화되면 alpha는 `0` 또는 `255`로 정규화됩니다.

palette import는 로컬에서만 처리됩니다. URL 가져오기와 `.gpl` parsing은 지원하지 않습니다.

## 7. Palette Editor
Palette Editor는 기본적으로 접혀 있으며 현재 최종 canvas의 visible RGB를 분석합니다.

표시 정보:
- color chip
- HEX
- 사용 pixel 수
- visible pixel 기준 사용 비율
- 전체 visible pixel 수
- 투명 pixel 수

사용 방법:
1. swatch를 선택합니다.
2. `Copy HEX`로 선택 색상을 복사합니다.
3. `Replace HEX`에 색상을 입력하고 `Replace color`를 누르면 선택 색상과 정확히 일치하는 visible RGB가 교체됩니다.
4. `Merge target`을 선택하고 `Merge color`를 누르면 선택 색상이 target 색상으로 합쳐집니다.

Replace와 Merge는 현재 alpha를 유지하고 transparent pixel은 변경하지 않습니다. 편집 결과는 최종 `resultCanvas`에 반영되므로 PNG/JPG/Aseprite export에도 그대로 사용됩니다.

설정을 변경하거나 다시 변환하면 수동 palette 편집 결과는 초기화됩니다. 이 정책은 Palette Editor 안에 표시됩니다.

## 8. Preprocess / 배경 제거
Preprocess는 기본적으로 접혀 있습니다.

중립 기본값:
- brightness: `0`
- contrast: `0`
- saturation: `0`
- sharpen: `off`
- 배경 제거: `off`

brightness, contrast, saturation은 visible source RGB에만 적용하고 alpha는 유지합니다. sharpen은 `low`, `medium`을 지원합니다.

배경 제거를 켜면 제거 색상과 허용 오차 `0`~`255`를 설정할 수 있습니다. 선택 색상과의 RGB 거리가 허용 오차 이내인 visible source pixel은 투명해집니다. 원래 transparent pixel은 유지됩니다.

배경 제거는 밝기/대비/채도/sharpen보다 먼저 적용되고, 모든 preprocess는 tile conversion 전에 실행됩니다.

## 9. Icon Assist / Outline
Outline 모드:
- `off`: 기본값
- `1px black`: black outline
- `1px dark`: visible 결과 색상의 평균에서 만든 dark outline

Outline은 transparent pixel 중 visible pixel의 8방향 이웃에만 추가됩니다. 기존 visible pixel은 덮어쓰지 않습니다.

Outline은 palette와 수동 edit 뒤에 다시 생성되어 preview와 PNG/JPG/Aseprite export에 반영됩니다. palette limit을 사용한 경우 outline 색상 1개가 추가될 수 있습니다.

## 10. 출력 크기 정책
고정 `256x256` 제한은 없습니다.

검증 규칙:
- Width는 1 이상의 정수여야 합니다.
- Height는 1 이상의 정수여야 합니다.
- Width는 원본 이미지 너비보다 클 수 없습니다.
- Height는 원본 이미지 높이보다 클 수 없습니다.

원본 이미지가 충분히 크면 256보다 큰 출력도 가능합니다.

큰 출력은 warning banner가 표시될 수 있습니다. 이 경고는 명시적 변환을 막지 않습니다.

## 11. 출력 형식
- PNG: 투명도를 보존합니다.
- JPG: 투명도를 저장할 수 없으므로 흰색 배경으로 합성합니다.
- Aseprite: `.aseprite` RGBA binary 파일로 출력합니다. indexed-color 방식은 아닙니다.

## 12. 파일명 규칙
palette `off`:

```txt
sample_32x32_median.png
```

palette 적용:

```txt
sample_32x32_median_p16.png
sample_64x64_average_p32.jpg
sample_48x32_dominant_p8.aseprite
```

Dithering을 켜도 파일명에는 별도 suffix를 붙이지 않습니다.

## 13. 주의사항
- palette `custom` 색상 수는 2 이상 256 이하만 허용됩니다.
- dithering은 palette mapping이 활성화된 상태에서만 적용됩니다.
- `.aseprite` export는 RGBA 방식이며 indexed color 방식이 아닙니다.
- 매우 큰 출력은 브라우저 메인 스레드에서 처리되므로 시간이 걸릴 수 있습니다.
- 브라우저 clipboard 권한이 차단되면 `Copy HEX`가 실패할 수 있습니다. 선택된 HEX는 화면에 계속 표시됩니다.
- Palette Editor에는 undo/redo와 fuzzy color matching이 없습니다.
- preprocess, sharpen, outline은 브라우저 main thread에서 실행됩니다.
- 배경 제거는 RGB 거리 기반이며 AI 배경 제거가 아닙니다.
- outline은 1px 8방향 레이어만 지원합니다.

## 14. 최종 검증 상태
- 최종 브라우저 테스트 결과: `94 / 94 cases passed.`
- 기본 변환 결과 파일명: `sample_32x32_median.png`
- PNG/JPG/Aseprite 최종 canvas export: Pass
- JPG 투명 영역 흰색 합성: Pass
- Aseprite binary 구조와 32-bit RGBA 출력: Pass
- Aseprite 데스크톱 앱/CLI에서 직접 열기 및 다시 저장하기 검증: 미수행
