# 사용자 가이드

## 1. 프로그램 개요
이 프로그램은 PNG, JPG, JPEG 이미지를 픽셀 아이콘으로 변환하는 로컬 브라우저 앱입니다.

기본값은 `32x32`, `median`, `PNG`, palette limit `off`입니다.

변환은 단순 리사이즈가 아닙니다. 원본 이미지를 출력 Width와 Height에 맞는 타일로 나누고, 각 타일의 대표 색상을 계산한 뒤 필요하면 palette limit을 적용합니다.

## 2. 실행 방법
`index.html` 파일을 브라우저에서 직접 열면 실행됩니다.

브라우저에서 직접 열기가 제한되면 프로젝트 폴더에서 다음 명령을 실행한 뒤 `http://localhost:8000/`으로 접속하세요.

```bash
python -m http.server 8000
```

## 3. 기본 사용 방법
1. `index.html`을 엽니다.
2. `파일 선택`을 누르거나 이미지를 드래그해서 업로드합니다.
3. Width와 Height preset을 각각 선택합니다.
4. 직접 숫자를 입력하려면 `Custom size`를 켭니다.
5. 이미지 업로드 후 `Custom size`를 켜면 숫자 입력칸은 원본 너비/높이로 자동 설정됩니다.
6. sampling 방식으로 `median`, `average`, `center`, `dominant` 중 하나를 선택합니다.
7. 결과 미리보기 상단의 Output 선택에서 `PNG`, `JPG`, `Aseprite` 중 하나를 선택합니다.
8. palette limit을 선택합니다. 기존 동작을 원하면 `off`로 둡니다.
9. palette `custom`을 선택한 경우 2부터 256 사이의 색상 수를 입력합니다.
10. 큰 출력처럼 명시 변환이 필요한 경우 결과 미리보기 상단의 `미리보기 갱신` 버튼을 누릅니다.
11. 미리보기, 결과 요약, palette summary를 확인합니다.
12. `다운로드` 버튼으로 결과 파일을 저장합니다.

## 4. Width / Height 선택
Custom size가 꺼져 있을 때 Width와 Height는 다음 preset으로 선택합니다.

```txt
Width: 16 / 32 / 64 / 128 / 256
Height: 16 / 32 / 64 / 128 / 256
```

기본값은 Width `32`, Height `32`입니다.

원본 이미지보다 큰 preset은 이미지 업로드 후 비활성화됩니다.

## 5. Custom Size
`Custom size`는 기본적으로 꺼져 있습니다.

꺼져 있을 때:
- Width/Height preset 버튼이 보입니다.
- 숫자 입력칸은 숨겨지고 비활성화됩니다.

켜져 있을 때:
- preset 버튼이 숨겨집니다.
- `Custom Width`, `Custom Height` 입력칸이 표시됩니다.
- 이미지가 이미 업로드되어 있으면 입력값은 원본 너비/높이로 설정됩니다.

예를 들어 원본 이미지가 `512x384`이면 Custom size를 켰을 때 입력칸은 `512`, `384`가 됩니다. 이 상태에서 `미리보기 갱신`을 누르면 `512x384` 결과를 만들 수 있습니다.

## 6. 출력 크기 정책
고정 `256x256` 제한은 없습니다.

검증 규칙은 다음과 같습니다.
- Width는 정수여야 합니다.
- Height는 정수여야 합니다.
- Width는 1 이상이어야 합니다.
- Height는 1 이상이어야 합니다.
- Width는 원본 이미지 너비를 넘을 수 없습니다.
- Height는 원본 이미지 높이를 넘을 수 없습니다.

원본 이미지가 충분히 크면 256보다 큰 출력도 가능합니다.

## 7. 큰 출력 크기 경고
출력 픽셀 수가 크면 warning banner가 표시됩니다.

이 경고는 변환을 막는 오류가 아닙니다. 다만 큰 출력은 시간이 걸릴 수 있으므로 자동 반복 변환을 피하고, 결과 미리보기 상단의 `미리보기 갱신` 버튼으로 명시적으로 변환합니다.

## 8. Sampling Mode
- `median`: 타일 안 visible 픽셀의 채널별 median 값을 사용합니다.
- `average`: 타일 안 visible 픽셀의 채널별 평균값을 사용합니다.
- `center`: 타일 중심 픽셀을 사용합니다.
- `dominant`: 타일 안 visible 픽셀을 RGB bucket으로 묶고, 가장 많이 나온 bucket의 평균 RGBA를 사용합니다.

## 9. 미리보기
이미지를 업로드하기 전에는 깨진 이미지 아이콘이 보이지 않고 안내 placeholder가 표시됩니다.

변환 결과가 생성되기 전에도 result placeholder가 표시됩니다.

미리보기 배경은 투명도를 확인하기 쉬운 checkerboard 형태입니다.

결과 미리보기는 다음 zoom 옵션을 제공합니다.
- `Fit`
- `Actual`
- `8x`
- `16x`

## 10. Palette Limit
palette limit은 tile conversion 이후에 적용되는 후처리입니다.

```txt
input image -> tile conversion -> palette limit -> preview/export
```

palette `off`는 기존 alpha 동작을 유지합니다.

palette를 켜면 alpha가 기본적으로 `0` 또는 `255`로 정리됩니다.
- alpha가 투명 기준보다 낮으면 `0`
- alpha가 투명 기준 이상이면 `255`

이 처리는 반투명 alpha 값이 너무 많아져 unique RGBA 색상 수가 폭증하는 문제를 줄입니다.

## 11. Palette Mode
- `off`: palette limit을 적용하지 않습니다. 기본값입니다.
- `auto`: 출력 크기에 따라 추천 색상 수를 자동 적용합니다.
- `4`, `8`, `16`, `32`, `64`, `128`, `256`: 지정한 색상 수로 제한합니다.
- `custom`: 사용자가 직접 색상 수를 입력합니다.

## 12. 출력 형식
- PNG: 투명도를 보존합니다.
- JPG: 투명도를 저장할 수 없으므로 흰색 배경으로 합성합니다.
- Aseprite: `.aseprite` 바이너리 파일을 생성합니다.

출력 형식 선택은 결과 미리보기 상단에 있어 화면 아래로 내려가지 않아도 확인할 수 있습니다.

## 13. 파일명 규칙
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

Custom source-size 출력은 실제 숫자 크기가 파일명에 들어갑니다.

```txt
sample_512x384_median.png
```

## 14. 주의사항
- palette `custom` 색상 수는 2 이상 256 이하만 허용됩니다.
- JPG는 투명도를 보존하지 않습니다.
- dithering과 external palette import는 포함되어 있지 않습니다.
- `.aseprite` export는 RGBA 방식이며 indexed color 방식은 아닙니다.
- 매우 큰 출력은 브라우저 메인 스레드에서 처리되므로 시간이 걸릴 수 있습니다.
