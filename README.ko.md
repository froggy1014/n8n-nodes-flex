<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/froggy1014/n8n-nodes-flex/main/nodes/Flex/flex.dark.svg">
    <img src="https://raw.githubusercontent.com/froggy1014/n8n-nodes-flex/main/nodes/Flex/flex.svg" alt="flex" width="88" height="88">
  </picture>
</p>

<h1 align="center">n8n-nodes-flex</h1>

<p align="center">
  <a href="https://developers.flex.team"><b>flex Open API</b></a> (flex.team HR 플랫폼)를 위한
  비공식 <a href="https://n8n.io">n8n</a> 커뮤니티 노드<br>
  조직·구성원·근태·휴가·휴일 데이터를 워크플로로 바로 가져옵니다.
</p>

<p align="center">
  <a href="https://github.com/froggy1014/n8n-nodes-flex/actions/workflows/release.yml"><img src="https://github.com/froggy1014/n8n-nodes-flex/actions/workflows/release.yml/badge.svg" alt="Release"></a>
  <a href="https://github.com/froggy1014/n8n-nodes-flex/actions/workflows/flex-api-drift.yml"><img src="https://github.com/froggy1014/n8n-nodes-flex/actions/workflows/flex-api-drift.yml/badge.svg" alt="API drift watch"></a>
  <a href="https://www.npmjs.com/package/n8n-nodes-flex"><img src="https://img.shields.io/npm/v/n8n-nodes-flex?logo=npm" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/n8n-nodes-flex"><img src="https://img.shields.io/npm/dm/n8n-nodes-flex?logo=npm" alt="npm downloads"></a>
  <a href="https://docs.n8n.io/integrations/community-nodes/"><img src="https://img.shields.io/badge/n8n-community%20node-EA4B71" alt="n8n community node"></a>
  <a href="https://developers.flex.team"><img src="https://img.shields.io/badge/flex%20Open%20API-v2-4353FF" alt="flex Open API v2"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%E2%89%A520.15-green?logo=node.js" alt="Node.js"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.5%2B-blue?logo=typescript" alt="TypeScript"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/froggy1014/n8n-nodes-flex" alt="License"></a>
</p>

> [English](README.md) | 한국어

flex Open API의 **조회 엔드포인트 21개 전체**를 6개 리소스로 구현했습니다 — API가 read-only라 이게 전 범위입니다.
매일 CI가 공식 문서를 diff해서 변경 시 PR을 여니, 노드가 API와 조용히 어긋나는 일이 없습니다.

> ⚠️ 이 패키지는 커뮤니티가 만든 **비공식** 노드로, **플렉스 주식회사(flex.team)와 제휴·후원 관계가 없습니다.**
> "flex" 이름과 로고는 이 노드가 연동하는 서비스를 가리키기 위해서만 사용합니다. flex Open API는 유료 부가
> 상품이며, 각 워크스페이스 관리자가 직접 발급한 인증 정보를 사용해야 합니다.

---

## ✨ 특징

| 분류            | 제공 내용                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------ |
| **커버리지**    | 조회 엔드포인트 21개 전체 — 조직, 직무, 구성원, 근무일정, 휴가, 휴일                        |
| **인증**        | `client_credentials` credential 하나로 끝; access token 자동 발급·만료 시 자동 갱신          |
| **Rate limit**  | flex의 1 req/sec 제한을 노드가 알아서 지킴 + `429` 시 백오프 재시도                          |
| **자동 분할**   | 사번·조직코드 20개 초과 입력 시 API 허용 단위로 나눠 호출하고 응답을 하나로 병합             |
| **페이지네이션**| **Return All** 토글이 `hasNext`/`nextPageKey` 를 따라 전체 페이지를 대신 순회                |
| **Mock Data**   | **credential 없이** 공식 문서의 샘플 응답 반환 — 오프라인으로 워크플로 설계                  |
| **장애 대응**   | `continueOnFail` 지원, 요청이 나가기 전에 잡아주는 명확한 입력 검증 에러                     |
| **AI-ready**    | `usableAsTool: true` — AI Agent의 툴로 바로 연결                                             |

---

## 📦 설치

### n8n Community Nodes (권장)

1. **Settings → Community Nodes** 열기
2. **Install** 클릭
3. `n8n-nodes-flex` 입력
4. **Install** 클릭

셀프호스팅이라면 `N8N_COMMUNITY_PACKAGES_ENABLED=true` 가 필요합니다 (n8n 2.x 기본 on).
AI Agent의 툴로 쓰려면 `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE=true` 도 켜야 합니다.

### npm (셀프호스팅)

```bash
npm install n8n-nodes-flex
```

빌드된 `dist` 를 `N8N_CUSTOM_EXTENSIONS` 로 마운트하는 방법(커스텀 이미지·initContainer)도 있습니다.

---

## 🔑 인증 설정

flex는 `client_credentials` 와 `refresh_token` 두 가지 grant를 제공합니다. refresh_token은 호출할 때마다
**회전(rotate)** 되어 n8n의 정적 credential에 다시 저장할 수 없으므로, 이 노드는 **client_credentials 전용**입니다.

1. flex → **설정 → Open API 설정 → 추가하기** → **Client Credential** 방식 선택
2. 발급된 **Client ID / Client Secret** 복사 (Secret은 발급 직후 1회만 표시됩니다)
3. n8n → **Credentials → New → flex Open API** → 붙여넣기

| 필드              | 설명                                             |
| ----------------- | ------------------------------------------------ |
| **Client ID**     | flex 설정에서 Client Credential 방식으로 발급     |
| **Client Secret** | 발급 직후 1회만 표시                              |

내부 동작: `POST /v2/auth/realms/open-api/protocol/openid-connect/token` 으로 access token을 발급받아
`Authorization: Bearer` 헤더에 주입하고, 만료(401) 시 자동으로 재발급합니다. credential에 테스트 요청이
내장되어 있어 저장 전 **Test** 버튼으로 키 쌍을 검증할 수 있습니다.

---

## 📚 오퍼레이션 (21개)

| 리소스            | 오퍼레이션                | 설명                        | 엔드포인트                                                                 |
| ----------------- | ------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| **Department**    | Get All                   | 부서 전체 조회              | `GET /v2/departments/all`                                                    |
| **Department**    | Get Heads                 | 부서장 조회                 | `GET /v2/departments/heads?departmentCodes=`                                 |
| **Job Item**      | Get All                   | 직무 항목 전체 조회         | `GET /v2/job-items/all`                                                      |
| **User**          | Get Employee Numbers      | 사번 목록 조회              | `GET /v2/users/employee-numbers` — 페이지네이션, **Return All** 지원         |
| **User**          | Get Masters               | 구성원 기본정보 조회        | `GET /v2/user-masters?employeeNumbers=`                                      |
| **User**          | Get Departments           | 구성원 소속 부서 조회       | `GET /v2/users/departments?employeeNumbers=` (`searchDateTime`)              |
| **User**          | Get Leave of Absence      | 휴직 정보 조회              | `GET /v2/users/leave-of-absence?employeeNumbers=`                            |
| **User**          | Get Changes by Date       | 날짜별 인사 변동 조회       | `GET /v2/users/changes/dates/{date}` — 페이지네이션, **Return All** 지원     |
| **User**          | Get Family Details        | 가족사항 조회               | `GET /v2/users/family-details?employeeNumbers=`                              |
| **User**          | Get Cost Centers          | 코스트센터 조회             | `GET /v2/users/cost-centers?employeeNumbers=`                                |
| **User**          | Get Bank Accounts         | 급여 계좌 조회              | `GET /v2/users/bank-accounts?employeeNumbers=`                               |
| **User**          | Get Business Places       | 사업장 조회                 | `GET /v2/users/business-places?employeeNumbers=`                             |
| **Work Schedule** | Get by Date               | 날짜별 근무일정 조회        | `GET /v2/users/work-schedules/dates/{date}`                                  |
| **Work Schedule** | Get by Period             | 기간별 근무일정 조회        | `GET /v2/users/work-schedules/dates/{beginDate}/{endDate}`                   |
| **Work Schedule** | Get Clock Events          | 출퇴근 타각 기록 조회       | `GET /v2/users/work-clock-events/dates/{beginDate}/{endDate}`                |
| **Work Schedule** | Get With Clocks by Date   | 날짜별 근무일정+타각 조회   | `GET /v2/users/work-schedules-with-work-clock/dates/{date}`                  |
| **Work Schedule** | Get With Clocks by Period | 기간별 근무일정+타각 조회   | `GET /v2/users/work-schedules-with-work-clock/dates/{beginDate}/{endDate}`   |
| **Time Off**      | Get Uses by Date          | 날짜별 휴가 사용 조회       | `GET /v2/users/time-off-uses/dates/{date}`                                   |
| **Time Off**      | Get Uses by Period        | 기간별 휴가 사용 조회       | `GET /v2/users/time-off-uses/dates/{beginDate}/{endDate}`                    |
| **Time Off**      | Get Annual Buckets        | **연차 부여·잔여 조회**     | `GET /v2/users/time-off-buckets/annual?employeeNumbers=`                     |
| **Holiday**       | Get All                   | 휴일 조회                   | `GET /v2/holidays?from=&to=`                                                 |

`employeeNumbers` 를 받는 오퍼레이션은 쉼표 구분 목록을 입력합니다. flex의 요청당 20개 제한을 넘으면
노드가 알아서 나눠 호출하고 응답을 하나의 아이템으로 병합합니다.

> 노드 UI는 영어로 표기됩니다 (n8n 커뮤니티 노드 검증 요건).

---

## 🚀 빠른 시작

### 예시: 전체 사번 조회 → 구성원 기본정보

```json
{
	"nodes": [
		{
			"parameters": {
				"resource": "user",
				"operation": "getEmployeeNumbers",
				"returnAll": true
			},
			"type": "n8n-nodes-flex.flex",
			"typeVersion": 1,
			"position": [0, 0],
			"name": "All Employee Numbers",
			"credentials": { "flexOpenApiApi": { "id": "1", "name": "flex account" } }
		},
		{
			"parameters": {
				"resource": "user",
				"operation": "getMasters",
				"employeeNumbers": "={{ $json.employeeNumbers.join(',') }}"
			},
			"type": "n8n-nodes-flex.flex",
			"typeVersion": 1,
			"position": [220, 0],
			"name": "Member Masters",
			"credentials": { "flexOpenApiApi": { "id": "1", "name": "flex account" } }
		}
	],
	"connections": {
		"All Employee Numbers": { "main": [[{ "node": "Member Masters", "type": "main", "index": 0 }]] }
	}
}
```

**Return All** 이 사번 목록의 전체 페이지를 순회하고, 두 번째 노드가 그 목록을 20개 단위·1초 간격으로
`/v2/user-masters` 에 흘려보낸 뒤 병합된 아이템 하나를 돌려줍니다.

### 활용 예시

- **연차 잔여 리마인더** — `Time Off > Get Annual Buckets` 로 잔여 연차를 조회해 메일·Slack으로 발송
- **근태 이상 감지** — `Work Schedule > Get Clock Events` 로 타각 누락을 찾아 알림
- **조직도 동기화** — `Department > Get All` + `User > Get Departments` 를 사내 위키·DB에 반영
- **입퇴사 트래킹** — `User > Get Changes by Date` (Return All) 로 인사 변동을 매일 수집

---

## 🧪 Mock Data 모드

각 오퍼레이션에 **Mock Data** 토글이 있습니다. 켜면 flex 공식 문서의 예시 응답을 반환합니다 —
**credential 불필요, 네트워크 호출 없음**.

관리자가 API 키를 발급해주기 전에 분기·표현식·후속 노드를 먼저 배선해두고, 준비되면 끄면 됩니다.

---

## ⚠️ 제약사항 (flex Open API 공통)

- **전부 read-only.** 근태·휴가 등록/변경은 flex 웹·앱에서만 가능하고 API로는 불가합니다.
- **Rate limit 1 req/sec** — 노드가 대신 지켜주지만, 대량 조회 시 소요 시간 계산 필요: 구성원 1,000명 ≈ 50회 호출 ≈ 1분.
- **기간 조회는 최장 31일.**
- 코드(사번·조직코드 등)가 설정되지 않은 데이터는 응답에 포함되지 않습니다.
- 아직 종료되지 않은(진행 중) 근무는 조회되지 않습니다.

---

## 🏗 프로젝트 구조

```
credentials/FlexOpenApiApi.credentials.ts   client_credentials 인증 + 토큰 자동 갱신
nodes/Flex/Flex.node.ts                     공용 실행기: 스로틀 / 분할 / 페이지네이션 / mock
nodes/Flex/request.ts                       resource+operation → 요청 스펙 매핑
nodes/Flex/descriptions/
  common.ts        공통 필드 빌더 (employeeNumbers, 날짜/기간)
  Department.ts    JobItem.ts    User.ts
  WorkSchedule.ts  TimeOff.ts    Holiday.ts
nodes/Flex/mocks/                           Mock Data 모드용 문서 예시 응답
scripts/check-drift.sh                      llms.txt 변경 감지
.flex-api/llms.txt                          문서 baseline 스냅샷
.github/workflows/flex-api-drift.yml        매일 체크 → 자동 PR
.github/workflows/release.yml               태그 push → provenance npm publish
```

---

## 🔄 API와 싱크 유지

flex는 통합 OpenAPI 스펙 URL이나 changelog를 제공하지 않습니다. 문서 인덱스
[`llms.txt`](https://developers.flex.team/llms.txt) 가 그에 가장 가까운 것입니다.

**flex API drift watch** 워크플로가 **매일** 이를 다시 받아 baseline과 diff합니다. 엔드포인트 추가·파라미터
변경 등 무엇이든 달라지면 diff를 담은 PR이 열립니다. 자동 코드 수정이 아닌 알림 트리거입니다 — 노드 반영
여부는 사람이 판단합니다.

정확한 스키마가 필요하면 엔드포인트별 OpenAPI JSON을 `https://developers.flex.team/reference/<slug>.md` 에서
볼 수 있습니다.

---

## 🛠 개발

```bash
npm install --ignore-scripts   # isolated-vm 네이티브 빌드 스킵 (tsc/eslint에 불필요)
npm run build                  # tsc → 아이콘 + mocks + codex 복사
npm run dev                    # tsc watch 모드
npm run lint                   # eslint-plugin-n8n-nodes-base
npm run format                 # prettier
```

### 로컬 테스트

```bash
npm run build
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom && npm link n8n-nodes-flex   # 또는 dist 심링크
npx n8n                                        # http://localhost:5678
```

n8n UI에서 **flex** 검색 → credential 연결 → **Department → Get All** 로 스모크 테스트
(또는 **Mock Data** 를 켜고 credential 없이).

---

## 📋 요구사항

- 커뮤니티 노드가 활성화된 **n8n**
- **Node.js** ≥ 20.15
- Open API 부가 상품이 활성화된 **flex 워크스페이스** 와 Client Credential 키 쌍

---

## 🤝 기여

PR 환영합니다. 규칙 두 가지:

1. 엔드포인트 추가 = 해당 `descriptions/*.ts` 오퍼레이션 배열에 항목 추가 + `request.ts` 에 case 추가.
   정확한 스키마는 엔드포인트별 OpenAPI JSON에서 가져오세요.
2. push 전에 `npm run build && npm run lint` — release 워크플로가 같은 것을 돌립니다.

🐛 버그 발견? [이슈 열기](https://github.com/froggy1014/n8n-nodes-flex/issues/new)

---

## 📄 라이선스

[MIT](LICENSE)

## 👤 만든 사람

**froggy1014** — [github.com/froggy1014](https://github.com/froggy1014)

## 🔗 링크

- [npm 패키지](https://www.npmjs.com/package/n8n-nodes-flex)
- [GitHub 저장소](https://github.com/froggy1014/n8n-nodes-flex)
- [flex Open API 문서](https://developers.flex.team)
- [n8n 커뮤니티 노드](https://docs.n8n.io/integrations/community-nodes/)
