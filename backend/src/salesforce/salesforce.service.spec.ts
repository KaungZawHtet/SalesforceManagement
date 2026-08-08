import { SalesforceService } from './salesforce.service';
import { SalesforceClient } from './salesforce.client';
import { CreateAccountDto } from '../accounts/dto/create-account.dto';
import { BadGatewayException } from '@nestjs/common';

type SalesforceRequestMock = jest.MockedFunction<
  (path: string, init?: RequestInit) => Promise<unknown>
>;

describe('SalesforceService', () => {
  let service: SalesforceService;
  let client: { request: SalesforceRequestMock };

  beforeEach(() => {
    client = { request: jest.fn() as SalesforceRequestMock };
    service = new SalesforceService(client as unknown as SalesforceClient);
  });

  it('maps a query response into application accounts', async () => {
    client.request.mockResolvedValue({
      totalSize: 2,
      done: true,
      records: [
        {
          Id: '001a',
          Name: 'Acme',
          Phone: '123',
          Website: 'https://acme.com',
          Industry: 'Tech',
          attributes: { type: 'Account' },
        },
        {
          Id: '001b',
          Name: 'Globex',
          Phone: null,
          Website: null,
          Industry: null,
          attributes: { type: 'Account' },
        },
      ],
    });

    const result = await service.listAccounts(10);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual({
      id: '001a',
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
    });
    expect(result.data[1].phone).toBeUndefined();
    expect(result.meta).toEqual({ total: 2, limit: 10, offset: 0 });

    const path = client.request.mock.calls[0][0];
    expect(decodeURIComponent(path)).toContain(
      'SELECT Id, Name, Phone, Website, Industry FROM Account ORDER BY Name LIMIT 10',
    );
  });

  it('uses the default limit when none is provided', async () => {
    client.request.mockResolvedValue({
      totalSize: 0,
      done: true,
      records: [],
    });

    await service.listAccounts();

    const path = decodeURIComponent(client.request.mock.calls[0][0]);
    expect(path).toContain('LIMIT 100');
  });

  it('clamps an oversized limit to the maximum', async () => {
    client.request.mockResolvedValue({
      totalSize: 0,
      done: true,
      records: [],
    });

    await service.listAccounts(5000);

    const path = decodeURIComponent(client.request.mock.calls[0][0]);
    expect(path).toContain('LIMIT 2000');
  });

  it('clamps a limit below one to one', async () => {
    client.request.mockResolvedValue({
      totalSize: 0,
      done: true,
      records: [],
    });

    await service.listAccounts(-5);

    const path = decodeURIComponent(client.request.mock.calls[0][0]);
    expect(path).toContain('LIMIT 1');
  });

  it('creates an account and re-selects the created record', async () => {
    client.request
      .mockResolvedValueOnce({
        id: '001new',
        success: true,
        errors: [],
      })
      .mockResolvedValueOnce({
        Id: '001new',
        Name: 'Acme',
        Phone: '123',
        Website: 'https://acme.com',
        Industry: 'Tech',
      });

    const input = {
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
    } as CreateAccountDto;
    const result = await service.createAccount(input);

    expect(client.request).toHaveBeenCalledTimes(2);
    expect(client.request.mock.calls[0][0]).toBe('/sobjects/Account');
    expect(client.request.mock.calls[0][1]).toEqual({
      method: 'POST',
      body: JSON.stringify({
        Name: 'Acme',
        Phone: '123',
        Website: 'https://acme.com',
        Industry: 'Tech',
      }),
    });
    expect(client.request.mock.calls[1][0]).toBe(
      '/sobjects/Account/001new?fields=Id,Name,Phone,Website,Industry',
    );
    expect(result).toEqual({
      id: '001new',
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
    });
  });

  it('omits empty optional fields in the Salesforce payload', async () => {
    client.request
      .mockResolvedValueOnce({ id: '001x', success: true, errors: [] })
      .mockResolvedValueOnce({
        Id: '001x',
        Name: 'Solo',
        Phone: null,
        Website: null,
        Industry: null,
      });

    await service.createAccount({ name: 'Solo' });

    const init = client.request.mock.calls[0][1];
    expect(JSON.parse(init?.body as string)).toEqual({ Name: 'Solo' });
  });

  it('rejects a malformed create response before fetching the record', async () => {
    client.request.mockResolvedValueOnce({ success: true, id: '' });

    await expect(service.createAccount({ name: 'Broken' })).rejects.toThrow(
      BadGatewayException,
    );
    expect(client.request).toHaveBeenCalledTimes(1);
  });
});
