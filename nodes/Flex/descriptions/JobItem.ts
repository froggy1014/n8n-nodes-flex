import { INodeProperties } from 'n8n-workflow';

export const jobItemOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['jobItem'] } },
	options: [
		{
			name: 'Get Many',
			value: 'getAll',
			action: 'Get many job items',
			description:
				'Retrieve the list of job codes (duty, position, title, grade, and job group) that have a code set',
			routing: { request: { method: 'GET', url: '/v2/job-items/all' } },
		},
	],
	default: 'getAll',
};

export const jobItemFields: INodeProperties[] = [];
