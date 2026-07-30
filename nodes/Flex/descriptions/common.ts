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
		required: false,
		placeholder: '1001,1002,1003',
		description: '조회할 사원번호. 쉼표로 구분해 여러 개 입력. 코드(사번) 미설정 구성원은 응답에 나오지 않음',
		displayOptions: { show: { resource: [resource], operation: operations } },
	};
}

export function singleDateField(resource: string, operations: string[]): INodeProperties {
	return {
		displayName: 'Date',
		name: 'date',
		type: 'string',
		default: '',
		required: false,
		placeholder: '2026-07-30',
		description: '조회 날짜 (YYYY-MM-DD)',
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
			required: false,
			placeholder: '2026-07-01',
			description: '조회 시작일 (YYYY-MM-DD). endDate 와 최장 31일 간격',
			displayOptions: { show: { resource: [resource], operation: operations } },
		},
		{
			displayName: 'End Date',
			name: 'endDate',
			type: 'string',
			default: '',
			required: false,
			placeholder: '2026-07-31',
			description: '조회 종료일 (YYYY-MM-DD)',
			displayOptions: { show: { resource: [resource], operation: operations } },
		},
	];
}
