import { IDataObject, IExecuteFunctions } from 'n8n-workflow';

/** 실 호출용 요청 스펙 (method 는 전부 GET). */
export interface FlexRequestSpec {
	url: string;
	qs?: IDataObject;
	/**
	 * 배열 query param 이름. flex 는 배열 param 당 최대 20개(maxItems)만 허용하므로
	 * 초과 시 execute() 가 이 param 기준으로 분할 호출 후 응답을 병합한다.
	 */
	chunkParam?: string;
	/** 페이지네이션 지원 endpoint 의 요청 page key param 이름 (응답의 nextPageKey 를 실어 보냄) */
	paginationParam?: string;
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

	/** employeeNumbers 배열을 쓰는 조회 공통 스펙 */
	const byEmp = (url: string, extraQs: IDataObject = {}): FlexRequestSpec => ({
		url,
		qs: { employeeNumbers: emp(), ...extraQs },
		chunkParam: 'employeeNumbers',
	});

	switch (key) {
		case 'department.getAll':
			return { url: '/v2/departments/all' };
		case 'department.getHeads':
			return {
				url: '/v2/departments/heads',
				qs: { departmentCodes: csv(str('departmentCodes')) },
				chunkParam: 'departmentCodes',
			};
		case 'jobItem.getAll':
			return { url: '/v2/job-items/all' };
		case 'user.getEmployeeNumbers':
			return { url: '/v2/users/employee-numbers', qs: add(), paginationParam: 'nextPageKey' };
		case 'user.getMasters':
			return byEmp('/v2/user-masters');
		case 'user.getDepartments':
			return byEmp('/v2/users/departments', add());
		case 'user.getLeaveOfAbsence':
			return byEmp('/v2/users/leave-of-absence');
		case 'user.getChangesByDate':
			return { url: `/v2/users/changes/dates/${str('date')}`, qs: add(), paginationParam: 'pageKey' };
		case 'user.getFamily':
			return byEmp('/v2/users/family-details');
		case 'user.getCostCenters':
			return byEmp('/v2/users/cost-centers');
		case 'user.getBankAccounts':
			return byEmp('/v2/users/bank-accounts');
		case 'user.getBusinessPlaces':
			return byEmp('/v2/users/business-places');
		case 'workSchedule.getByDate':
			return byEmp(`/v2/users/work-schedules/dates/${str('date')}`);
		case 'workSchedule.getByPeriod':
			return byEmp(`/v2/users/work-schedules/dates/${str('beginDate')}/${str('endDate')}`);
		case 'workSchedule.getClockEvents':
			return byEmp(`/v2/users/work-clock-events/dates/${str('beginDate')}/${str('endDate')}`);
		case 'workSchedule.getWithClocksByDate':
			return byEmp(`/v2/users/work-schedules-with-work-clock/dates/${str('date')}`);
		case 'workSchedule.getWithClocksByPeriod':
			return byEmp(`/v2/users/work-schedules-with-work-clock/dates/${str('beginDate')}/${str('endDate')}`);
		case 'timeOff.getUsesByDate':
			return byEmp(`/v2/users/time-off-uses/dates/${str('date')}`);
		case 'timeOff.getUsesByPeriod':
			return byEmp(`/v2/users/time-off-uses/dates/${str('beginDate')}/${str('endDate')}`);
		case 'timeOff.getAnnualBuckets':
			return byEmp('/v2/users/time-off-buckets/annual');
		case 'holiday.getAll':
			return { url: '/v2/holidays', qs: { from: str('from'), to: str('to') } };
		default:
			throw new Error(`Unknown flex operation: ${key}`);
	}
}
