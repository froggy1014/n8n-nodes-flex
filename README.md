# n8n-nodes-flex

[flex Open API](https://developers.flex.team) (flex.team HR 플랫폼)를 n8n 커뮤니티 노드로 감싼 패키지.
사내에서 HTTP Request 노드로 반복 호출하던 flex API를 **도구별 드롭다운**으로 정리해 재사용성·발견성·유지보수성을 높이는 것이 목표.

> **상태: 조회 엔드포인트 21개 전체 구현.** 6개 resource로 그룹화. flex Open API는 read-only만 제공하므로 이게 전 범위.

## 왜 노드로?

| | HTTP Request 복붙 | 커뮤니티 노드 |
|---|---|---|
| 인증 | 워크플로마다 토큰 로직 | credential 한 곳 |
| 발견성 | 문서 뒤져야 함 | resource/operation 드롭다운 |
| API 변경 대응 | 전 워크플로 수동 수정 | 노드 1회 수정 → 재배포 |
| 실수 방지 | 런타임에야 터짐 | 필드 타입·필수값 UI 강제 |

## 인증

flex는 `client_credentials` / `refresh_token` 두 grant를 제공하지만, refresh_token은 호출마다 **회전(rotate)** 되어 n8n 정적 credential에 재저장 불가. 따라서 이 노드는 **client_credentials 전용**.

1. flex 설정 → **Open API 설정** → 추가하기 → **Client Credential** 방식 선택
2. 발급된 **Client ID / Client Secret** 복사 (Secret은 발급 직후 1회만 표시)
3. n8n → Credentials → **flex Open API** → 입력

내부 동작: `POST /v2/auth/realms/open-api/protocol/openid-connect/token` 로 access token 발급 → `Authorization: Bearer` 주입. n8n이 토큰을 캐시함.

## 구현된 오퍼레이션 (21개)

| Resource | Operation | Endpoint |
|---|---|---|
| Department | Get All | `GET /v2/departments/all` |
| Department | Get Heads | `GET /v2/departments/heads?departmentCodes=` |
| Job Item | Get All | `GET /v2/job-items/all` |
| User | Get Employee Numbers | `GET /v2/users/employee-numbers` (pageSize·nextPageKey) |
| User | Get Masters | `GET /v2/user-masters?employeeNumbers=` |
| User | Get Departments | `GET /v2/users/departments?employeeNumbers=` (searchDateTime) |
| User | Get Leave of Absence | `GET /v2/users/leave-of-absence?employeeNumbers=` |
| User | Get Changes by Date | `GET /v2/users/changes/dates/{date}` (pageKey·pageSize) |
| User | Get Family Details | `GET /v2/users/family-details?employeeNumbers=` |
| User | Get Cost Centers | `GET /v2/users/cost-centers?employeeNumbers=` |
| User | Get Bank Accounts | `GET /v2/users/bank-accounts?employeeNumbers=` |
| User | Get Business Places | `GET /v2/users/business-places?employeeNumbers=` |
| Work Schedule | Get by Date | `GET /v2/users/work-schedules/dates/{date}?employeeNumbers=` |
| Work Schedule | Get by Period | `GET /v2/users/work-schedules/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Work Schedule | Get Clock Events | `GET /v2/users/work-clock-events/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Work Schedule | Get With Clocks by Date | `GET /v2/users/work-schedules-with-work-clock/dates/{date}?employeeNumbers=` |
| Work Schedule | Get With Clocks by Period | `GET /v2/users/work-schedules-with-work-clock/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Time Off | Get Uses by Date | `GET /v2/users/time-off-uses/dates/{date}?employeeNumbers=` |
| Time Off | Get Uses by Period | `GET /v2/users/time-off-uses/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Time Off | Get Annual Buckets | `GET /v2/users/time-off-buckets/annual?employeeNumbers=` |
| Holiday | Get All | `GET /v2/holidays?from=&to=` |

리소스별 정의는 `nodes/Flex/descriptions/` 하위 파일로 분리 (도구별 명시적 분리).

## 제약 (flex Open API 공통)

- **전부 read-only.** 근무/휴가 등록·변경은 flex 웹/앱에서만. API로 불가.
- **Rate limit 1 req/sec.** 대량 조회 시 워크플로에서 스로틀 필요.
- **기간 조회 최장 31일.**
- 코드(사번·조직코드 등)가 설정 안 된 데이터는 응답에 안 나옴.
- 종료되지 않은(진행 중) 근무는 조회 미지원.

## 로컬 테스트 (셀프호스팅 이전 검증)

```bash
npm install
npm run build

# 로컬 n8n custom 디렉터리에 링크
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom && npm link n8n-nodes-flex   # 또는 dist 심볼릭 링크
npx n8n   # http://localhost:5678
```

n8n UI에서 **flex** 노드 검색 → credential 연결 → Department > Get All 로 스모크 테스트.

## 셀프호스팅(k3s) 배포 경로

- **A. Community Nodes UI** — 사내 npm registry에 publish 후 Settings → Community Nodes에서 설치. `N8N_COMMUNITY_PACKAGES_ENABLED=true` (2.x 기본 on).
- **B. `N8N_CUSTOM_EXTENSIONS` 마운트** — 빌드 `dist`를 컨테이너에 주입 (커스텀 이미지 or initContainer).

## 프로젝트 구조

```
credentials/FlexOpenApiApi.credentials.ts   client_credentials 인증
nodes/Flex/Flex.node.ts                      노드 조립 (resource 선택 + 각 description)
nodes/Flex/descriptions/
  common.ts        공통 필드 빌더 (employeeNumbers, 날짜/기간)
  Department.ts    JobItem.ts    User.ts
  WorkSchedule.ts  TimeOff.ts    Holiday.ts
scripts/check-drift.sh           llms.txt 드리프트 감지
.flex-api/llms.txt               문서 baseline 스냅샷
.github/workflows/flex-api-drift.yml   매일 감지 → PR 자동 생성
```

## 확장 (신규 엔드포인트 추가 시)

해당 resource의 `descriptions/*.ts` 에서 operation 배열에 항목 추가.
엔드포인트 스펙은 `https://developers.flex.team/reference/<slug>.md` 에 OpenAPI JSON으로 존재.

## 유지보수: changelog 드리프트 감지

flex는 통합 OpenAPI 스펙 URL을 공개하지 않으므로 문서 인덱스 [`llms.txt`](https://developers.flex.team/llms.txt)를
드리프트 감시면으로 사용. GitHub Actions cron(매일)이 `scripts/check-drift.sh`로 baseline과 diff →
변경 시 baseline 갱신 PR 자동 생성. **코드 자동수정이 아닌 알림 트리거** — 실제 노드 반영은 사람이 판단.
