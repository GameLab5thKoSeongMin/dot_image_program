# 테스트 요약

## 1. 테스트 목적
palette limit 확장이 기존 기능을 깨지 않고 정상 동작하는지 검증했습니다.

## 2. 주요 테스트 결과
- 기본 `32x32`, `median`, `png`, palette `off`: Pass
- palette `off`: Pass
- palette `auto`: Pass
- palette `4`, `8`, `16`, `32`: Pass
- palette `custom`: Pass
- custom count 2 미만 차단: Pass
- custom count 256 초과 차단: Pass
- auto palette 16x16 -> 4색: Pass
- auto palette 24x24 -> 8색: Pass
- auto palette 32x32 -> 16색: Pass
- auto palette 48x32 -> 16색: Pass
- auto palette 64x64 -> 32색: Pass
- palette 적용 후 visible RGB color count 제한: Pass
- transparent pixel 보존: Pass
- one-color image 처리: Pass
- fully transparent image 처리: Pass
- median + palette: Pass
- average + palette: Pass
- center + palette: Pass
- PNG/JPG/`.aseprite` export와 palette-limited 결과 연동: Pass
- palette filename suffix `_pN`: Pass
- warning banner: Pass
- 테스트 페이지: Pass, `48 / 48 cases passed.`

## 3. 실패한 테스트
현재 기록된 실패 테스트는 없습니다.

## 4. 알고리즘 검증 요약
palette limit은 tile conversion 이후 적용됩니다. visible pixel만 추출하고 median cut으로 palette를 만든 뒤, 각 visible pixel의 RGB를 가장 가까운 palette 색상으로 매핑합니다. alpha는 유지합니다.

## 5. 다운로드 결과 검증
palette off일 때는 기존 파일명 규칙을 유지합니다.

```txt
sample_32x32_median.png
```

palette가 적용되면 `_pN` suffix가 추가됩니다.

```txt
sample_32x32_median_p16.png
sample_32x32_average_p8.jpg
sample_48x32_center_p8.aseprite
```

## 6. 남은 리스크
- dithering은 없습니다.
- 외부 palette import는 없습니다.
- `.aseprite` export는 indexed color가 아니라 RGBA mode입니다.
- 큰 이미지에서는 처리 시간이 길어질 수 있습니다.
