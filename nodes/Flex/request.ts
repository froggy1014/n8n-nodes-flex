import { IDataObject, IExecuteFunctions } from 'n8n-workflow';

/** 실 호출용 요청 스펙 (method 는 전부 GET). */
export interface FlexRequestSpec {
	url: string;
	qs?: IDataObject;
}

const csv = (s: string): string[] =>
	s
		.split(',')
		.map((x) => x.trim())
		.filter(Boolean);

/**
 * resource+operation 파라미터로부터 flex API 요청 스펙을 조립한다.
 * declarative routing 과 1:1 대응. programmatic execute() 에서 사용.
 */
export function buildRequest(ctx: IExecuteFunctions, i: number): FlexRequestSpec {
	const resource = ctx.getNodeParameter('resource', i) as string;
	const operation = ctx.getNodeParameter('operation', i) as string;
	const key = `${resource}.${operation}`;

	const str = (name: string): string => ctx.getNodeParameter(name, i, '') as string;
	const emp = (): string[] => csv(str('employeeNumbers'));
	const add = (): IDataObject => ctx.getNodeParameter('additionalFields', i, {}) as IDataObject;

	switch (key) {
		case 'department.getAll':
			return { url: '/v2/departments/all' };
		case 'department.getHeads':
			return { url: '/v2/departments/heads', qs: { departmentCodes: csv(str('departmentCodes')) } };
		case 'jobItem.getAll':
			return { url: '/v2/job-items/all' };
		case 'user.getEmployeeNumbers':
			return { url: '/v2/users/employee-numbers', qs: add() };
		case 'user.getMasters':
			return { url: '/v2/user-masters', qs: { employeeNumbers: emp() } };
		case 'user.getDepartments':
			return { url: '/v2/users/departments', qs: { employeeNumbers: emp(), ...add() } };
		case 'user.getLeaveOfAbsence':
			return { url: '/v2/users/leave-of-absence', qs: { employeeNumbers: emp() } };
		case 'user.getChangesByDate':
			return { url: `/v2/users/changes/dates/${str('date')}`, qs: add() };
		case 'user.getFamily':
			return { url: '/v2/users/family-details', qs: { employeeNumbers: emp() } };
		case 'user.getCostCenters':
			return { url: '/v2/users/cost-centers', qs: { employeeNumbers: emp() } };
		case 'user.getBankAccounts':
			return { url: '/v2/users/bank-accounts', qs: { employeeNumbers: emp() } };
		case 'user.getBusinessPlaces':
			return { url: '/v2/users/business-places', qs: { employeeNumbers: emp() } };
		case 'workSchedule.getByDate':
			return { url: `/v2/users/work-schedules/dates/${str('date')}`, qs: { employeeNumbers: emp() } };
		case 'workSchedule.getByPeriod':
			return {
				url: `/v2/users/work-schedules/dates/${str('beginDate')}/${str('endDate')}`,
				qs: { employeeNumbers: emp() },
			};
		case 'workSchedule.getClockEvents':
			return {
				url: `/v2/users/work-clock-events/dates/${str('beginDate')}/${str('endDate')}`,
				qs: { employeeNumbers: emp() },
			};
		case 'workSchedule.getWithClocksByDate':
			return {
				url: `/v2/users/work-schedules-with-work-clock/dates/${str('date')}`,
				qs: { employeeNumbers: emp() },
			};
		case 'workSchedule.getWithClocksByPeriod':
			return {
				url: `/v2/users/work-schedules-with-work-clock/dates/${str('beginDate')}/${str('endDate')}`,
				qs: { employeeNumbers: emp() },
			};
		case 'timeOff.getUsesByDate':
			return { url: `/v2/users/time-off-uses/dates/${str('date')}`, qs: { employeeNumbers: emp() } };
		case 'timeOff.getUsesByPeriod':
			return {
				url: `/v2/users/time-off-uses/dates/${str('beginDate')}/${str('endDate')}`,
				qs: { employeeNumbers: emp() },
			};
		case 'timeOff.getAnnualBuckets':
			return { url: '/v2/users/time-off-buckets/annual', qs: { employeeNumbers: emp() } };
		case 'holiday.getAll':
			return { url: '/v2/holidays', qs: { from: str('from'), to: str('to') } };
		default:
			throw new Error(`Unknown flex operation: ${key}`);
	}
}
