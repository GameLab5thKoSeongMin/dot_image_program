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
3. `너비`와 `높이` 프리셋을 각각 선택합니다.
4. 직접 숫자를 입력하려면 `사용자 지정 크기`를 켭니다.
5. sampling 방식으로 `median`, `average`, `center`, `dominant` 중 하나를 선택합니다.
6. `팔레트 제한`을 선택합니다. 기존 동작을 원하면 `off`로 둡니다.
7. `팔레트 소스`는 기본 `자동 생성`을 사용하거나, 고정 색상 매핑이 필요하면 `기본 제공` 또는 `가져오기`를 선택합니다.
8. `가져오기`에서는 HEX 목록을 붙여넣거나 로컬 `.txt` / `.hex` 파일을 불러온 뒤 `팔레트 적용`을 누릅니다.
9. dithering은 palette mapping이 켜진 상태에서만 사용합니다. 기본값은 `off`입니다.
10. 결과 미리보기 상단 `출력 형식`에서 `PNG`, `JPG`, `Aseprite` 중 하나를 선택합니다.
11. 필요한 경우 결과 미리보기 상단의 `미리보기 갱신`을 누릅니다.
12. 원본 보정이 필요하면 접힌 `전처리`에서 밝기, 대비, 채도, 선명하게, 배경 제거를 설정합니다.
13. 외곽선이 필요하면 접힌 `아이콘 보조`에서 외곽선을 선택합니다.
14. 결과 패널의 접힌 `팔레트 편집기`를 열어 결과 색상을 확인합니다.
15. 색상표를 선택한 뒤 `HEX 복사`, `색상 교체`, `색상 병합`을 사용할 수 있습니다.
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

## 6. 팔레트 소스
- `자동 생성`: 기본값입니다. 기존 median-cut 팔레트 제한을 사용합니다.
- `기본 제공`: `grayscale4`, `gameboyLike4`, `picoLike16`, `warm8`, `cool8` 중 하나를 선택합니다.
- `가져오기`: HEX 색상 목록을 붙여넣거나 로컬 `.txt` / `.hex` 파일에서 불러옵니다.

HEX는 `#fff`, `ffffff`, `#ff0000, #00ff00` 형식을 지원합니다. 중복 색상은 입력 순서를 유지하면서 제거됩니다. 유효한 고유 색상이 2개 이상 256개 이하여야 합니다.

Built-in과 Imported는 보이는 픽셀을 가장 가까운 palette 색상으로 매핑합니다. 투명 픽셀은 투명하게 유지되고, 매핑이 활성화되면 alpha는 `0` 또는 `255`로 정규화됩니다.

palette import는 로컬에서만 처리됩니다. URL 가져오기와 `.gpl` parsing은 지원하지 않습니다.

## 7. 팔레트 편집기
팔레트 편집기는 기본적으로 접혀 있으며 현재 최종 canvas의 visible RGB를 분석합니다.

표시 정보:
- color chip
- HEX
- 사용 pixel 수
- visible pixel 기준 사용 비율
- 전체 visible pixel 수
- 투명 pixel 수

사용 방법:
1. 색상표를 선택합니다.
2. `HEX 복사`로 선택 색상을 복사합니다.
3. `교체할 HEX`에 색상을 입력하고 `색상 교체`를 누르면 선택 색상과 정확히 일치하는 visible RGB가 교체됩니다.
4. `병합 대상`을 선택하고 `색상 병합`을 누르면 선택 색상이 대상 색상으로 합쳐집니다.

Replace와 Merge는 현재 alpha를 유지하고 transparent pixel은 변경하지 않습니다. 편집 결과는 최종 `resultCanvas`에 반영되므로 PNG/JPG/Aseprite export에도 그대로 사용됩니다.

설정을 변경하거나 다시 변환하면 수동 palette 편집 결과는 초기화됩니다. 이 정책은 팔레트 편집기 안에 표시됩니다.

## 8. 전처리 / 배경 제거
전처리는 기본적으로 접혀 있습니다.

중립 기본값:
- brightness: `0`
- contrast: `0`
- saturation: `0`
- sharpen: `off`
- 배경 제거: `off`

brightness, contrast, saturation은 visible source RGB에만 적용하고 alpha는 유지합니다. sharpen은 `low`, `medium`을 지원합니다.

배경 제거를 켜면 제거 색상과 허용 오차 `0`~`255`를 설정할 수 있습니다. 선택 색상과의 RGB 거리가 허용 오차 이내인 visible source pixel은 투명해집니다. 원래 transparent pixel은 유지됩니다.

배경 제거는 밝기/대비/채도/sharpen보다 먼저 적용되고, 모든 preprocess는 tile conversion 전에 실행됩니다.

## 9. 아이콘 보조 / 외곽선
외곽선 모드:
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
- 브라우저 clipboard 권한이 차단되면 `HEX 복사`가 실패할 수 있습니다. 선택된 HEX는 화면에 계속 표시됩니다.
- 팔레트 편집기에는 undo/redo와 fuzzy color matching이 없습니다.
- preprocess, sharpen, outline은 브라우저 main thread에서 실행됩니다.
- 배경 제거는 RGB 거리 기반이며 AI 배경 제거가 아닙니다.
- outline은 1px 8방향 레이어만 지원합니다.

## 14. 최종 검증 상태
- 2026-07-11 최종 브라우저 테스트 결과: `110 / 110 cases passed.`
- 브라우저 콘솔 오류: 0건
- 실제 앱 PNG/JPG/JPEG 입력, 드래그앤드롭, 잘못된 파일, 손상 이미지 처리: Pass
- 기본 상태: `32x32 / median / palette off / PNG`
- 생성 예제 결과 파일명: `example_skill_badge_32x32_median_p16.png`
- PNG/JPG/Aseprite 최종 canvas export: Pass
- JPG 투명 영역 흰색 합성: Pass
- Aseprite binary 구조와 32-bit RGBA 출력: Pass
- 1280x720 4패널 및 약 390x844 단일 열·가로 넘침 없음: Pass
- 직접 `file://` 실행 재검증: 브라우저 제어 보안 정책으로 미수행
- Aseprite 데스크톱 앱/CLI에서 직접 열기 및 다시 저장하기 검증: 미수행

---

## v1.0.0 Web Worker / fallback 안내

v1.0.0에서는 큰 이미지 변환 중 UI 멈춤을 줄이기 위해 선택적 Web Worker 변환 경로를 추가했습니다.

동작 방식:
- 브라우저에서 Web Worker를 사용할 수 있으면 preprocess, tile conversion, palette/dithering, palette 분석, outline 처리를 worker에서 수행합니다.
- source image 로딩과 source `ImageData` 추출은 호환성을 위해 main thread에서 수행합니다.
- PNG/JPG/Aseprite export 준비는 v1.0.0에서도 main thread에서 수행합니다.
- `file://` 환경에서 worker가 차단되면 warning banner로 안내하고 기존 main-thread 변환으로 자동 fallback합니다.
- worker 변환 중에는 처리 단계가 status에 표시되고, `취소` 버튼으로 진행 중인 worker 변환을 중단할 수 있습니다.

권장 실행 방법:
```bash
python -m http.server 8000
```

그 다음 `http://localhost:8000/`으로 접속하면 worker 동작이 더 안정적입니다. `index.html` 직접 열기도 계속 지원됩니다.
## v1.1 설정 프리셋

`설정 프리셋` 섹션에서 현재 변환 설정을 저장하고 다시 불러올 수 있습니다.

- `현재 설정 저장`: 현재 크기, 샘플링, 출력 형식, 팔레트, 디더링, 전처리, 배경 제거, 외곽선 설정을 저장합니다.
- `프리셋 불러오기`: 선택한 프리셋을 화면의 설정 컨트롤에 적용합니다.
- `프리셋 삭제`: 사용자가 저장한 프리셋을 삭제합니다. 기본 제공 프리셋은 삭제되지 않습니다.
- `기본값`: 기본 `32x32`, `median`, `PNG`, palette `off` 상태로 되돌립니다.
- `JSON 내보내기` / `JSON 가져오기`: 저장한 사용자 프리셋을 JSON으로 내보내거나 가져옵니다.

프리셋에는 이미지 파일, 이미지 데이터, 로컬 파일 경로, 생성된 결과 canvas가 저장되지 않습니다. 프리셋을 불러온 뒤에도 현재 원본 이미지 크기보다 큰 출력 크기는 기존 검증 규칙에 따라 경고 또는 차단됩니다.

## v1.2 예제 갤러리 / 품질 검사

`예제 / 품질 검사` 섹션에는 코드로 생성되는 예제 이미지가 들어 있습니다. 외부 이미지나 네트워크 파일을 사용하지 않습니다.

- 예제 카드를 누르면 예제 이미지가 원본으로 로드되고, 그 예제에 맞는 설정이 자동으로 적용됩니다.
- 적용된 뒤에는 기존 변환 흐름을 사용하므로 출력 크기 검증, palette 처리, outline, export 정책이 그대로 유지됩니다.
- `품질 검사 실행`은 생성 예제들이 기본 변환 검사를 통과하는지 확인하는 개발용 점검 버튼입니다.

예제 기능은 기본 시작 상태를 바꾸지 않습니다. 앱을 처음 열었을 때 기본값은 계속 `32x32`, `median`, `PNG`, palette `off`입니다.

## v1.3 레이어 모드

`레이어 모드`는 기본적으로 꺼져 있습니다. 여러 이미지를 각각 별도 레이어로 변환해야 할 때만 켜세요.

- 레이어 모드를 켠 뒤 여러 PNG/JPG/JPEG 파일을 추가할 수 있습니다.
- 각 파일은 하나의 layer가 되며, 이름 변경, 순서 변경, 표시/숨김, 삭제가 가능합니다.
- 모든 layer는 현재 전역 설정을 공유합니다. v1.3에서는 layer별 개별 설정이나 layer별 위치 조정은 지원하지 않습니다.
- 각 layer는 먼저 독립적으로 변환되고, 그 다음 visible layer만 top-left 기준으로 합성되어 preview에 표시됩니다.
- PNG export는 visible processed layer의 flattened composite를 저장합니다.
- JPG export는 같은 composite를 흰 배경 위에 합성해 저장합니다.
- Aseprite export는 visible processed layer만 별도 RGBA layer/cel로 저장합니다. 숨긴 layer는 v1.3 Aseprite export에서 제외됩니다.

레이어 모드가 꺼져 있으면 기존 단일 이미지 변환 흐름이 그대로 사용됩니다.
