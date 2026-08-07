import ***REMOVED*** Body, Controller, Get, HttpCode, Post, Query ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** AccountsService ***REMOVED*** from './accounts.service';
import ***REMOVED*** CreateAccountDto ***REMOVED*** from './dto/create-account.dto';
import type ***REMOVED***
  AccountCreateResponse,
  AccountListResponse,
***REMOVED*** from './types/account';

@Controller('api/accounts')
export class AccountsController ***REMOVED***
  constructor(private readonly accountsService: AccountsService) ***REMOVED******REMOVED***

  @Get()
  @HttpCode(200)
  async listAccounts(
    @Query('limit') limit?: string,
  ): Promise<AccountListResponse> ***REMOVED***
    return this.accountsService.listAccounts(this.parseLimit(limit));
  ***REMOVED***

  @Post()
  @HttpCode(201)
  async createAccount(
    @Body() dto: CreateAccountDto,
  ): Promise<AccountCreateResponse> ***REMOVED***
    return this.accountsService.createAccount(dto);
  ***REMOVED***

  private parseLimit(limit?: string): number | undefined ***REMOVED***
    if (!limit) ***REMOVED***
      return undefined;
***REMOVED***
    const parsed = Number(limit);
    return Number.isNaN(parsed) ? undefined : parsed;
  ***REMOVED***
***REMOVED***
