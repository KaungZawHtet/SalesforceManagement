import ***REMOVED*** Injectable ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** SalesforceService ***REMOVED*** from '../salesforce/salesforce.service';
import type ***REMOVED***
  AccountCreateResponse,
  AccountListResponse,
***REMOVED*** from './types/account';
import type ***REMOVED*** CreateAccountDto ***REMOVED*** from './dto/create-account.dto';

@Injectable()
export class AccountsService ***REMOVED***
  constructor(private readonly salesforceService: SalesforceService) ***REMOVED******REMOVED***

  async listAccounts(limit?: number): Promise<AccountListResponse> ***REMOVED***
    return this.salesforceService.listAccounts(limit);
  ***REMOVED***

  async createAccount(input: CreateAccountDto): Promise<AccountCreateResponse> ***REMOVED***
    const account = await this.salesforceService.createAccount(input);
    return ***REMOVED*** data: account ***REMOVED***;
  ***REMOVED***
***REMOVED***
