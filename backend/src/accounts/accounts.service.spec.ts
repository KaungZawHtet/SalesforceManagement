import ***REMOVED*** AccountsService ***REMOVED*** from './accounts.service';
import ***REMOVED*** SalesforceService ***REMOVED*** from '../salesforce/salesforce.service';

describe('AccountsService', () => ***REMOVED***
  let service: AccountsService;
  let salesforceService: ***REMOVED*** listAccounts: jest.Mock; createAccount: jest.Mock ***REMOVED***;

  beforeEach(() => ***REMOVED***
    salesforceService = ***REMOVED***
      listAccounts: jest.fn(),
      createAccount: jest.fn(),
***REMOVED***;
    service = new AccountsService(
      salesforceService as unknown as SalesforceService,
    );
  ***REMOVED***);

  it('delegates listing to the Salesforce service', async () => ***REMOVED***
    const expected = ***REMOVED***
      data: [],
      meta: ***REMOVED*** total: 0, limit: 100, offset: 0 ***REMOVED***,
***REMOVED***;
    salesforceService.listAccounts.mockResolvedValue(expected);

    const result = await service.listAccounts(50);

    expect(salesforceService.listAccounts).toHaveBeenCalledWith(50);
    expect(result).toBe(expected);
  ***REMOVED***);

  it('delegates creation and wraps the result in a data envelope', async () => ***REMOVED***
    const account = ***REMOVED*** id: '001', name: 'Acme', phone: '123' ***REMOVED***;
    salesforceService.createAccount.mockResolvedValue(account);

    const result = await service.createAccount(***REMOVED***
      name: 'Acme',
***REMOVED***);

    expect(salesforceService.createAccount).toHaveBeenCalledWith(***REMOVED***
      name: 'Acme',
***REMOVED***);
    expect(result).toEqual(***REMOVED*** data: account ***REMOVED***);
  ***REMOVED***);
***REMOVED***);
