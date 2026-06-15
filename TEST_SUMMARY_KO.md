# 테스트 요약

## 1. 테스트 목적
확장된 Pixel Icon Generator가 기존 32x32 median PNG 동작을 유지하면서 새 기능을 정상 지원하는지 검증했습니다.

## 2. 주요 테스트 결과
- 기본 32x32 median PNG: Pass
- PNG/JPG/JPEG 입력 유지: Pass
- 16x16, 24x24, 32x32, 48x48, 64x64 변환: Pass
- 48x32, 8x12 custom 변환: Pass
- `median`, `average`, `center` sampling: Pass
- 원본보다 큰 출력 크기 차단: Pass
- 256 초과 출력 크기 차단: Pass
- 작은 이미지에서 큰 preset 비활성화: Pass
- PNG export: Pass
- JPG export: Pass
- JPG 흰색 배경 합성: Pass
- JPG 투명도 경고와 경고 닫기: Pass
- `.aseprite` binary export: Pass
- `.aseprite` magic/header/dimension 구조 검증: Pass
- `.aseprite`가 PNG 이름 변경이 아님: Pass
- 경고 배너 표시: Pass
- 모바일 390px 레이아웃: Pass
- 테스트 페이지: Pass, `31 / 31 cases passed.`

## 3. 실패한 테스트
현재 기록된 실패 테스트는 없습니다.

## 4. 알고리즘 검증 요약
변환은 `outputWidth`와 `outputHeight`에 맞춰 원본 이미지를 타일로 나누고, 각 타일의 대표색을 `median`, `average`, `center` 중 선택한 방식으로 계산합니다. 결과는 새 `ImageData`에 직접 기록됩니다.

## 5. 다운로드 결과 검증
다운로드 파일명은 크기, sampling mode, 확장자를 포함합니다.

예시:

```txt
sample_32x32_median.png
sample_64x64_average.jpg
sample_64x64_average.aseprite
```

PNG/JPG 다운로드 이벤트와 파일명을 Headless Edge에서 확인했습니다. `.aseprite`는 브라우저 테스트에서 header magic, frame magic, dimensions, color depth를 확인했습니다.

## 6. 남은 리스크
- `.aseprite` 파일을 실제 Aseprite 데스크톱 앱에서 열어보는 외부 검증은 아직 수행하지 못했습니다.
- 매우 큰 이미지는 처리 중 UI가 잠시 멈출 수 있습니다.
