import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';
import { MOCKS } from './mocks';
import {
	departmentOperations,
	departmentFields,
	jobItemOperations,
	jobItemFields,
	userOperations,
	userFields,
	workScheduleOperations,
	workScheduleFields,
	timeOffOperations,
	timeOffFields,
	holidayOperations,
	holidayFields,
} from './descriptions';
import { buildRequest } from './request';

const BASE_URL = 'https://openapi.flex.team';

/** mocks static map 조회 (flex 문서 example 로 생성됨 — fs 접근 없이 번들에 포함) */
function loadMock(resource: string, operation: string): unknown {
	return MOCKS[`${resource}_${operation}`];
}

/**
 * flex Open API — programmatic node.
 *
 * declarative 에서 전환한 이유: Mock Data 토글로 실 HTTP 호출을 건너뛰려면
 * routing 이 아닌 execute() 제어가 필요하기 때문. 실 호출 스펙은 request.ts 로 분리.
 *
 * 제약: 전부 read-only / rate limit 1 req/sec / 기간 최장 31일 / 진행 중 근무 미지원.
 */
export class Flex implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'flex',
		name: 'flex',
		icon: { light: 'file:flex.svg', dark: 'file:flex.dark.svg' },
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Retrieve department, member, attendance, time off, and holiday data from the flex.team HR platform (flex Open API, read-only). Turn on Mock Data to get sample responses from the API docs without a credential.',
		defaults: { name: 'flex' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		// Mock Data 가 꺼진 실 호출 시에만 credential 필요 (mock 모드는 credential 없이 동작)
		credentials: [
			{
				name: 'flexOpenApiApi',
				required: true,
				displayOptions: { show: { mockData: [false] } },
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Department', value: 'department' },
					{ name: 'Holiday', value: 'holiday' },
					{ name: 'Job Item', value: 'jobItem' },
					{ name: 'Time Off', value: 'timeOff' },
					{ name: 'User', value: 'user' },
					{ name: 'Work Schedule', value: 'workSchedule' },
				],
				default: 'department',
			},

			departmentOperations,
			jobItemOperations,
			userOperations,
			workScheduleOperations,
			timeOffOperations,
			holidayOperations,

			{
				displayName: 'Mock Data',
				name: 'mockData',
				type: 'boolean',
				default: false,
				description:
					'Whether to return sample data from the flex API docs instead of calling the real API. No credential needed — for testing and exploring the node.',
			},

			...departmentFields,
			...jobItemFields,
			...userFields,
			...workScheduleFields,
			...timeOffFields,
			...holidayFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;
			const mock = this.getNodeParameter('mockData', i, false) as boolean;

			let data: unknown;
			if (mock) {
				data = loadMock(resource, operation);
			} else {
				const { url, qs } = buildRequest(this, i);
				data = await this.helpers.httpRequestWithAuthentication.call(this, 'flexOpenApiApi', {
					method: 'GET',
					baseURL: BASE_URL,
					url,
					qs,
					headers: { Accept: 'application/json' },
				});
			}

			out.push({ json: data as IDataObject, pairedItem: { item: i } });
		}

		return [out];
	}
}
