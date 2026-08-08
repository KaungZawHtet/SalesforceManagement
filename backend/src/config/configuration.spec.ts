import ***REMOVED*** validateEnv ***REMOVED*** from './configuration';

const validEnv = ***REMOVED***
  SF_CLIENT_ID: 'client-id',
  SF_CLIENT_SECRET: 'client-secret',
  SF_LOGIN_URL: 'https://login.salesforce.com',
  SF_API_VERSION: '60.0',
  CORS_ORIGIN: 'http://localhost:3001',
  PORT: '3000',
***REMOVED***;

describe('validateEnv', () => ***REMOVED***
  it('accepts the client credentials configuration', () => ***REMOVED***
    expect(validateEnv(validEnv)).toBe(validEnv);
  ***REMOVED***);

  it.each([
    ['PORT', '0'],
    ['PORT', 'not-a-port'],
    ['SF_API_VERSION', 'v60'],
    ['SF_LOGIN_URL', 'salesforce.invalid'],
    ['CORS_ORIGIN', 'ftp://localhost:3001'],
***REMOVED***)('rejects an invalid %s value', (key, value) => ***REMOVED***
    expect(() => validateEnv(***REMOVED*** ...validEnv, [key]: value ***REMOVED***)).toThrow();
  ***REMOVED***);

  it('rejects missing client credentials', () => ***REMOVED***
    const missingSecret = ***REMOVED*** ...validEnv ***REMOVED***;
    delete missingSecret.SF_CLIENT_SECRET;

    expect(() => validateEnv(missingSecret)).toThrow(
      'Missing required environment variable: SF_CLIENT_SECRET',
    );
  ***REMOVED***);
***REMOVED***);
