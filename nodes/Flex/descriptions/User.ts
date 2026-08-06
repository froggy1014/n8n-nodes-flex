import { INodeProperties } from 'n8n-workflow';
import { employeeNumbersField, singleDateField, EMPLOYEE_NUMBERS_QS } from './common';

/** employeeNumbers(query 배열)만 쓰는 단순 조회 오퍼레이션 */
const EMPLOYEE_NUMBER_OPS = [
	'getMasters',
	'getDepartments',
	'getLeaveOfAbsence',
	'getFamily',
	'getCostCenters',
	'getBankAccounts',
	'getBusinessPlaces',
];

export const userOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['user'] } },
	options: [
		{
			name: 'Get Employee Numbers',
			value: 'getEmployeeNumbers',
			action: 'Get employee numbers',
			description: 'Retrieve the list of employee numbers page by page',
			routing: { request: { method: 'GET', url: '/v2/users/employee-numbers' } },
		},
		{
			name: 'Get Masters',
			value: 'getMasters',
			action: 'Get member masters',
			description:
				'Retrieve member master records by employee number. Personnel appointment records reflect current data, so they may be empty for upcoming hires or former employees (use Get Departments for the department and title as of a specific point in time).',
			routing: {
				request: { method: 'GET', url: '/v2/user-masters', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Departments',
			value: 'getDepartments',
			action: 'Get member departments and titles',
			description: 'Retrieve the list of departments and titles for members by employee number',
			routing: {
				request: { method: 'GET', url: '/v2/users/departments', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Leave of Absence',
			value: 'getLeaveOfAbsence',
			action: 'Get member leave of absence',
			description: 'Retrieve leave of absence information for members by employee number',
			routing: {
				request: { method: 'GET', url: '/v2/users/leave-of-absence', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Changes by Date',
			value: 'getChangesByDate',
			action: 'Get changed members by date',
			description: 'Retrieve the list of members whose information changed',
			routing: { request: { method: 'GET', url: '=/v2/users/changes/dates/{{$parameter.date}}' } },
		},
		{
			name: 'Get Family Details',
			value: 'getFamily',
			action: 'Get member family details',
			description: 'Retrieve family details for members by employee number',
			routing: {
				request: { method: 'GET', url: '/v2/users/family-details', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Cost Centers',
			value: 'getCostCenters',
			action: 'Get member cost centers',
			description: 'Retrieve cost center information for members by employee number',
			routing: {
				request: { method: 'GET', url: '/v2/users/cost-centers', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Bank Accounts',
			value: 'getBankAccounts',
			action: 'Get member bank accounts',
			description: 'Retrieve bank account information for members by employee number',
			routing: {
				request: { method: 'GET', url: '/v2/users/bank-accounts', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Business Places',
			value: 'getBusinessPlaces',
			action: 'Get member business places',
			description: 'Retrieve business place information for members by employee number',
			routing: {
				request: { method: 'GET', url: '/v2/users/business-places', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
	],
	default: 'getMasters',
};

export const userFields: INodeProperties[] = [
	employeeNumbersField('user', EMPLOYEE_NUMBER_OPS),
	singleDateField('user', ['getChangesByDate']),

	// 페이지네이션 지원 오퍼레이션: hasNext/nextPageKey 를 따라 전체 페이지 자동 조회
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		description: 'Whether to return all results or only up to a given limit',
		displayOptions: {
			show: { resource: ['user'], operation: ['getEmployeeNumbers', 'getChangesByDate'] },
		},
	},

	// 선택 파라미터: 값을 추가했을 때만 query 로 전송됨 (collection)
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['user'], operation: ['getEmployeeNumbers'] } },
		options: [
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 20,
				description: 'Number of results per page (flex API allows at most 20)',
				typeOptions: { minValue: 1, maxValue: 20 },
				routing: { send: { type: 'query', property: 'pageSize' } },
			},
			{
				displayName: 'Next Page Key',
				name: 'nextPageKey',
				type: 'string',
				default: '',
				description: 'Key from the previous response to fetch the next page manually (ignored when Return All is on)',
				routing: { send: { type: 'query', property: 'nextPageKey' } },
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['user'], operation: ['getChangesByDate'] } },
		options: [
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'number',
				default: 20,
				description: 'Number of results per page (flex API allows at most 20)',
				typeOptions: { minValue: 1, maxValue: 20 },
				routing: { send: { type: 'query', property: 'pageSize' } },
			},
			{
				displayName: 'Page Key',
				name: 'pageKey',
				type: 'string',
				default: '',
				description: 'Key from the previous response to fetch the next page manually (ignored when Return All is on)',
				routing: { send: { type: 'query', property: 'pageKey' } },
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['user'], operation: ['getDepartments'] } },
		options: [
			{
				displayName: 'Search Date Time',
				name: 'searchDateTime',
				type: 'string',
				default: '',
				placeholder: '2026-07-30T09:00:00',
				description:
					'Look up departments and titles as of a specific point in time (e.g. a planned hire date or a leave date)',
				routing: { send: { type: 'query', property: 'searchDateTime' } },
			},
		],
	},
];
