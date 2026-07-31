import { INodeProperties } from 'n8n-workflow';

export const holidayOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['holiday'] } },
	options: [
		{
			name: 'Get Many',
			value: 'getAll',
			action: 'Get many holidays',
			description:
				'Retrieve the list of holidays per company holiday group (statutory public holidays plus company-specific holidays)',
			routing: {
				request: {
					method: 'GET',
					url: '/v2/holidays',
					qs: {
						from: '={{$parameter.from}}',
						to: '={{$parameter.to}}',
					},
				},
			},
		},
	],
	default: 'getAll',
};

export const holidayFields: INodeProperties[] = [
	{
		displayName: 'From',
		name: 'from',
		type: 'string',
		default: '',
		placeholder: '2026-01-01',
		description: 'Start date of the range (YYYY-MM-DD)',
		displayOptions: { show: { resource: ['holiday'], operation: ['getAll'] } },
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		placeholder: '2026-12-31',
		description: 'End date of the range (YYYY-MM-DD)',
		displayOptions: { show: { resource: ['holiday'], operation: ['getAll'] } },
	},
];
