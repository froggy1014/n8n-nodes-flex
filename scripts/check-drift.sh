#!/usr/bin/env bash
# flex Open API 문서(llms.txt) 드리프트 감지.
# 저장된 baseline 과 원본을 비교해 변경이 있으면 exit 1 + diff 를 stdout 에 출력.
#
# flex 는 통합 OpenAPI 스펙 URL 을 공개하지 않으므로 문서 인덱스(llms.txt)를
# 드리프트 감시면으로 사용한다. 코드 자동수정이 아니라 "사람에게 알림" 트리거.
set -euo pipefail

SRC_URL="https://developers.flex.team/llms.txt"
BASELINE="$(dirname "$0")/../.flex-api/llms.txt"
LATEST="$(mktemp)"

curl -fsSL "$SRC_URL" -o "$LATEST"

if diff -u "$BASELINE" "$LATEST" > /tmp/flex-drift.diff 2>&1; then
	echo "no-drift"
	rm -f "$LATEST"
	exit 0
fi

echo "=== flex API 문서 변경 감지 ==="
cat /tmp/flex-drift.diff
# baseline 갱신 (CI 가 이 변경을 커밋/PR 로 올림)
cp "$LATEST" "$BASELINE"
rm -f "$LATEST"
exit 1
