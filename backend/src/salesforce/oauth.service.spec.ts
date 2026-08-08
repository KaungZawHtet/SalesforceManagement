import { ConfigService } from '@nestjs/config';
import { BadGatewayException, UnauthorizedException } from '@nestjs/common';
import { OauthService } from './oauth.service';
import { TokenCache } from './token-cache';
import type { SalesforceConfig } from '../config/configuration';
import type { SalesforceTokenResponse } from './types/salesforce.interfaces';

const fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
global.fetch = fetchMock;

const salesforceConfig: SalesforceConfig = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  loginUrl: 'https://login.salesforce.com',
  apiVersion: '60.0',
};

const tokenResponse: SalesforceTokenResponse = {
  access_token: 'access-token-1',
  instance_url: 'https://instance.salesforce.com',
  id: 'id',
  token_type: 'Bearer',
  issued_at: '0',
  signature: 'signature',
  expires_in: 7200,
};

function makeResponse(status: number, body: unknown): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
  });
}

function makeConfigService(): ConfigService {
  const store: Record<string, unknown> = { salesforce: salesforceConfig };
  return {
    get: jest.fn(((key: string) => store[key]) as (key: string) => unknown),
  } as unknown as ConfigService;
}

describe('OauthService', () => {
  let service: OauthService;
  let cache: TokenCache;

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new TokenCache();
    service = new OauthService(makeConfigService(), cache);
  });

  it('fetches and caches a new access token', async () => {
    fetchMock.mockResolvedValue(makeResponse(200, tokenResponse));

    const token = await service.authenticate();

    expect(token.accessToken).toBe('access-token-1');
    expect(token.instanceUrl).toBe('https://instance.salesforce.com');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://login.salesforce.com/services/oauth2/token');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = init?.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('client_credentials');
    expect(body.get('client_id')).toBe('client-id');
    expect(body.get('client_secret')).toBe('client-secret');
  });

  it('reuses a cached token without re-fetching', async () => {
    fetchMock.mockResolvedValue(makeResponse(200, tokenResponse));

    await service.authenticate();
    await service.authenticate();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws UnauthorizedException on invalid credentials', async () => {
    fetchMock.mockResolvedValue(
      makeResponse(400, {
        error: 'invalid_grant',
        error_description: 'authentication failure',
      }),
    );

    await expect(service.authenticate()).rejects.toThrow(UnauthorizedException);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws BadGatewayException when the auth service is unreachable', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.authenticate()).rejects.toThrow(BadGatewayException);
  });

  it('throws BadGatewayException on a non-credentials Salesforce error', async () => {
    fetchMock.mockResolvedValue(
      makeResponse(500, { error: 'server_error', error_description: 'boom' }),
    );

    await expect(service.authenticate()).rejects.toThrow(BadGatewayException);
  });

  it.each([
    { access_token: '', instance_url: 'https://instance.salesforce.com' },
    { access_token: 'access-token', instance_url: '' },
    { access_token: 'access-token' },
  ])('rejects a malformed successful token response', async (body) => {
    fetchMock.mockResolvedValue(makeResponse(200, body));

    await expect(service.authenticate()).rejects.toThrow(BadGatewayException);
    expect(cache.getValid()).toBeNull();
  });

  it('invalidates the cache on demand', async () => {
    fetchMock.mockResolvedValue(makeResponse(200, tokenResponse));
    await service.authenticate();
    expect(cache.getValid()).not.toBeNull();

    cache.clear();
    expect(cache.getValid()).toBeNull();
  });
});
