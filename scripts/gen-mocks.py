#!/usr/bin/env python3
"""flex 개발자 문서의 OpenAPI 스키마에서 필드별 example 을 조립해
각 오퍼레이션의 mock 응답 JSON 을 생성한다. nodes/Flex/mocks/ 에 저장.

flex 는 통합 스펙 URL 이 없어 각 reference 페이지의 .md 안 OpenAPI JSON 을 긁는다.
스키마→예시 규칙: object 는 property.example 사용(없으면 type 기본값), array 는
item 예시 1건 wrap, $ref/allOf 재귀 해석.
"""
import json, re, urllib.request, pathlib, sys

# operation value -> (reference slug, 응답을 꺼낼 http path)
OPS = {
    "department.getAll": ("departments-get-all-departments", "/v2/departments/all"),
    "department.getHeads": ("getdepartmentsheads", "/v2/departments/heads"),
    "jobItem.getAll": ("job-items-get-all-job-items", "/v2/job-items/all"),
    "user.getEmployeeNumbers": ("users-get-employee-numbers", "/v2/users/employee-numbers"),
    "user.getMasters": ("user-masters-get-user-masters-by-employee-numbers", "/v2/user-masters"),
    "user.getDepartments": ("user-departments-get-user-departments-by-employee-numbers", "/v2/users/departments"),
    "user.getLeaveOfAbsence": ("getuserleaveofabsencesbyemployeenumbers", "/v2/users/leave-of-absence"),
    "user.getChangesByDate": ("user-changes-get-user-changes-by-date", "/v2/users/changes/dates/{date}"),
    "user.getFamily": ("getuserfamilybyemployeenumbers", "/v2/users/family-details"),
    "user.getCostCenters": ("getusercostcentersbyemployeenumbers", "/v2/users/cost-centers"),
    "user.getBankAccounts": ("getuserbankaccountsbyemployeenumbers", "/v2/users/bank-accounts"),
    "user.getBusinessPlaces": ("getuserbusinessplacesbyemployeenumbers", "/v2/users/business-places"),
    "workSchedule.getByDate": ("user-work-schedules-get-user-work-schedules-by-date-and-employee-numbers", "/v2/users/work-schedules/dates/{date}"),
    "workSchedule.getByPeriod": ("user-work-schedules-get-user-work-schedules-by-period-and-employee-numbers", "/v2/users/work-schedules/dates/{beginDate}/{endDate}"),
    "workSchedule.getClockEvents": ("getuserworkclockevents", "/v2/users/work-clock-events/dates/{beginDate}/{endDate}"),
    "workSchedule.getWithClocksByDate": ("getuserworkschedulewithworkclocks", "/v2/users/work-schedules-with-work-clock/dates/{date}"),
    "workSchedule.getWithClocksByPeriod": ("getuserworkschedulewithworkclocksbyperiod", "/v2/users/work-schedules-with-work-clock/dates/{beginDate}/{endDate}"),
    "timeOff.getUsesByDate": ("user-time-off-uses-get-user-time-off-uses-by-date-and-employee-numbers", "/v2/users/time-off-uses/dates/{date}"),
    "timeOff.getUsesByPeriod": ("user-time-off-uses-get-user-time-off-uses-by-period-and-employee-numbers", "/v2/users/time-off-uses/dates/{beginDate}/{endDate}"),
    "timeOff.getAnnualBuckets": ("user-time-off-buckets-get-user-annual-time-off-buckets-by-employee-numbers", "/v2/users/time-off-buckets/annual"),
    "holiday.getAll": ("getholidays", "/v2/holidays"),
}

TYPE_DEFAULT = {"string": "string", "integer": 0, "number": 0, "boolean": False, "array": [], "object": {}}


def fetch_spec(slug):
    url = f"https://developers.flex.team/reference/{slug}.md"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    txt = urllib.request.urlopen(req, timeout=20).read().decode()
    m = re.search(r"```json\n(.*)\n```", txt, re.S)
    return json.loads(m.group(1)) if m else None


def resolve(schema, comps, depth=0):
    if depth > 12 or schema is None:
        return None
    if "$ref" in schema:
        name = schema["$ref"].split("/")[-1]
        return resolve(comps.get(name, {}), comps, depth + 1)
    if "allOf" in schema:
        merged = {}
        for s in schema["allOf"]:
            r = resolve(s, comps, depth + 1)
            if isinstance(r, dict):
                merged.update(r)
        return merged
    t = schema.get("type")
    if t == "array":
        item = resolve(schema.get("items", {}), comps, depth + 1)
        return [item] if item is not None else []
    if t == "object" or "properties" in schema:
        out = {}
        for k, v in schema.get("properties", {}).items():
            if "example" in v:
                out[k] = v["example"]
            elif "$ref" in v or v.get("type") in ("object", "array") or "allOf" in v:
                out[k] = resolve(v, comps, depth + 1)
            else:
                out[k] = TYPE_DEFAULT.get(v.get("type"), None)
        return out
    return schema.get("example", TYPE_DEFAULT.get(t))


def main():
    outdir = pathlib.Path(__file__).parent.parent / "nodes" / "Flex" / "mocks"
    outdir.mkdir(parents=True, exist_ok=True)
    index = {}
    for op, (slug, path) in OPS.items():
        try:
            spec = fetch_spec(slug)
            comps = spec.get("components", {}).get("schemas", {})
            item = spec["paths"][path]
            method = next(iter(item))
            resp = item[method]["responses"]["200"]["content"]["application/json"]["schema"]
            mock = resolve(resp, comps)
            fname = op.replace(".", "_") + ".json"
            (outdir / fname).write_text(json.dumps(mock, ensure_ascii=False, indent=2))
            index[op] = fname
            print(f"OK  {op:38} -> {fname}")
        except Exception as e:
            print(f"ERR {op:38} {e}", file=sys.stderr)
    (outdir / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2))
    print(f"\n{len(index)}/{len(OPS)} mocks written to {outdir}")


if __name__ == "__main__":
    main()
