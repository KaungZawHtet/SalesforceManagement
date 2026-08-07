import ***REMOVED*** SalesforceService ***REMOVED*** from './salesforce.service';
import ***REMOVED*** SalesforceClient ***REMOVED*** from './salesforce.client';
import ***REMOVED*** CreateAccountDto ***REMOVED*** from '../accounts/dto/create-account.dto';

type SalesforceRequestMock = jest.MockedFunction<
  (path: string, init?: RequestInit) => Promise<unknown>
>;

describe('SalesforceService', () => ***REMOVED***
  let service: SalesforceService;
  let client: ***REMOVED*** request: SalesforceRequestMock ***REMOVED***;

  beforeEach(() => ***REMOVED***
    client = ***REMOVED*** request: jest.fn() as SalesforceRequestMock ***REMOVED***;
    service = new SalesforceService(client as unknown as SalesforceClient);
  ***REMOVED***);

  it('maps a query response into application accounts', async () => ***REMOVED***
    client.request.mockResolvedValue(***REMOVED***
      totalSize: 2,
      done: true,
      records: [
        ***REMOVED***
          Id: '001a',
          Name: 'Acme',
          Phone: '123',
          Website: 'https://acme.com',
          Industry: 'Tech',
          attributes: ***REMOVED*** type: 'Account' ***REMOVED***,
    ***REMOVED***
        ***REMOVED***
          Id: '001b',
          Name: 'Globex',
          Phone: null,
          Website: null,
          Industry: null,
          attributes: ***REMOVED*** type: 'Account' ***REMOVED***,
    ***REMOVED***
    ***REMOVED***,
***REMOVED***);

    const result = await service.listAccounts(10);

    expect(result.data).toHaveLength(2);
    expect(result.data[0]).toEqual(***REMOVED***
      id: '001a',
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
***REMOVED***);
    expect(result.data[1].phone).toBeUndefined();
    expect(result.meta).toEqual(***REMOVED*** total: 2, limit: 10, offset: 0 ***REMOVED***);

    const path = client.request.mock.calls[0][0];
    expect(decodeURIComponent(path)).toContain(
      'SELECT Id, Name, Phone, Website, Industry FROM Account ORDER BY Name LIMIT 10',
    );
  ***REMOVED***);

  it('uses the default limit when none is provided', async () => ***REMOVED***
    client.request.mockResolvedValue(***REMOVED***
      totalSize: 0,
      done: true,
      records: [],
***REMOVED***);

    await service.listAccounts();

    const path = decodeURIComponent(client.request.mock.calls[0][0]);
    expect(path).toContain('LIMIT 100');
  ***REMOVED***);

  it('clamps an oversized limit to the maximum', async () => ***REMOVED***
    client.request.mockResolvedValue(***REMOVED***
      totalSize: 0,
      done: true,
      records: [],
***REMOVED***);

    await service.listAccounts(5000);

    const path = decodeURIComponent(client.request.mock.calls[0][0]);
    expect(path).toContain('LIMIT 2000');
  ***REMOVED***);

  it('clamps a limit below one to one', async () => ***REMOVED***
    client.request.mockResolvedValue(***REMOVED***
      totalSize: 0,
      done: true,
      records: [],
***REMOVED***);

    await service.listAccounts(-5);

    const path = decodeURIComponent(client.request.mock.calls[0][0]);
    expect(path).toContain('LIMIT 1');
  ***REMOVED***);

  it('creates an account and re-selects the created record', async () => ***REMOVED***
    client.request
      .mockResolvedValueOnce(***REMOVED***
        id: '001new',
        success: true,
        errors: [],
  ***REMOVED***)
      .mockResolvedValueOnce(***REMOVED***
        Id: '001new',
        Name: 'Acme',
        Phone: '123',
        Website: 'https://acme.com',
        Industry: 'Tech',
  ***REMOVED***);

    const input = ***REMOVED***
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
***REMOVED*** as CreateAccountDto;
    const result = await service.createAccount(input);

    expect(client.request).toHaveBeenCalledTimes(2);
    expect(client.request.mock.calls[0][0]).toBe('/sobjects/Account');
    expect(client.request.mock.calls[0][1]).toEqual(***REMOVED***
      method: 'POST',
      body: JSON.stringify(***REMOVED***
        Name: 'Acme',
        Phone: '123',
        Website: 'https://acme.com',
        Industry: 'Tech',
  ***REMOVED***),
***REMOVED***);
    expect(client.request.mock.calls[1][0]).toBe(
      '/sobjects/Account/001new?fields=Id,Name,Phone,Website,Industry',
    );
    expect(result).toEqual(***REMOVED***
      id: '001new',
      name: 'Acme',
      phone: '123',
      website: 'https://acme.com',
      industry: 'Tech',
***REMOVED***);
  ***REMOVED***);

  it('omits empty optional fields in the Salesforce payload', async () => ***REMOVED***
    client.request
      .mockResolvedValueOnce(***REMOVED*** id: '001x', success: true, errors: [] ***REMOVED***)
      .mockResolvedValueOnce(***REMOVED***
        Id: '001x',
        Name: 'Solo',
        Phone: null,
        Website: null,
        Industry: null,
  ***REMOVED***);

    await service.createAccount(***REMOVED*** name: 'Solo' ***REMOVED***);

    const init = client.request.mock.calls[0][1];
    expect(JSON.parse(init.body as string)).toEqual(***REMOVED*** Name: 'Solo' ***REMOVED***);
  ***REMOVED***);
***REMOVED***);
