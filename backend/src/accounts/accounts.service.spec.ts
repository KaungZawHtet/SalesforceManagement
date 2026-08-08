import { AccountsService } from './accounts.service';
import { SalesforceService } from '../salesforce/salesforce.service';

describe('AccountsService', () => {
  let service: AccountsService;
  let salesforceService: { listAccounts: jest.Mock; createAccount: jest.Mock };

  beforeEach(() => {
    salesforceService = {
      listAccounts: jest.fn(),
      createAccount: jest.fn(),
    };
    service = new AccountsService(
      salesforceService as unknown as SalesforceService,
    );
  });

  it('delegates listing to the Salesforce service', async () => {
    const expected = {
      data: [],
      meta: { total: 0, limit: 100, offset: 0 },
    };
    salesforceService.listAccounts.mockResolvedValue(expected);

    const result = await service.listAccounts(50);

    expect(salesforceService.listAccounts).toHaveBeenCalledWith(50);
    expect(result).toBe(expected);
  });

  it('delegates creation and wraps the result in a data envelope', async () => {
    const account = { id: '001', name: 'Acme', phone: '123' };
    salesforceService.createAccount.mockResolvedValue(account);

    const result = await service.createAccount({
      name: 'Acme',
    });

    expect(salesforceService.createAccount).toHaveBeenCalledWith({
      name: 'Acme',
    });
    expect(result).toEqual({ data: account });
  });
});
