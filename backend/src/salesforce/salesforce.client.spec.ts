import ***REMOVED*** ConfigService ***REMOVED*** from '@nestjs/config';
import ***REMOVED*** BadRequestException, UnauthorizedException ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** SalesforceClient ***REMOVED*** from './salesforce.client';
import ***REMOVED*** OauthService ***REMOVED*** from './oauth.service';
import ***REMOVED*** CachedToken ***REMOVED*** from './token-cache';
import ***REMOVED*** SalesforceConfig ***REMOVED*** from '../config/configuration';

const fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
global.fetch = fetchMock;

const salesforceConfig: SalesforceConfig = ***REMOVED***
  clientId: 'client-id',
  clientSecret: 'client-secret',
  username: 'user@example.com',
  password: 'password',
  securityToken: 'security-token',
  loginUrl: 'https://login.salesforce.com',
  apiVersion: '60.0',
***REMOVED***;

function makeConfigService(): ConfigService ***REMOVED***
  const store: Record<string, unknown> = ***REMOVED*** salesforce: salesforceConfig ***REMOVED***;
  return ***REMOVED***
    get: jest.fn(((key: string) => store[key]) as (key: string) => unknown),
  ***REMOVED*** as unknown as ConfigService;
***REMOVED***

function makeToken(token = 'access-token-1'): CachedToken ***REMOVED***
  return ***REMOVED***
    accessToken: token,
    instanceUrl: 'https://instance.salesforce.com',
    expiresAt: Date.now() + 3600_000,
  ***REMOVED***;
***REMOVED***

function makeResponse(status: number, body: unknown): Response ***REMOVED***
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), ***REMOVED***
    status,
  ***REMOVED***);
***REMOVED***

function headersOf(init: RequestInit): Record<string, string> ***REMOVED***
  return init.headers as Record<string, string>;
***REMOVED***

describe('SalesforceClient', () => ***REMOVED***
  let client: SalesforceClient;
  let oauthService: ***REMOVED*** authenticate: jest.Mock; invalidate: jest.Mock ***REMOVED***;

  beforeEach(() => ***REMOVED***
    jest.clearAllMocks();
    oauthService = ***REMOVED***
      authenticate: jest.fn(),
      invalidate: jest.fn(),
***REMOVED***;
    client = new SalesforceClient(
      makeConfigService(),
      oauthService as unknown as OauthService,
    );
  ***REMOVED***);

  it('builds the request URL and attaches the bearer token', async () => ***REMOVED***
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(makeResponse(200, ***REMOVED*** records: [] ***REMOVED***));

    await client.request('/query');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://instance.salesforce.com/services/data/v60.0/query',
    );
    expect(
      headersOf(fetchMock.mock.calls[0][1] as RequestInit).Authorization,
    ).toBe('Bearer access-token-1');
  ***REMOVED***);

  it('parses the JSON response body', async () => ***REMOVED***
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(
      makeResponse(200, ***REMOVED*** totalSize: 1, records: [***REMOVED*** Id: '001' ***REMOVED***] ***REMOVED***),
    );

    const result = await client.request('/sobjects/Account');

    expect(result).toEqual(***REMOVED*** totalSize: 1, records: [***REMOVED*** Id: '001' ***REMOVED***] ***REMOVED***);
  ***REMOVED***);

  it('retries once with a refreshed token after a 401', async () => ***REMOVED***
    oauthService.authenticate
      .mockResolvedValueOnce(makeToken('first'))
      .mockResolvedValueOnce(makeToken('second'));
    fetchMock
      .mockResolvedValueOnce(
        makeResponse(401, [
          ***REMOVED*** errorCode: 'INVALID_SESSION_ID', message: 'session expired' ***REMOVED***,
      ***REMOVED***),
      )
      .mockResolvedValueOnce(makeResponse(200, ***REMOVED*** records: [] ***REMOVED***));

    await client.request('/query');

    expect(oauthService.authenticate).toHaveBeenCalledTimes(2);
    expect(oauthService.invalidate).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      headersOf(fetchMock.mock.calls[1][1] as RequestInit).Authorization,
    ).toBe('Bearer second');
  ***REMOVED***);

  it('throws UnauthorizedException when the retry also returns 401', async () => ***REMOVED***
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(
      makeResponse(401, [
        ***REMOVED*** errorCode: 'INVALID_SESSION_ID', message: 'session expired' ***REMOVED***,
    ***REMOVED***),
    );

    await expect(client.request('/query')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  ***REMOVED***);

  it('translates non-401 Salesforce errors', async () => ***REMOVED***
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(
      makeResponse(400, [
        ***REMOVED***
          errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION',
          message: 'field error',
    ***REMOVED***
    ***REMOVED***),
    );

    await expect(
      client.request('/sobjects/Account', ***REMOVED***
        method: 'POST',
        body: '***REMOVED******REMOVED***',
  ***REMOVED***),
    ).rejects.toThrow(BadRequestException);
  ***REMOVED***);

  it('passes the request body for POST requests', async () => ***REMOVED***
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(makeResponse(200, ***REMOVED*** id: '001' ***REMOVED***));

    await client.request('/sobjects/Account', ***REMOVED***
      method: 'POST',
      body: JSON.stringify(***REMOVED*** Name: 'Acme' ***REMOVED***),
***REMOVED***);

    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST');
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBe(
      JSON.stringify(***REMOVED*** Name: 'Acme' ***REMOVED***),
    );
  ***REMOVED***);
***REMOVED***);
