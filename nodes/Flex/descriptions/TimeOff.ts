import { INodeProperties } from 'n8n-workflow';
import { employeeNumbersField, singleDateField, periodDateFields, EMPLOYEE_NUMBERS_QS } from './common';

const ALL_OPS = ['getUsesByDate', 'getUsesByPeriod', 'getAnnualBuckets'];

export const timeOffOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['timeOff'] } },
	options: [
		{
			name: 'Get Uses by Date',
			value: 'getUsesByDate',
			action: '날짜별 휴가 사용 조회',
			description: '구성원들의 날짜별 휴가 사용 목록을 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/time-off-uses/dates/{{$parameter.date}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
		{
			name: 'Get Uses by Period',
			value: 'getUsesByPeriod',
			action: '기간별 휴가 사용 조회',
			description: '구성원들의 기간별 휴가 사용 목록을 최장 31일까지 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '=/v2/users/time-off-uses/dates/{{$parameter.beginDate}}/{{$parameter.endDate}}',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
		{
			name: 'Get Annual Buckets',
			value: 'getAnnualBuckets',
			action: '연차 부여 목록 조회',
			description: '구성원들의 연차 부여 목록을 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '/v2/users/time-off-buckets/annual',
					qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS },
				},
			},
		},
	],
	default: 'getUsesByPeriod',
};

export const timeOffFields: INodeProperties[] = [
	employeeNumbersField('timeOff', ALL_OPS),
	singleDateField('timeOff', ['getUsesByDate']),
	...periodDateFields('timeOff', ['getUsesByPeriod']),
];
