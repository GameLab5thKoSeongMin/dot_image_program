# 테스트 요약

## 1. 테스트 목적
프로그램이 PNG/JPG/JPEG 입력, 32x32 tile median 변환, 투명 PNG 처리, 미리보기, 다운로드 요구사항을 만족하는지 검증했습니다.

## 2. 주요 테스트 결과
- PNG 입력 검증: Pass, headless Edge 앱 흐름에서 확인
- JPG/JPEG 입력 검증: Pass, headless Edge 앱 흐름에서 확인
- 잘못된 파일 형식 거부: Pass
- 32x32 결과 canvas 생성: Pass
- tile median 알고리즘 사용 여부: Pass
- 32x32보다 작은 이미지 처리: Pass
- 매우 큰 이미지 처리: Pass
- 가로로 긴 이미지 처리: Pass
- 세로로 긴 이미지 처리: Pass
- 완전 투명 이미지 처리: Pass
- 다운로드 버튼 초기 비활성화: Pass
- 드래그 앤 드롭 입력: Pass, `DataTransfer` drop 이벤트로 확인
- 다운로드 파일명: Pass, `dropped_32x32.png`로 확인
- 테스트 페이지: Pass, `10 / 10 cases passed.`
- 손상된 이미지 처리: Pass, 오류 메시지와 다운로드 비활성 상태 확인
- 모바일 레이아웃: Pass, 390px 폭에서 가로 overflow 없음

## 3. 실패한 테스트
현재 기록된 실패 테스트는 없습니다.

## 4. 알고리즘 검증 요약
`src/imageProcessor.js`에서 `ImageData`를 직접 순회하며 타일별 픽셀을 수집하고, 각 채널의 median 값을 계산합니다. 결과는 32x32 `ImageData`에 직접 기록됩니다. 따라서 단순 resize 방식이 아닙니다.

## 5. 다운로드 결과 검증
다운로드에 사용되는 canvas는 변환 알고리즘이 생성한 32x32 canvas입니다. 앱은 `canvas.toBlob`으로 PNG를 만들고, 파일명은 `original_name_32x32.png` 또는 기본 파일명으로 생성합니다. headless Edge 검증에서 다운로드 이벤트가 발생했고 파일명이 `dropped_32x32.png`로 제안되는 것을 확인했습니다.

## 6. 남은 리스크
- 브라우저에서 실제 파일 저장 동작은 사용자 클릭이 필요하므로 자동 테스트 범위가 제한됩니다.
- 매우 큰 이미지는 처리 중 짧은 지연이 있을 수 있습니다.
