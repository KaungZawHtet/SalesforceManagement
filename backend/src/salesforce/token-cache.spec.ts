import ***REMOVED*** TokenCache ***REMOVED*** from './token-cache';
import ***REMOVED*** SalesforceTokenResponse ***REMOVED*** from './types/salesforce.interfaces';

const tokenResponse = (): SalesforceTokenResponse => (***REMOVED***
  access_token: 'access-token-1',
  instance_url: 'https://instance.salesforce.com',
  id: 'id',
  token_type: 'Bearer',
  issued_at: '0',
  signature: 'signature',
  expires_in: 7200,
***REMOVED***);

describe('TokenCache', () => ***REMOVED***
  let cache: TokenCache;

  beforeEach(() => ***REMOVED***
    cache = new TokenCache();
  ***REMOVED***);

  it('returns null when nothing has been cached', () => ***REMOVED***
    expect(cache.getValid()).toBeNull();
  ***REMOVED***);

  it('stores and returns a valid token', () => ***REMOVED***
    cache.set(tokenResponse(), 7200);

    const result = cache.getValid();

    expect(result).toMatchObject(***REMOVED***
      accessToken: 'access-token-1',
      instanceUrl: 'https://instance.salesforce.com',
***REMOVED***);
    expect(typeof result?.expiresAt).toBe('number');
  ***REMOVED***);

  it('clears a previously cached token', () => ***REMOVED***
    cache.set(tokenResponse(), 7200);
    cache.clear();
    expect(cache.getValid()).toBeNull();
  ***REMOVED***);

  it('treats a token as expired within the safety margin', () => ***REMOVED***
    cache.set(tokenResponse(), 30);
    expect(cache.getValid()).toBeNull();
  ***REMOVED***);

  it('returns the token when it is still valid outside the margin', () => ***REMOVED***
    cache.set(tokenResponse(), 3600);
    expect(cache.getValid()).not.toBeNull();
  ***REMOVED***);
***REMOVED***);
