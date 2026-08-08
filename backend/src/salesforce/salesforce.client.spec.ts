import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  HttpException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { SalesforceClient } from './salesforce.client';
import { OauthService } from './oauth.service';
import type { CachedToken } from './token-cache';
import type { SalesforceConfig } from '../config/configuration';

const fetchMock = jest.fn() as unknown as jest.MockedFunction<typeof fetch>;
global.fetch = fetchMock;

const salesforceConfig: SalesforceConfig = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  loginUrl: 'https://login.salesforce.com',
  apiVersion: '60.0',
};

function makeConfigService(): ConfigService {
  const store: Record<string, unknown> = { salesforce: salesforceConfig };
  return {
    get: jest.fn(((key: string) => store[key]) as (key: string) => unknown),
  } as unknown as ConfigService;
}

function makeToken(token = 'access-token-1'): CachedToken {
  return {
    accessToken: token,
    instanceUrl: 'https://instance.salesforce.com',
    expiresAt: Date.now() + 3600_000,
  };
}

function makeResponse(status: number, body: unknown): Response {
  return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
    status,
  });
}

function headersOf(init: RequestInit): Record<string, string> {
  return init.headers as Record<string, string>;
}

describe('SalesforceClient', () => {
  let client: SalesforceClient;
  let oauthService: { authenticate: jest.Mock; invalidate: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    oauthService = {
      authenticate: jest.fn(),
      invalidate: jest.fn(),
    };
    client = new SalesforceClient(
      makeConfigService(),
      oauthService as unknown as OauthService,
    );
  });

  it('builds the request URL and attaches the bearer token', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(makeResponse(200, { records: [] }));

    await client.request('/query');

    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://instance.salesforce.com/services/data/v60.0/query',
    );
    expect(
      headersOf(fetchMock.mock.calls[0][1] as RequestInit).Authorization,
    ).toBe('Bearer access-token-1');
  });

  it('parses the JSON response body', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(
      makeResponse(200, { totalSize: 1, records: [{ Id: '001' }] }),
    );

    const result = await client.request('/sobjects/Account');

    expect(result).toEqual({ totalSize: 1, records: [{ Id: '001' }] });
  });

  it('retries once with a refreshed token after a 401', async () => {
    oauthService.authenticate
      .mockResolvedValueOnce(makeToken('first'))
      .mockResolvedValueOnce(makeToken('second'));
    fetchMock
      .mockResolvedValueOnce(
        makeResponse(401, [
          { errorCode: 'INVALID_SESSION_ID', message: 'session expired' },
        ]),
      )
      .mockResolvedValueOnce(makeResponse(200, { records: [] }));

    await client.request('/query');

    expect(oauthService.authenticate).toHaveBeenCalledTimes(2);
    expect(oauthService.invalidate).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(
      headersOf(fetchMock.mock.calls[1][1] as RequestInit).Authorization,
    ).toBe('Bearer second');
  });

  it('throws UnauthorizedException when the retry also returns 401', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(
      makeResponse(401, [
        { errorCode: 'INVALID_SESSION_ID', message: 'session expired' },
      ]),
    );

    await expect(client.request('/query')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('translates non-401 Salesforce errors', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(
      makeResponse(400, [
        {
          errorCode: 'FIELD_CUSTOM_VALIDATION_EXCEPTION',
          message: 'field error',
        },
      ]),
    );

    await expect(
      client.request('/sobjects/Account', {
        method: 'POST',
        body: '{}',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('passes the request body for POST requests', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockResolvedValue(makeResponse(200, { id: '001' }));

    await client.request('/sobjects/Account', {
      method: 'POST',
      body: JSON.stringify({ Name: 'Acme' }),
    });

    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST');
    expect((fetchMock.mock.calls[0][1] as RequestInit).body).toBe(
      JSON.stringify({ Name: 'Acme' }),
    );
  });

  it('translates an initial network failure into a gateway error', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    fetchMock.mockRejectedValue(new TypeError('network down'));

    await expect(client.request('/query')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('translates a network failure during token retry', async () => {
    oauthService.authenticate
      .mockResolvedValueOnce(makeToken('first'))
      .mockResolvedValueOnce(makeToken('second'));
    fetchMock
      .mockResolvedValueOnce(makeResponse(401, []))
      .mockRejectedValueOnce(new TypeError('network down'));

    await expect(client.request('/query')).rejects.toThrow(
      ServiceUnavailableException,
    );
    expect(oauthService.invalidate).toHaveBeenCalledTimes(1);
  });

  it('translates an aborted request into a 504 error', async () => {
    oauthService.authenticate.mockResolvedValue(makeToken());
    const error = new Error('aborted');
    error.name = 'AbortError';
    fetchMock.mockRejectedValue(error);

    await expect(client.request('/query')).rejects.toMatchObject(
      new HttpException('Salesforce request timed out. Please try again.', 504),
    );
  });
});
