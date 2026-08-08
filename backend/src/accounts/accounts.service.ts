import { Injectable } from '@nestjs/common';
import { SalesforceService } from '../salesforce/salesforce.service';
import type {
  AccountCreateResponse,
  AccountListResponse,
} from './types/account';
import type { CreateAccountDto } from './dto/create-account.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly salesforceService: SalesforceService) {}

  async listAccounts(limit?: number): Promise<AccountListResponse> {
    return this.salesforceService.listAccounts(limit);
  }

  async createAccount(input: CreateAccountDto): Promise<AccountCreateResponse> {
    const account = await this.salesforceService.createAccount(input);
    return { data: account };
  }
}
