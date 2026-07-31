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
			action: 'Get time off uses by date',
			description: 'Retrieve the list of time off uses for members on a specific date',
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
			action: 'Get time off uses by period',
			description: 'Retrieve the list of time off uses for members over a period of up to 31 days',
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
			action: 'Get annual leave buckets',
			description: 'Retrieve the list of annual leave grants for members',
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
