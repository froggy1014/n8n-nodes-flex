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
			action: 'Get work schedules by date',
			description: 'Retrieve work schedules for members on a specific date',
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
			action: 'Get work schedules by period',
			description: 'Retrieve work schedules for members over a period of up to 31 days',
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
			action: 'Get clock events by period',
			description: 'Retrieve clock-in/out events for members over a period of up to 31 days',
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
			action: 'Get work schedules with clocks by date',
			description:
				'Retrieve work schedules and clock records for a specific date, excluding work and breaks still in progress',
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
			action: 'Get work schedules with clocks by period',
			description: 'Retrieve work schedules and clock records for members over a period of up to 31 days',
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
