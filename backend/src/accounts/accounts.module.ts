import ***REMOVED*** Module ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** AccountsController ***REMOVED*** from './accounts.controller';
import ***REMOVED*** AccountsService ***REMOVED*** from './accounts.service';
import ***REMOVED*** SalesforceModule ***REMOVED*** from '../salesforce/salesforce.module';

@Module(***REMOVED***
  imports: [SalesforceModule],
  controllers: [AccountsController],
  providers: [AccountsService],
***REMOVED***)
export class AccountsModule ***REMOVED******REMOVED***
