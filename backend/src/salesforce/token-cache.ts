import ***REMOVED*** Injectable ***REMOVED*** from '@nestjs/common';
import ***REMOVED*** SalesforceTokenResponse ***REMOVED*** from './types/salesforce.interfaces';

export const TOKEN_EXPIRY_MARGIN_MS = 60_000;

export interface CachedToken ***REMOVED***
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
***REMOVED***

@Injectable()
export class TokenCache ***REMOVED***
  private cache: CachedToken | null = null;

  getValid(): CachedToken | null ***REMOVED***
    if (!this.cache) ***REMOVED***
      return null;
***REMOVED***
    if (Date.now() >= this.cache.expiresAt - TOKEN_EXPIRY_MARGIN_MS) ***REMOVED***
      this.clear();
      return null;
***REMOVED***
    return this.cache;
  ***REMOVED***

  set(token: SalesforceTokenResponse, expiresIn: number): void ***REMOVED***
    this.cache = ***REMOVED***
      accessToken: token.access_token,
      instanceUrl: token.instance_url,
      expiresAt: Date.now() + expiresIn * 1000,
***REMOVED***;
  ***REMOVED***

  clear(): void ***REMOVED***
    this.cache = null;
  ***REMOVED***
***REMOVED***
