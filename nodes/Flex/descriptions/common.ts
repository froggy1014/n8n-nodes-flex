import { INodeProperties } from 'n8n-workflow';

/**
 * 공통 필드 빌더. resource별 description 파일에서 재사용한다.
 * flex 조회 API 대부분이 employeeNumbers(배열) + 날짜/기간 조합을 공유하므로
 * 여기서 한 번만 정의한다.
 */

/** employeeNumbers(쉼표 구분 문자열) → 반복 query param 배열로 직렬화 */
export const EMPLOYEE_NUMBERS_QS =
	'={{ $parameter.employeeNumbers.split(",").map((s) => s.trim()).filter(Boolean) }}';

/** departmentCodes(쉼표 구분 문자열) → 반복 query param 배열 */
export const DEPARTMENT_CODES_QS =
	'={{ $parameter.departmentCodes.split(",").map((s) => s.trim()).filter(Boolean) }}';

export function employeeNumbersField(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'Employee Numbers',
		name: 'employeeNumbers',
		type: 'string',
		default: '',
		placeholder: '1001,1002,1003',
		description:
			'Employee numbers to look up, comma-separated for multiple values. Members without an employee number set are not included in the response.',
		displayOptions: { show: { resource: [resource], operation: operations } },
	};
}

export function singleDateField(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'Date',
		name: 'date',
		type: 'string',
		default: '',
		placeholder: '2026-07-30',
		description: 'Date to look up (YYYY-MM-DD)',
		displayOptions: { show: { resource: [resource], operation: operations } },
	};
}

export function periodDateFields(resource: string, operations: string[]): INodeProperties[] {
	return [
		{
			displayName: 'Begin Date',
			name: 'beginDate',
			type: 'string',
			default: '',
			placeholder: '2026-07-01',
			description: 'Start date of the period (YYYY-MM-DD). Can span at most 31 days up to the end date.',
			displayOptions: { show: { resource: [resource], operation: operations } },
		},
		{
			displayName: 'End Date',
			name: 'endDate',
			type: 'string',
			default: '',
			placeholder: '2026-07-31',
			description: 'End date of the period (YYYY-MM-DD)',
			displayOptions: { show: { resource: [resource], operation: operations } },
		},
	];
}
