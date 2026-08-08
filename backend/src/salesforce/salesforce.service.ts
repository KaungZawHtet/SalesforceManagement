import ***REMOVED*** BadGatewayException, Injectable, Logger ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** SalesforceClient ***REMOVED*** from './salesforce.client';
import type ***REMOVED*** Account, AccountListResponse ***REMOVED*** from '../accounts/types/account';
import type ***REMOVED*** CreateAccountDto ***REMOVED*** from '../accounts/dto/create-account.dto';
import ***REMOVED***
  SalesforceAccountRecord,
  SalesforceCreateResponse,
  SalesforceQueryResponse,
***REMOVED*** from './types/salesforce.interfaces';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 2000;

@Injectable()
export class SalesforceService ***REMOVED***
  private readonly logger = new Logger(SalesforceService.name);

  constructor(private readonly client: SalesforceClient) ***REMOVED******REMOVED***

  async listAccounts(limit?: number): Promise<AccountListResponse> ***REMOVED***
    const resolvedLimit = this.resolveLimit(limit);
    const soql = `SELECT Id, Name, Phone, Website, Industry FROM Account ORDER BY Name LIMIT $***REMOVED***resolvedLimit***REMOVED***`;
    const response = await this.client.request<
      SalesforceQueryResponse<SalesforceAccountRecord>
    >(`/query?q=$***REMOVED***encodeURIComponent(soql)***REMOVED***`);
    return this.toAccountList(response, resolvedLimit);
  ***REMOVED***

  async createAccount(input: CreateAccountDto): Promise<Account> ***REMOVED***
    const payload = this.toSalesforcePayload(input);
    const created = await this.client.request<SalesforceCreateResponse>(
      '/sobjects/Account',
      ***REMOVED*** method: 'POST', body: JSON.stringify(payload) ***REMOVED***,
    );
    if (
      !created ||
      created.success !== true ||
      typeof created.id !== 'string' ||
      created.id.trim() === ''
    ) ***REMOVED***
      throw new BadGatewayException(
        'Salesforce returned an invalid account creation response.',
      );
***REMOVED***

    const id = created.id;
    this.logger.log(`Created Salesforce Account $***REMOVED***id***REMOVED***`);
    const record = await this.client.request<SalesforceAccountRecord>(
      `/sobjects/Account/$***REMOVED***id***REMOVED***?fields=Id,Name,Phone,Website,Industry`,
    );
    return this.toAccount(record);
  ***REMOVED***

  private resolveLimit(limit?: number): number ***REMOVED***
    if (limit === undefined || Number.isNaN(limit)) ***REMOVED***
      return DEFAULT_LIMIT;
***REMOVED***
    if (limit < 1) ***REMOVED***
      return 1;
***REMOVED***
    return limit > MAX_LIMIT ? MAX_LIMIT : Math.floor(limit);
  ***REMOVED***

  private toAccountList(
    response: SalesforceQueryResponse<SalesforceAccountRecord>,
    limit: number,
  ): AccountListResponse ***REMOVED***
    const records = response.records ?? [];
    const data = records.map((record) => this.toAccount(record));
    return ***REMOVED***
      data,
      meta: ***REMOVED***
        total: response.totalSize,
        limit,
        offset: 0,
  ***REMOVED***
***REMOVED***;
  ***REMOVED***

  private toSalesforcePayload(input: CreateAccountDto): Record<string, string> ***REMOVED***
    const payload: Record<string, string> = ***REMOVED******REMOVED***;
    if (input.name) ***REMOVED***
      payload.Name = input.name;
***REMOVED***
    if (input.phone) ***REMOVED***
      payload.Phone = input.phone;
***REMOVED***
    if (input.website) ***REMOVED***
      payload.Website = input.website;
***REMOVED***
    if (input.industry) ***REMOVED***
      payload.Industry = input.industry;
***REMOVED***
    return payload;
  ***REMOVED***

  private toAccount(record: SalesforceAccountRecord): Account ***REMOVED***
    return ***REMOVED***
      id: record.Id,
      name: record.Name,
      phone: record.Phone ?? undefined,
      website: record.Website ?? undefined,
      industry: record.Industry ?? undefined,
***REMOVED***;
  ***REMOVED***
***REMOVED***
