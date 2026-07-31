import {
	IAuthenticateGeneric,
	Icon,
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestHelper,
	INodeProperties,
} from 'n8n-workflow';

const TOKEN_URL =
	'https://openapi.flex.team/v2/auth/realms/open-api/protocol/openid-connect/token';

/**
 * flex Open API 인증.
 *
 * flex 는 client_credentials 와 refresh_token 두 grant 를 제공하지만,
 * refresh_token 은 호출 시마다 회전(rotate)되어 n8n 의 정적 credential 에
 * 재저장할 수 없다. 따라서 stateless 한 client_credentials 방식만 지원한다.
 *
 * flex 설정 > Open API 설정에서 "Client Credential" 방식으로 발급한
 * Client ID / Client Secret 를 입력한다.
 */
export class FlexOpenApiApi implements ICredentialType {
	name = 'flexOpenApiApi';

	displayName = 'Flex Open API';

	icon: Icon = 'file:flex.svg';

	documentationUrl = 'https://developers.flex.team/reference/open-api-authentication-token-issuance';

	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
			required: true,
			description: 'flex Open API 설정에서 Client Credential 방식으로 발급한 Client ID',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: '발급 직후 한 번만 표시되는 Client Secret',
		},
	];

	/**
	 * 매 요청 전 access token 을 발급받아 sessionToken 에 저장.
	 * n8n 이 결과를 캐시하므로 access token 유효기간 동안 재사용된다.
	 */
	async preAuthentication(
		this: IHttpRequestHelper,
		credentials: ICredentialDataDecryptedObject,
	): Promise<{ sessionToken: string }> {
		const form = [
			['grant_type', 'client_credentials'],
			['client_id', credentials.clientId as string],
			['client_secret', credentials.clientSecret as string],
		]
			.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
			.join('&');

		const response = (await this.helpers.httpRequest({
			method: 'POST',
			url: TOKEN_URL,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: form,
		})) as { access_token: string };

		return { sessionToken: response.access_token };
	}

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.sessionToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://openapi.flex.team',
			url: '/v2/departments/all',
		},
	};
}
