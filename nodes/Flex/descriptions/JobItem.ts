import { INodeProperties } from 'n8n-workflow';

export const jobItemOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: { show: { resource: ['jobItem'] } },
	options: [
		{
			name: 'Get All',
			value: 'getAll',
			action: '직무·직위·직책·직급·직군 목록 조회',
			description: '코드가 입력된 업무 코드 목록을 조회합니다',
			routing: { request: { method: 'GET', url: '/v2/job-items/all' } },
		},
	],
	default: 'getAll',
};

export const jobItemFields: INodeProperties[] = [];
