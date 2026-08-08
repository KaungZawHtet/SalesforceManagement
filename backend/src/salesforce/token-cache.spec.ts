import { TokenCache } from './token-cache';
import type { SalesforceTokenResponse } from './types/salesforce.interfaces';

const tokenResponse = (): SalesforceTokenResponse => ({
  access_token: 'access-token-1',
  instance_url: 'https://instance.salesforce.com',
  id: 'id',
  token_type: 'Bearer',
  issued_at: '0',
  signature: 'signature',
  expires_in: 7200,
});

describe('TokenCache', () => {
  let cache: TokenCache;

  beforeEach(() => {
    cache = new TokenCache();
  });

  it('returns null when nothing has been cached', () => {
    expect(cache.getValid()).toBeNull();
  });

  it('stores and returns a valid token', () => {
    cache.set(tokenResponse(), 7200);

    const result = cache.getValid();

    expect(result).toMatchObject({
      accessToken: 'access-token-1',
      instanceUrl: 'https://instance.salesforce.com',
    });
    expect(typeof result?.expiresAt).toBe('number');
  });

  it('clears a previously cached token', () => {
    cache.set(tokenResponse(), 7200);
    cache.clear();
    expect(cache.getValid()).toBeNull();
  });

  it('treats a token as expired within the safety margin', () => {
    cache.set(tokenResponse(), 30);
    expect(cache.getValid()).toBeNull();
  });

  it('returns the token when it is still valid outside the margin', () => {
    cache.set(tokenResponse(), 3600);
    expect(cache.getValid()).not.toBeNull();
  });
});
