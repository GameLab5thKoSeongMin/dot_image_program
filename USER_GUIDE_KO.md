# 사용자 가이드

## 1. 프로그램 개요
이 프로그램은 PNG, JPG, JPEG 이미지를 작은 픽셀 아이콘으로 변환하는 로컬 웹앱입니다.

기본값은 `32x32`, `median`, `PNG`, palette limit `off`입니다.

## 2. 실행 방법
`index.html` 파일을 브라우저에서 직접 열면 실행됩니다.

브라우저에서 직접 열기가 제한되면 프로젝트 폴더에서 다음 명령을 실행한 뒤 `http://localhost:8000/`을 여세요.

```bash
python -m http.server 8000
```

## 3. 사용 방법
1. `index.html`을 엽니다.
2. 파일 선택 버튼을 누르거나 이미지를 드래그해서 입력합니다.
3. preset 크기를 선택하거나 width/height를 직접 입력합니다.
4. sampling 방식을 `median`, `average`, `center` 중에서 선택합니다.
5. 출력 형식을 `PNG`, `JPG`, `Aseprite` 중에서 선택합니다.
6. palette limit을 선택합니다. 기존 동작을 원하면 `off`로 둡니다.
7. `custom`을 선택한 경우 2부터 256 사이의 색상 수를 입력합니다.
8. 미리보기와 팔레트 요약을 확인합니다.
9. 다운로드 버튼으로 결과 파일을 저장합니다.

## 4. Palette Limit
palette limit은 tile conversion 이후에 적용되는 후처리입니다.

```txt
input image -> tile conversion -> palette limit -> preview/export
```

visible RGB 색상만 palette count에 포함합니다. 완전 투명 픽셀은 색상 수에 포함하지 않습니다. 반투명 visible 픽셀은 RGB만 제한하고 alpha는 최대한 유지합니다.

## 5. Palette Mode
- `off`: palette limit을 적용하지 않습니다. 기본값입니다.
- `auto`: 출력 크기에 따라 추천 색상 수를 자동 적용합니다.
- `4`, `8`, `16`, `32`, `64`, `128`, `256`: 지정한 색상 수로 제한합니다.
- `custom`: 사용자가 직접 색상 수를 입력합니다.

## 6. Auto 추천 규칙
- 16x16 이하: 4색
- 24x24 이하: 8색
- 32x32 이하: 16색
- 48x48 이하: 16색
- 64x64 이하: 32색
- 64x64보다 큼: 32색

가로와 세로 중 더 큰 값을 기준으로 판단합니다.

## 7. 출력 형식
- PNG: 투명도를 보존합니다.
- JPG: 투명도를 저장할 수 없으므로 흰색 배경으로 합성합니다.
- Aseprite: `.aseprite` 바이너리 파일을 생성합니다.

## 8. 파일명 규칙
palette `off`:

```txt
sample_32x32_median.png
```

palette 적용:

```txt
sample_32x32_median_p16.png
sample_64x64_average_p32.jpg
sample_48x32_center_p8.aseprite
```

## 9. 주의사항
- `custom` palette count는 2 이상 256 이하만 허용됩니다.
- JPG는 투명도를 보존하지 못합니다.
- dithering과 외부 palette import는 이번 버전에 포함되지 않았습니다.
- `.aseprite`는 RGBA 방식으로 export합니다. indexed color 방식은 아닙니다.
