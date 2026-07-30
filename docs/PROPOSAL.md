# 건의: flex Open API n8n 커뮤니티 노드 도입

## 요약

사내 n8n에서 HR팀이 flex API를 HTTP Request 노드로 반복 호출 중. 이를 전용 커뮤니티 노드
(`n8n-nodes-flex`)로 대체해 **인증 단일화 · 발견성 · 유지보수 단일 지점**을 확보하자는 제안.
조회 엔드포인트 21개 전체 구현한 동작 패키지가 이미 있음.

## 문제 (현재)

- flex 호출이 워크플로마다 HTTP Request 복붙 → **토큰 발급/갱신 로직이 곳곳에 중복**
- 어떤 엔드포인트가 있는지 알려면 개발자 문서를 매번 뒤져야 함 (발견성 낮음)
- flex API가 바뀌면 **모든 워크플로를 수동으로** 찾아 고쳐야 함
- 사번·날짜 등 파라미터 오타가 런타임에야 발견됨

## 해결 (제안)

| 항목 | HTTP Request 복붙 | `n8n-nodes-flex` |
|---|---|---|
| 인증 | 워크플로마다 토큰 로직 | credential 1개 (client_credentials) |
| 발견성 | 문서 검색 | resource/operation 드롭다운 |
| API 변경 대응 | 전 워크플로 수동 수정 | 노드 1회 수정 → 재배포로 전체 반영 |
| 실수 방지 | 런타임 실패 | 필드 타입·필수값 UI 강제 |
| 유지보수 추적 | 없음 | changelog 드리프트 자동 감지 PR |

## 구현 현황

- **6 resource / 21 operation** — flex 조회 API 전 범위 (Department, Job Item, User, Work Schedule, Time Off, Holiday)
- **인증** — flex `client_credentials` grant. Client ID/Secret만 credential에 입력, 나머지 자동
- **빌드·로드 검증 완료.** 실 flex 조회 검증은 사내 Client Credential 발급 후 진행 필요
- **드리프트 감시** — GitHub Actions가 매일 flex 문서 변경 감지 → baseline 갱신 PR 자동 생성

## 배포 경로 (셀프호스팅 k3s)

- **A. Community Nodes UI** — 사내 npm registry publish → n8n Settings에서 설치 (`N8N_COMMUNITY_PACKAGES_ENABLED`, 2.x 기본 on)
- **B. `N8N_CUSTOM_EXTENSIONS` 마운트** — 빌드 산출물을 컨테이너 이미지/볼륨에 주입 (GitOps StatefulSet)

## 리스크 / 검토 필요

1. **보안** — flex Client Secret을 사내 시크릿 관리(ESO/Infisical)로 주입. 노드는 credential 참조만.
2. **Rate limit** — flex는 1 req/sec. 대량 조회 워크플로는 스로틀 설계 필요 (노드가 강제하진 않음, README 명시).
3. **유지보수 주인** — 드리프트 PR 검토 담당 지정. flex API 변경 빈도 낮아 부담 작음.
4. **회전형 refresh_token 미지원** — 의도적. n8n 정적 credential과 안 맞아 client_credentials만 지원.

## 다음 단계

1. 사내 Client Credential 발급 → 실 조회 스모크 테스트 (Department > Get All)
2. HR 파일럿 워크플로 1개 이관 → 검증
3. 배포 경로(A/B) 확정 → 사내 배포
4. 기존 HTTP 워크플로 점진 이관
