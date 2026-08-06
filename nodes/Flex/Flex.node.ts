import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	NodeOperationError,
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
import { buildRequest, FlexRequestSpec } from './request';

const BASE_URL = 'https://openapi.flex.team';

/** flex OpenAPI 스펙: Rate Limit 1 request / second */
const RATE_LIMIT_INTERVAL_MS = 1000;
/** 429 응답 시 재시도 횟수 */
const RATE_LIMIT_MAX_RETRIES = 3;
/** flex OpenAPI 스펙: 배열 query param 은 최대 20개 (maxItems: 20) */
const CHUNK_SIZE = 20;
/** 자동 페이지네이션 폭주 방지 상한 (pageSize 최대 20 × 200 = 4,000건) */
const MAX_PAGES = 200;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 분할 호출/페이지네이션 응답 병합: 배열 필드는 이어 붙이고
 * 스칼라 필드(hasNext, nextPageKey 등)는 마지막 응답 값을 남긴다.
 */
function mergeBodies(bodies: IDataObject[]): IDataObject {
	if (bodies.length === 1) return bodies[0];
	const merged: IDataObject = {};
	for (const body of bodies) {
		for (const [key, value] of Object.entries(body)) {
			if (Array.isArray(value)) {
				merged[key] = [...((merged[key] as unknown[]) ?? []), ...value];
			} else {
				merged[key] = value;
			}
		}
	}
	return merged;
}

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

		// flex rate limit(1 req/sec) 준수: 실 호출 사이 최소 간격 유지 + 429 백오프 재시도
		let lastRequestAt = 0;
		const callApi = async (url: string, qs: IDataObject | undefined): Promise<IDataObject> => {
			for (let attempt = 0; ; attempt++) {
				const waitMs = lastRequestAt + RATE_LIMIT_INTERVAL_MS - Date.now();
				if (waitMs > 0) await sleep(waitMs);
				lastRequestAt = Date.now();
				try {
					return (await this.helpers.httpRequestWithAuthentication.call(this, 'flexOpenApiApi', {
						method: 'GET',
						baseURL: BASE_URL,
						url,
						qs,
						// flex 는 배열 param 을 반복 키(employeeNumbers=a&employeeNumbers=b)로 기대한다.
						// (OpenAPI style: form, explode: true — 미지정 시 axios 가 brackets 로 직렬화해 400/빈 응답)
						arrayFormat: 'repeat',
						headers: { Accept: 'application/json' },
					})) as IDataObject;
				} catch (error) {
					const httpCode = (error as { httpCode?: string }).httpCode;
					if (httpCode === '429' && attempt < RATE_LIMIT_MAX_RETRIES) {
						await sleep(RATE_LIMIT_INTERVAL_MS * (attempt + 2));
						continue;
					}
					throw error;
				}
			}
		};

		/** 스펙 실행: 배열 param 20개 초과 분할 + returnAll 페이지네이션 + 응답 병합 */
		const runSpec = async (spec: FlexRequestSpec, itemIndex: number): Promise<IDataObject> => {
			// flex 배열 param 은 minItems 1 — 빈 채로 보내면 400 이므로 미리 명확한 에러를 낸다
			const chunkValues = spec.chunkParam ? (spec.qs?.[spec.chunkParam] as string[]) : undefined;
			if (spec.chunkParam && (!Array.isArray(chunkValues) || chunkValues.length === 0)) {
				throw new NodeOperationError(
					this.getNode(),
					`Parameter "${spec.chunkParam}" must contain at least one value`,
					{ itemIndex },
				);
			}

			// 배열 param 20개 초과 시 분할 (flex maxItems: 20)
			const qsVariants: IDataObject[] = [];
			if (spec.chunkParam && chunkValues && chunkValues.length > CHUNK_SIZE) {
				for (let start = 0; start < chunkValues.length; start += CHUNK_SIZE) {
					qsVariants.push({ ...spec.qs, [spec.chunkParam]: chunkValues.slice(start, start + CHUNK_SIZE) });
				}
			} else {
				qsVariants.push({ ...spec.qs });
			}

			const returnAll =
				spec.paginationParam !== undefined &&
				(this.getNodeParameter('returnAll', itemIndex, false) as boolean);

			const bodies: IDataObject[] = [];
			for (const qs of qsVariants) {
				if (!returnAll) {
					bodies.push(await callApi(spec.url, qs));
					continue;
				}
				// hasNext/nextPageKey 기반 자동 페이지네이션
				let pageKey: string | undefined;
				for (let page = 0; page < MAX_PAGES; page++) {
					const pageQs = { ...qs };
					if (pageKey) pageQs[spec.paginationParam as string] = pageKey;
					const body = await callApi(spec.url, pageQs);
					bodies.push(body);
					if (!body.hasNext || !body.nextPageKey) break;
					pageKey = body.nextPageKey as string;
				}
			}
			return mergeBodies(bodies);
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const mock = this.getNodeParameter('mockData', i, false) as boolean;

				const data = mock ? loadMock(resource, operation) : await runSpec(buildRequest(this, i), i);
				out.push({ json: data as IDataObject, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [out];
	}
}
