import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { SalesforceModule } from '../salesforce/salesforce.module';

@Module({
  imports: [SalesforceModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
