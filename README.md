<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/froggy1014/n8n-nodes-flex/main/nodes/Flex/flex.dark.svg">
    <img src="https://raw.githubusercontent.com/froggy1014/n8n-nodes-flex/main/nodes/Flex/flex.svg" alt="flex" width="88" height="88">
  </picture>
</p>

<h1 align="center">n8n-nodes-flex</h1>

<p align="center">
  Unofficial <a href="https://n8n.io">n8n</a> community node for the
  <a href="https://developers.flex.team"><b>flex Open API</b></a> (flex.team HR platform)<br>
  Departments, members, attendance, time off, and holidays — straight into your workflows.
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

> English | [한국어](README.ko.md)

**All 21 read endpoints** of the flex Open API, grouped into 6 resources — the API is read-only, so this
covers the full surface. A daily CI job diffs the official docs and opens a PR when anything changes, so the
node never silently drifts from the API.

> ⚠️ Not affiliated with, endorsed by, or sponsored by Flex Inc. (플렉스 주식회사 / flex.team). The flex name and
> logo are used here only to identify the API this node talks to. The flex Open API is a paid add-on; each
> workspace admin issues their own API credentials.

---

## ✨ Features

| Category        | What you get                                                                                   |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Coverage**    | All 21 read endpoints — departments, job items, users, work schedules, time off, holidays       |
| **Auth**        | One `client_credentials` credential; access tokens issued and refreshed automatically on expiry |
| **Rate limit**  | Built-in throttle honoring flex's 1 req/sec limit, plus backoff retry on `429`                  |
| **Batching**    | More than 20 employee numbers / department codes? Auto-split into API-legal chunks and merged   |
| **Pagination**  | **Return All** toggle follows `hasNext`/`nextPageKey` to fetch every page for you               |
| **Mock Data**   | Sample responses from the API docs with **no credential** — build workflows offline             |
| **Fault modes** | `continueOnFail` support and clear validation errors before a request ever leaves n8n           |
| **AI-ready**    | `usableAsTool: true` — attach it directly to an AI Agent as a tool                              |

---

## 📦 Installation

### n8n Community Nodes (recommended)

1. Open **Settings → Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-flex`
4. Click **Install**

### npm (self-hosted)

```bash
npm install n8n-nodes-flex
```

Alternatively mount the built `dist` via `N8N_CUSTOM_EXTENSIONS` (custom image or initContainer).

---

## 🔑 Credentials

flex offers `client_credentials` and `refresh_token` grants. Refresh tokens **rotate on every use** and cannot
live in a static n8n credential — so this node supports **client_credentials only**.

1. In flex: Settings → **Open API settings** → Add → choose **Client Credential**
2. Copy the issued **Client ID / Client Secret** (the secret is shown only once)
3. In n8n: **Credentials → New → flex Open API** → paste

| Field             | Description                                              |
| ----------------- | -------------------------------------------------------- |
| **Client ID**     | Issued with the Client Credential method in flex settings |
| **Client Secret** | Shown only once right after it is issued                  |

Under the hood the credential calls `POST /v2/auth/realms/open-api/protocol/openid-connect/token`, stores the
access token, injects it as `Authorization: Bearer`, and re-issues it automatically when it expires (401). The
credential ships a test request, so **Test** verifies the pair before you save it.

---

## 📚 Operations

| Resource          | Operation                 | Endpoint                                                                    |
| ----------------- | ------------------------- | --------------------------------------------------------------------------- |
| **Department**    | Get All                   | `GET /v2/departments/all`                                                    |
| **Department**    | Get Heads                 | `GET /v2/departments/heads?departmentCodes=`                                 |
| **Job Item**      | Get All                   | `GET /v2/job-items/all`                                                      |
| **User**          | Get Employee Numbers      | `GET /v2/users/employee-numbers` — paginated, **Return All** supported       |
| **User**          | Get Masters               | `GET /v2/user-masters?employeeNumbers=`                                      |
| **User**          | Get Departments           | `GET /v2/users/departments?employeeNumbers=` (`searchDateTime`)              |
| **User**          | Get Leave of Absence      | `GET /v2/users/leave-of-absence?employeeNumbers=`                            |
| **User**          | Get Changes by Date       | `GET /v2/users/changes/dates/{date}` — paginated, **Return All** supported   |
| **User**          | Get Family Details        | `GET /v2/users/family-details?employeeNumbers=`                              |
| **User**          | Get Cost Centers          | `GET /v2/users/cost-centers?employeeNumbers=`                                |
| **User**          | Get Bank Accounts         | `GET /v2/users/bank-accounts?employeeNumbers=`                               |
| **User**          | Get Business Places       | `GET /v2/users/business-places?employeeNumbers=`                             |
| **Work Schedule** | Get by Date               | `GET /v2/users/work-schedules/dates/{date}`                                  |
| **Work Schedule** | Get by Period             | `GET /v2/users/work-schedules/dates/{beginDate}/{endDate}`                   |
| **Work Schedule** | Get Clock Events          | `GET /v2/users/work-clock-events/dates/{beginDate}/{endDate}`                |
| **Work Schedule** | Get With Clocks by Date   | `GET /v2/users/work-schedules-with-work-clock/dates/{date}`                  |
| **Work Schedule** | Get With Clocks by Period | `GET /v2/users/work-schedules-with-work-clock/dates/{beginDate}/{endDate}`   |
| **Time Off**      | Get Uses by Date          | `GET /v2/users/time-off-uses/dates/{date}`                                   |
| **Time Off**      | Get Uses by Period        | `GET /v2/users/time-off-uses/dates/{beginDate}/{endDate}`                    |
| **Time Off**      | Get Annual Buckets        | `GET /v2/users/time-off-buckets/annual?employeeNumbers=`                     |
| **Holiday**       | Get All                   | `GET /v2/holidays?from=&to=`                                                 |

All `employeeNumbers` operations take a comma-separated list; the node splits anything over flex's 20-per-request
limit into multiple calls and merges the responses back into one item.

---

## 🚀 Quick Start

### Example: full member roster, then their master records

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

**Return All** walks every page of the roster; the second node then fans the full list through
`/v2/user-masters` in chunks of 20, one second apart, and hands you a single merged item.

---

## 🧪 Mock Data mode

Every operation has a **Mock Data** toggle. Turn it on and the node returns the sample response from the flex
API docs — **no credential, no network call**.

Use it to wire up branches, expressions, and downstream nodes before your workspace admin issues API keys,
then flip it off.

---

## ⚠️ API constraints (flex side)

- **Read-only.** Creating or changing attendance/leave records is only possible in the flex web/app, not via API.
- **Rate limit 1 req/sec** — the node throttles for you, but plan for it in bulk workflows: 1,000 members ≈ 50 calls ≈ 1 minute.
- **Period queries span at most 31 days.**
- Records without configured codes (employee number, org code, …) are omitted from responses.
- In-progress (not yet ended) work entries are not returned.

---

## 🏗 Project layout

```
credentials/FlexOpenApiApi.credentials.ts   client_credentials auth + auto token refresh
nodes/Flex/Flex.node.ts                     generic executor: throttle / chunking / pagination / mock
nodes/Flex/request.ts                       resource+operation → request spec mapping
nodes/Flex/descriptions/
  common.ts        shared field builders (employeeNumbers, date/period)
  Department.ts    JobItem.ts    User.ts
  WorkSchedule.ts  TimeOff.ts    Holiday.ts
nodes/Flex/mocks/                           docs-example responses for Mock Data mode
scripts/check-drift.sh                      llms.txt drift detection
.flex-api/llms.txt                          docs baseline snapshot
.github/workflows/flex-api-drift.yml        daily check → auto PR
.github/workflows/release.yml               tag push → npm publish with provenance
```

---

## 🔄 Staying in sync with the API

flex publishes no unified OpenAPI spec URL or changelog; the docs index
[`llms.txt`](https://developers.flex.team/llms.txt) is the closest thing to one.

The **flex API drift watch** workflow re-fetches it **daily**. If anything changed — endpoint added, parameter
edited — it opens a PR with the diff against the stored baseline. This is a notification trigger, not an
auto-codefix: updating the node stays a human decision.

Per-endpoint OpenAPI JSON is available at `https://developers.flex.team/reference/<slug>.md` when you need
exact schemas.

---

## 🛠 Development

```bash
npm install --ignore-scripts   # skips the isolated-vm native build; not needed for tsc/eslint
npm run build                  # tsc → copy icons + mocks + codex
npm run dev                    # tsc watch mode
npm run lint                   # eslint-plugin-n8n-nodes-base
npm run format                 # prettier
```

### Local testing

```bash
npm run build
mkdir -p ~/.n8n/custom
cd ~/.n8n/custom && npm link n8n-nodes-flex   # or symlink dist
npx n8n                                        # http://localhost:5678
```

In the n8n UI search for **flex** → attach a credential → smoke-test with **Department → Get All**
(or flip on **Mock Data** and skip the credential).

---

## 📋 Requirements

- **n8n** with community nodes enabled
- **Node.js** ≥ 20.15
- **flex workspace** with the Open API add-on and a Client Credential pair

---

## 🤝 Contributing

PRs welcome. Two rules:

1. New endpoint = an entry in the operation array of the matching `descriptions/*.ts`, plus a case in
   `request.ts`. Grab the exact schema from the per-endpoint OpenAPI JSON.
2. Run `npm run build && npm run lint` before you push; the release workflow runs the same thing.

🐛 Found a bug? [Open an issue](https://github.com/froggy1014/n8n-nodes-flex/issues/new)

---

## 📄 License

[MIT](LICENSE)

## 👤 Author

**froggy1014** — [github.com/froggy1014](https://github.com/froggy1014)

## 🔗 Links

- [npm package](https://www.npmjs.com/package/n8n-nodes-flex)
- [GitHub repository](https://github.com/froggy1014/n8n-nodes-flex)
- [flex Open API docs](https://developers.flex.team)
- [n8n community nodes](https://docs.n8n.io/integrations/community-nodes/)
