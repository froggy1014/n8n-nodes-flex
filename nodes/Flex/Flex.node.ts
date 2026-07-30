import { INodeType, INodeTypeDescription } from 'n8n-workflow';
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

/**
 * flex Open API — declarative node.
 *
 * flex.team HR 플랫폼의 조회(read-only) API 전체를 resource/operation 으로 감싼다.
 * resource별 정의는 descriptions/ 하위 파일로 분리되어 있다.
 *
 * 제약:
 * - 전부 read-only. 근무/휴가 등록·변경은 flex 웹/앱에서만 가능.
 * - Rate limit 1 request/second. 대량 조회 시 워크플로에서 스로틀 필요.
 * - 기간 조회 최장 31일.
 * - 진행 중(미종료) 근무는 조회 미지원.
 */
export class Flex implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'flex',
		name: 'flex',
		icon: 'file:flex.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'flex Open API (flex.team HR 플랫폼) 조회',
		defaults: { name: 'flex' },
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'flexOpenApiApi', required: true }],
		requestDefaults: {
			baseURL: 'https://openapi.flex.team',
			headers: { Accept: 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Department', value: 'department' },
					{ name: 'Job Item', value: 'jobItem' },
					{ name: 'User', value: 'user' },
					{ name: 'Work Schedule', value: 'workSchedule' },
					{ name: 'Time Off', value: 'timeOff' },
					{ name: 'Holiday', value: 'holiday' },
				],
				default: 'department',
			},

			departmentOperations,
			jobItemOperations,
			userOperations,
			workScheduleOperations,
			timeOffOperations,
			holidayOperations,

			...departmentFields,
			...jobItemFields,
			...userFields,
			...workScheduleFields,
			...timeOffFields,
			...holidayFields,
		],
	};
}
