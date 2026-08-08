import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import type {
  AccountCreateResponse,
  AccountListResponse,
} from './types/account';

@Controller('api/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @HttpCode(200)
  async listAccounts(
    @Query('limit') limit?: string,
  ): Promise<AccountListResponse> {
    return this.accountsService.listAccounts(this.parseLimit(limit));
  }

  @Post()
  @HttpCode(201)
  async createAccount(
    @Body() dto: CreateAccountDto,
  ): Promise<AccountCreateResponse> {
    return this.accountsService.createAccount(dto);
  }

  private parseLimit(limit?: string): number | undefined {
    if (!limit) {
      return undefined;
    }
    const parsed = Number(limit);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
}
