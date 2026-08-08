import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { SalesforceClient } from './salesforce.client';
import type { Account, AccountListResponse } from '../accounts/types/account';
import type { CreateAccountDto } from '../accounts/dto/create-account.dto';
import type {
  SalesforceAccountRecord,
  SalesforceCreateResponse,
  SalesforceQueryResponse,
} from './types/salesforce.interfaces';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 2000;

@Injectable()
export class SalesforceService {
  private readonly logger = new Logger(SalesforceService.name);

  constructor(private readonly client: SalesforceClient) {}

  async listAccounts(limit?: number): Promise<AccountListResponse> {
    const resolvedLimit = this.resolveLimit(limit);
    const soql = `SELECT Id, Name, Phone, Website, Industry FROM Account ORDER BY Name LIMIT ${resolvedLimit}`;
    const response = await this.client.request<
      SalesforceQueryResponse<SalesforceAccountRecord>
    >(`/query?q=${encodeURIComponent(soql)}`);
    return this.toAccountList(response, resolvedLimit);
  }

  async createAccount(input: CreateAccountDto): Promise<Account> {
    const payload = this.toSalesforcePayload(input);
    const created = await this.client.request<SalesforceCreateResponse>(
      '/sobjects/Account',
      { method: 'POST', body: JSON.stringify(payload) },
    );
    if (
      !created ||
      created.success !== true ||
      typeof created.id !== 'string' ||
      created.id.trim() === ''
    ) {
      throw new BadGatewayException(
        'Salesforce returned an invalid account creation response.',
      );
    }

    const id = created.id;
    this.logger.log(`Created Salesforce Account ${id}`);
    const record = await this.client.request<SalesforceAccountRecord>(
      `/sobjects/Account/${id}?fields=Id,Name,Phone,Website,Industry`,
    );
    return this.toAccount(record);
  }

  private resolveLimit(limit?: number): number {
    if (limit === undefined || Number.isNaN(limit)) {
      return DEFAULT_LIMIT;
    }
    if (limit < 1) {
      return 1;
    }
    return limit > MAX_LIMIT ? MAX_LIMIT : Math.floor(limit);
  }

  private toAccountList(
    response: SalesforceQueryResponse<SalesforceAccountRecord>,
    limit: number,
  ): AccountListResponse {
    const records = response.records ?? [];
    const data = records.map((record) => this.toAccount(record));
    return {
      data,
      meta: {
        total: response.totalSize,
        limit,
        offset: 0,
      },
    };
  }

  private toSalesforcePayload(input: CreateAccountDto): Record<string, string> {
    const payload: Record<string, string> = {};
    if (input.name) {
      payload.Name = input.name;
    }
    if (input.phone) {
      payload.Phone = input.phone;
    }
    if (input.website) {
      payload.Website = input.website;
    }
    if (input.industry) {
      payload.Industry = input.industry;
    }
    return payload;
  }

  private toAccount(record: SalesforceAccountRecord): Account {
    return {
      id: record.Id,
      name: record.Name,
      phone: record.Phone ?? undefined,
      website: record.Website ?? undefined,
      industry: record.Industry ?? undefined,
    };
  }
}
