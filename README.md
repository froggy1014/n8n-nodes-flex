# n8n-nodes-flex

> English | [한국어](README.ko.md)

An **unofficial** n8n community node for the [flex Open API](https://developers.flex.team) — flex.team, a Korean HR platform.

> **Disclaimer**: This is an unofficial, community-maintained package. It is **not affiliated with, endorsed by, or sponsored by Flex Inc. (플렉스 주식회사 / flex.team)**. "flex" is used solely to identify the third-party service this node integrates with. The flex Open API is a paid add-on; each workspace admin issues their own API credentials.

It wraps the flex API endpoints that teams typically call with repeated HTTP Request nodes into a single node with **per-resource dropdowns**, improving reusability, discoverability, and maintainability.

> **Status: all 21 read endpoints implemented**, grouped into 6 resources. The flex Open API is read-only, so this covers the full surface.

## Why a node?

| | Copy-pasted HTTP Request | Community node |
|---|---|---|
| Auth | Token logic per workflow | One credential |
| Discoverability | Dig through docs | Resource/operation dropdowns |
| API changes | Edit every workflow | Fix node once, republish |
| Mistake-proofing | Fails at runtime | Field types & required flags enforced in UI |

## Authentication

flex offers `client_credentials` and `refresh_token` grants. Refresh tokens **rotate on every use**, which cannot be stored in a static n8n credential — so this node supports **client_credentials only**.

1. In flex: Settings → **Open API settings** → Add → choose **Client Credential**
2. Copy the issued **Client ID / Client Secret** (the secret is shown only once)
3. In n8n: Credentials → **flex Open API** → paste

Under the hood: `POST /v2/auth/realms/open-api/protocol/openid-connect/token` issues an access token, injected as `Authorization: Bearer`. n8n caches the token.

## Implemented operations (21)

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

Per-resource definitions live under `nodes/Flex/descriptions/` (one file per resource).

## Constraints (flex Open API)

- **Read-only.** Creating or changing attendance/leave records is only possible in the flex web/app, not via API.
- **Rate limit: 1 req/sec.** Throttle bulk lookups in your workflow.
- **Period queries max 31 days.**
- Records without configured codes (employee number, org code, …) are omitted from responses.
- In-progress (not yet ended) work entries are not returned.

## Local testing

```bash
npm install
npm run build

# link into your local n8n custom directory
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom && npm link n8n-nodes-flex   # or symlink dist
npx n8n   # http://localhost:5678
```

In the n8n UI search for **flex** → attach a credential → smoke-test with Department > Get All.

## Self-hosted deployment

- **A. Community Nodes UI** — install from npm via Settings → Community Nodes. Requires `N8N_COMMUNITY_PACKAGES_ENABLED=true` (default on in 2.x).
- **B. `N8N_CUSTOM_EXTENSIONS` mount** — inject the built `dist` into the container (custom image or initContainer).

## Project layout

```
credentials/FlexOpenApiApi.credentials.ts   client_credentials auth
nodes/Flex/Flex.node.ts                      node assembly (resource switch + descriptions)
nodes/Flex/descriptions/
  common.ts        shared field builders (employeeNumbers, date/period)
  Department.ts    JobItem.ts    User.ts
  WorkSchedule.ts  TimeOff.ts    Holiday.ts
scripts/check-drift.sh           llms.txt drift detection
.flex-api/llms.txt               docs baseline snapshot
.github/workflows/flex-api-drift.yml   daily check → auto PR
```

## Extending (adding new endpoints)

Add an entry to the operation array in the matching `descriptions/*.ts`.
Endpoint specs are available as OpenAPI JSON at `https://developers.flex.team/reference/<slug>.md`.

## Maintenance: docs drift detection

flex does not publish a unified OpenAPI spec URL, so the docs index [`llms.txt`](https://developers.flex.team/llms.txt) serves as the drift-watch surface. A daily GitHub Actions cron runs `scripts/check-drift.sh` to diff against the baseline → on change, opens a PR updating the baseline. **This is a notification trigger, not an auto-codefix** — updating the node itself stays a human decision.

## License

[MIT](LICENSE)
