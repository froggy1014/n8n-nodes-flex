# n8n-nodes-flex (한국어)

> [English](README.md) | 한국어

[flex Open API](https://developers.flex.team) — 국내 HR 플랫폼 **flex.team** 을 n8n에서 쓰기 위한 **비공식** 커뮤니티 노드.

> **고지**: 이 패키지는 커뮤니티가 만든 **비공식** 노드입니다. **플렉스 주식회사(flex.team)와 제휴·후원 관계가 없습니다.** "flex"라는 이름은 이 노드가 연동하는 서비스를 가리키기 위해서만 사용합니다. flex Open API는 유료 부가 상품이며, 각 워크스페이스 관리자가 직접 발급한 인증 정보를 사용해야 합니다.

HTTP Request 노드로 매번 복붙하던 flex API 호출을, **리소스·오퍼레이션 드롭다운** 하나로 정리합니다.

> **상태: 조회 엔드포인트 21개 전체 구현.** 6개 리소스로 그룹화. flex Open API는 read-only만 제공하므로 이게 전 범위입니다.

## 왜 노드로 쓰나

| | HTTP Request 복붙 | 커뮤니티 노드 |
|---|---|---|
| 인증 | 워크플로마다 토큰 로직 | credential 한 곳 |
| 발견성 | 문서 뒤져야 함 | 리소스/오퍼레이션 드롭다운 |
| API 변경 대응 | 전 워크플로 수동 수정 | 노드 1회 수정 → 재배포 |
| 실수 방지 | 런타임에야 터짐 | 필드 타입·필수값 UI에서 강제 |

## 설치

n8n → **Settings → Community Nodes → Install** → `n8n-nodes-flex` 입력.

셀프호스팅이라면 `N8N_COMMUNITY_PACKAGES_ENABLED=true` 가 필요합니다 (n8n 2.x 기본 on).
AI Agent의 툴로 쓰려면 `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` 도 켜야 합니다.

## 인증 설정

flex는 `client_credentials` 와 `refresh_token` 두 가지 grant를 제공합니다. refresh_token은 호출할 때마다 **회전(rotate)** 되어 n8n의 정적 credential에 다시 저장할 수 없으므로, 이 노드는 **client_credentials 전용**입니다.

1. flex → **설정 → Open API 설정 → 추가하기** → **Client Credential** 방식 선택
2. 발급된 **Client ID / Client Secret** 복사 (Secret은 발급 직후 1회만 표시됩니다)
3. n8n → **Credentials → flex Open API** → 붙여넣기

내부 동작: `POST /v2/auth/realms/open-api/protocol/openid-connect/token` 으로 access token을 발급받아 `Authorization: Bearer` 헤더에 주입합니다. 토큰은 n8n이 캐시합니다.

## 구현된 오퍼레이션 (21개)

| 리소스 | 오퍼레이션 | 설명 | 엔드포인트 |
|---|---|---|---|
| Department | Get All | 부서 전체 조회 | `GET /v2/departments/all` |
| Department | Get Heads | 부서장 조회 | `GET /v2/departments/heads?departmentCodes=` |
| Job Item | Get All | 직무 항목 전체 조회 | `GET /v2/job-items/all` |
| User | Get Employee Numbers | 사번 목록 조회 | `GET /v2/users/employee-numbers` (pageSize·nextPageKey) |
| User | Get Masters | 구성원 기본정보 조회 | `GET /v2/user-masters?employeeNumbers=` |
| User | Get Departments | 구성원 소속 부서 조회 | `GET /v2/users/departments?employeeNumbers=` (searchDateTime) |
| User | Get Leave of Absence | 휴직 정보 조회 | `GET /v2/users/leave-of-absence?employeeNumbers=` |
| User | Get Changes by Date | 날짜별 인사 변동 조회 | `GET /v2/users/changes/dates/{date}` (pageKey·pageSize) |
| User | Get Family Details | 가족사항 조회 | `GET /v2/users/family-details?employeeNumbers=` |
| User | Get Cost Centers | 코스트센터 조회 | `GET /v2/users/cost-centers?employeeNumbers=` |
| User | Get Bank Accounts | 급여 계좌 조회 | `GET /v2/users/bank-accounts?employeeNumbers=` |
| User | Get Business Places | 사업장 조회 | `GET /v2/users/business-places?employeeNumbers=` |
| Work Schedule | Get by Date | 날짜별 근무일정 조회 | `GET /v2/users/work-schedules/dates/{date}?employeeNumbers=` |
| Work Schedule | Get by Period | 기간별 근무일정 조회 | `GET /v2/users/work-schedules/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Work Schedule | Get Clock Events | 출퇴근 타각 기록 조회 | `GET /v2/users/work-clock-events/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Work Schedule | Get With Clocks by Date | 날짜별 근무일정+타각 조회 | `GET /v2/users/work-schedules-with-work-clock/dates/{date}?employeeNumbers=` |
| Work Schedule | Get With Clocks by Period | 기간별 근무일정+타각 조회 | `GET /v2/users/work-schedules-with-work-clock/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Time Off | Get Uses by Date | 날짜별 휴가 사용 조회 | `GET /v2/users/time-off-uses/dates/{date}?employeeNumbers=` |
| Time Off | Get Uses by Period | 기간별 휴가 사용 조회 | `GET /v2/users/time-off-uses/dates/{beginDate}/{endDate}?employeeNumbers=` |
| Time Off | Get Annual Buckets | **연차 부여·잔여 조회** | `GET /v2/users/time-off-buckets/annual?employeeNumbers=` |
| Holiday | Get All | 휴일 조회 | `GET /v2/holidays?from=&to=` |

> 노드 UI는 영어로 표기됩니다 (n8n 커뮤니티 노드 검증 요건).

## Mock Data 모드

각 오퍼레이션에는 flex 공식 문서의 예시 응답이 내장되어 있습니다.
노드의 **Mock Data** 토글을 켜면 credential 없이도 샘플 응답이 나오므로, 실 호출 전에 워크플로 구조를 먼저 잡을 수 있습니다.

## 제약사항 (flex Open API 공통)

- **전부 read-only.** 근태·휴가 등록/변경은 flex 웹·앱에서만 가능하고 API로는 불가합니다.
- **Rate limit 1 req/sec.** 대량 조회 시 워크플로에서 스로틀링이 필요합니다.
- **기간 조회는 최장 31일.**
- 코드(사번·조직코드 등)가 설정되지 않은 데이터는 응답에 포함되지 않습니다.
- 아직 종료되지 않은(진행 중) 근무는 조회되지 않습니다.

## 활용 예시

- **연차 잔여 리마인더** — `Time Off > Get Annual Buckets` 로 잔여 연차를 조회해 메일·Slack으로 발송
- **근태 이상 감지** — `Work Schedule > Get Clock Events` 로 타각 누락을 찾아 알림
- **조직도 동기화** — `Department > Get All` + `User > Get Departments` 를 사내 위키·DB에 반영
- **입퇴사 트래킹** — `User > Get Changes by Date` 로 인사 변동을 매일 수집

## 이슈 · 기여

버그나 엔드포인트 추가 요청은 [GitHub Issues](https://github.com/froggy1014/n8n-nodes-flex/issues)로 남겨주세요.

## 라이선스

[MIT](LICENSE)
