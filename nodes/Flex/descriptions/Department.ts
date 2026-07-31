import { INodeProperties } from 'n8n-workflow';
import { DEPARTMENT_CODES_QS } from './common';

export const departmentOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['department'] } },
	options: [
		{
			name: 'Get Many',
			value: 'getAll',
			action: '전체 조직 목록 조회',
			description: '코드가 입력된 현재 조직 목록을 조회합니다',
			routing: { request: { method: 'GET', url: '/v2/departments/all' } },
		},
		{
			name: 'Get Heads',
			value: 'getHeads',
			action: '조직장 조회',
			description: '조직의 현재 조직장을 조회합니다',
			routing: {
				request: {
					method: 'GET',
					url: '/v2/departments/heads',
					qs: { departmentCodes: DEPARTMENT_CODES_QS },
				},
			},
		},
	],
	default: 'getAll',
};

export const departmentFields: INodeProperties[] = [
	{
		displayName: 'Department Codes',
		name: 'departmentCodes',
		type: 'string',
		default: '',
		placeholder: 'D001,D002',
		description: '조직 코드. 쉼표로 구분해 여러 개 입력.',
		displayOptions: { show: { resource: ['department'], operation: ['getHeads'] } },
	},
];
