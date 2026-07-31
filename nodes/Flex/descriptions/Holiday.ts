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
			action: '휴일 목록 조회',
			description: '회사의 휴일 그룹별 휴일 목록을 조회합니다 (법정공휴일+회사 자체 휴일)',
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
		description: '조회 시작일 (YYYY-MM-DD)',
		displayOptions: { show: { resource: ['holiday'], operation: ['getAll'] } },
	},
	{
		displayName: 'To',
		name: 'to',
		type: 'string',
		default: '',
		placeholder: '2026-12-31',
		description: '조회 종료일 (YYYY-MM-DD)',
		displayOptions: { show: { resource: ['holiday'], operation: ['getAll'] } },
	},
];
