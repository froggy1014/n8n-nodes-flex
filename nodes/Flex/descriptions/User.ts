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
			action: '사번 목록 조회',
			description: '사원번호 목록을 페이지 단위로 조회합니다',
			routing: { request: { method: 'GET', url: '/v2/users/employee-numbers' } },
		},
		{
			name: 'Get Masters',
			value: 'getMasters',
			action: '구성원 마스터 조회',
			description: '사원번호로 구성원들의 정보를 조회합니다',
			routing: {
				request: { method: 'GET', url: '/v2/user-masters', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Departments',
			value: 'getDepartments',
			action: '구성원 조직·직책 조회',
			description: '사원번호로 구성원들의 조직·직책 목록을 조회합니다',
			routing: {
				request: { method: 'GET', url: '/v2/users/departments', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Leave of Absence',
			value: 'getLeaveOfAbsence',
			action: '구성원 휴직 정보 조회',
			description: '사원번호로 구성원들의 휴직 정보를 조회합니다',
			routing: {
				request: { method: 'GET', url: '/v2/users/leave-of-absence', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Changes by Date',
			value: 'getChangesByDate',
			action: '날짜별 변동 구성원 조회',
			description: '변동된 구성원 목록을 조회합니다',
			routing: { request: { method: 'GET', url: '=/v2/users/changes/dates/{{$parameter.date}}' } },
		},
		{
			name: 'Get Family Details',
			value: 'getFamily',
			action: '구성원 가족정보 조회',
			description: '사원번호로 구성원들의 가족정보를 조회합니다',
			routing: {
				request: { method: 'GET', url: '/v2/users/family-details', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Cost Centers',
			value: 'getCostCenters',
			action: '구성원 코스트센터 조회',
			description: '사원번호로 구성원들의 코스트센터 정보를 조회합니다',
			routing: {
				request: { method: 'GET', url: '/v2/users/cost-centers', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Bank Accounts',
			value: 'getBankAccounts',
			action: '구성원 은행계좌 조회',
			description: '사원번호로 구성원들의 은행계좌 정보를 조회합니다',
			routing: {
				request: { method: 'GET', url: '/v2/users/bank-accounts', qs: { employeeNumbers: EMPLOYEE_NUMBERS_QS } },
			},
		},
		{
			name: 'Get Business Places',
			value: 'getBusinessPlaces',
			action: '구성원 사업장 조회',
			description: '사원번호로 구성원들의 사업장 정보를 조회합니다',
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
				default: 100,
				routing: { send: { type: 'query', property: 'pageSize' } },
			},
			{
				displayName: 'Next Page Key',
				name: 'nextPageKey',
				type: 'string',
				default: '',
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
				default: 100,
				routing: { send: { type: 'query', property: 'pageSize' } },
			},
			{
				displayName: 'Page Key',
				name: 'pageKey',
				type: 'string',
				default: '',
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
				description: '특정 시점 기준 조직·직책 조회 (입사예정일/퇴사일 조회 등)',
				routing: { send: { type: 'query', property: 'searchDateTime' } },
			},
		],
	},
];
