import ***REMOVED*** ConfigService ***REMOVED*** from '@nestjs/config';
import ***REMOVED*** BadGatewayException, UnauthorizedException ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** OauthService ***REMOVED*** from './oauth.service';
import ***REMOVED*** TokenCache ***REMOVED*** from './token-cache';
import ***REMOVED*** SalesforceConfig ***REMOVED*** from '../config/configuration';
import ***REMOVED*** SalesforceTokenResponse ***REMOVED*** from './types/salesforce.interfaces';

const fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
global.fetch = fetchMock;

const salesforceConfig: SalesforceConfig = ***REMOVED***
  clientId: 'client-id',
  clientSecret: 'client-secret',
  loginUrl: 'https://login.salesforce.com',
  apiVersion: '60.0',
***REMOVED***;

const tokenResponse: SalesforceTokenResponse = ***REMOVED***
  access_token: 'access-token-1',
  instance_url: 'https://instance.salesforce.com',
  id: 'id',
  token_type: 'Bearer',
  issued_at: '0',
  signature: 'signature',
  expires_in: 7200,
***REMOVED***;

function makeResponse(status: number, body: unknown): Response ***REMOVED***
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), ***REMOVED***
    status,
  ***REMOVED***);
***REMOVED***

function makeConfigService(): ConfigService ***REMOVED***
  const store: Record<string, unknown> = ***REMOVED*** salesforce: salesforceConfig ***REMOVED***;
  return ***REMOVED***
    get: jest.fn(((key: string) => store[key]) as (key: string) => unknown),
  ***REMOVED*** as unknown as ConfigService;
***REMOVED***

describe('OauthService', () => ***REMOVED***
  let service: OauthService;
  let cache: TokenCache;

  beforeEach(() => ***REMOVED***
    jest.clearAllMocks();
    cache = new TokenCache();
    service = new OauthService(makeConfigService(), cache);
  ***REMOVED***);

  it('fetches and caches a new access token', async () => ***REMOVED***
    fetchMock.mockResolvedValue(makeResponse(200, tokenResponse));

    const token = await service.authenticate();

    expect(token.accessToken).toBe('access-token-1');
    expect(token.instanceUrl).toBe('https://instance.salesforce.com');
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://login.salesforce.com/services/oauth2/token');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual(***REMOVED***
      'Content-Type': 'application/x-www-form-urlencoded',
***REMOVED***);
    const body = init?.body as URLSearchParams;
    expect(body.get('grant_type')).toBe('client_credentials');
    expect(body.get('client_id')).toBe('client-id');
    expect(body.get('client_secret')).toBe('client-secret');
  ***REMOVED***);

  it('reuses a cached token without re-fetching', async () => ***REMOVED***
    fetchMock.mockResolvedValue(makeResponse(200, tokenResponse));

    await service.authenticate();
    await service.authenticate();

    expect(fetchMock).toHaveBeenCalledTimes(1);
  ***REMOVED***);

  it('throws UnauthorizedException on invalid credentials', async () => ***REMOVED***
    fetchMock.mockResolvedValue(
      makeResponse(400, ***REMOVED***
        error: 'invalid_grant',
        error_description: 'authentication failure',
  ***REMOVED***),
    );

    await expect(service.authenticate()).rejects.toThrow(UnauthorizedException);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  ***REMOVED***);

  it('throws BadGatewayException when the auth service is unreachable', async () => ***REMOVED***
    fetchMock.mockRejectedValue(new Error('network down'));

    await expect(service.authenticate()).rejects.toThrow(BadGatewayException);
  ***REMOVED***);

  it('throws BadGatewayException on a non-credentials Salesforce error', async () => ***REMOVED***
    fetchMock.mockResolvedValue(
      makeResponse(500, ***REMOVED*** error: 'server_error', error_description: 'boom' ***REMOVED***),
    );

    await expect(service.authenticate()).rejects.toThrow(BadGatewayException);
  ***REMOVED***);

  it.each([
    ***REMOVED*** access_token: '', instance_url: 'https://instance.salesforce.com' ***REMOVED***,
    ***REMOVED*** access_token: 'access-token', instance_url: '' ***REMOVED***,
    ***REMOVED*** access_token: 'access-token' ***REMOVED***,
***REMOVED***)('rejects a malformed successful token response', async (body) => ***REMOVED***
    fetchMock.mockResolvedValue(makeResponse(200, body));

    await expect(service.authenticate()).rejects.toThrow(BadGatewayException);
    expect(cache.getValid()).toBeNull();
  ***REMOVED***);

  it('invalidates the cache on demand', async () => ***REMOVED***
    fetchMock.mockResolvedValue(makeResponse(200, tokenResponse));
    await service.authenticate();
    expect(cache.getValid()).not.toBeNull();

    cache.clear();
    expect(cache.getValid()).toBeNull();
  ***REMOVED***);
***REMOVED***);
