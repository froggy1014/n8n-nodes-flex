import { INodeProperties } from 'n8n-workflow';
import { employeeNumbersField, singleDateField, periodDateFields, EMPLOYEE_NUMBERS_QS } from './common';

const BY_DATE_OPS = ['getByDate', 'getWithClocksByDate'];
const BY_PERIOD_OPS = ['getByPeriod', 'getClockEvents', 'getWithClocksByPeriod'];
const ALL_OPS = [...BY_DATE_OPS, ...BY_PERIOD_OPS];

export const workScheduleOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['workSchedule'] } },
	options: [
		{
			name: 'Get by Date',
			value: 'getByDate',
			action: '날짜별 근무 스케줄 조회',
			description: '구성원들의 날짜별 근무 스케줄을 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/work-schedules/dates/{{$parameter.date}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
		{
			name: 'Get by Period',
			value: 'getByPeriod',
			action: '기간별 근무 스케줄 조회',
			description: '구성원들의 기간별 근무 스케줄을 최장 31일까지 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/work-schedules/dates/{{$parameter.beginDate}}/{{$parameter.endDate}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
		{
			name: 'Get Clock Events',
			value: 'getClockEvents',
			action: '기간별 타각 이벤트 조회',
			description: '구성원들의 기간별 타각 이벤트를 최장 31일까지 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/work-clock-events/dates/{{$parameter.beginDate}}/{{$parameter.endDate}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
		{
			name: 'Get With Clocks by Date',
			value: 'getWithClocksByDate',
			action: '날짜별 근무 스케줄+타각 조회',
			description: '진행 중인 근무·휴게를 제외한 날짜별 근무 스케줄과 타각을 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/work-schedules-with-work-clock/dates/{{$parameter.date}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
		{
			name: 'Get With Clocks by Period',
			value: 'getWithClocksByPeriod',
			action: '기간별 근무 스케줄+타각 조회',
			description: '구성원들의 기간별 근무 스케줄과 타각을 최장 31일까지 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/work-schedules-with-work-clock/dates/{{$parameter.beginDate}}/{{$parameter.endDate}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
	],
	default: 'getByPeriod',
};

export const workScheduleFields: INodeProperties[] = [
	employeeNumbersField('workSchedule', ALL_OPS),
	singleDateField('workSchedule', BY_DATE_OPS),
	...periodDateFields('workSchedule', BY_PERIOD_OPS),
];
