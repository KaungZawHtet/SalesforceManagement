import { validateEnv } from './configuration';

const validEnv = {
  SF_CLIENT_ID: 'client-id',
  SF_CLIENT_SECRET: 'client-secret',
  SF_LOGIN_URL: 'https://login.salesforce.com',
  SF_API_VERSION: '60.0',
  CORS_ORIGIN: 'http://localhost:3001',
  PORT: '3000',
};

describe('validateEnv', () => {
  it('accepts the client credentials configuration', () => {
    expect(validateEnv(validEnv)).toBe(validEnv);
  });

  it.each([
    ['PORT', '0'],
    ['PORT', 'not-a-port'],
    ['SF_API_VERSION', 'v60'],
    ['SF_LOGIN_URL', 'salesforce.invalid'],
    ['CORS_ORIGIN', 'ftp://localhost:3001'],
  ])('rejects an invalid %s value', (key, value) => {
    expect(() => validateEnv({ ...validEnv, [key]: value })).toThrow();
  });

  it('rejects missing client credentials', () => {
    const missingSecret = { ...validEnv };
    delete missingSecret.SF_CLIENT_SECRET;

    expect(() => validateEnv(missingSecret)).toThrow(
      'Missing required environment variable: SF_CLIENT_SECRET',
    );
  });
});
