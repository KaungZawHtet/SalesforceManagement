import { Module } from '@nestjs/common';
import { SalesforceService } from './salesforce.service';
import { SalesforceClient } from './salesforce.client';
import { OauthService } from './oauth.service';
import { TokenCache } from './token-cache';

@Module({
  providers: [TokenCache, OauthService, SalesforceClient, SalesforceService],
  exports: [SalesforceService],
})
export class SalesforceModule {}
