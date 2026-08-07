import ***REMOVED*** Module ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** SalesforceService ***REMOVED*** from './salesforce.service';
import ***REMOVED*** SalesforceClient ***REMOVED*** from './salesforce.client';
import ***REMOVED*** OauthService ***REMOVED*** from './oauth.service';
import ***REMOVED*** TokenCache ***REMOVED*** from './token-cache';

@Module(***REMOVED***
  providers: [TokenCache, OauthService, SalesforceClient, SalesforceService],
  exports: [SalesforceService],
***REMOVED***)
export class SalesforceModule ***REMOVED******REMOVED***
