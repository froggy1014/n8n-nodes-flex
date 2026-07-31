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
			action: 'Get many departments',
			description: 'Retrieve the current list of departments that have a department code set',
			routing: { request: { method: 'GET', url: '/v2/departments/all' } },
		},
		{
			name: 'Get Heads',
			value: 'getHeads',
			action: 'Get department heads',
			description: 'Retrieve the current heads of departments',
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
		description: 'Department codes to look up, comma-separated for multiple values',
		displayOptions: { show: { resource: ['department'], operation: ['getHeads'] } },
	},
];
