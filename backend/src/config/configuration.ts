export interface SalesforceConfig ***REMOVED***
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  securityToken: string;
  loginUrl: string;
  apiVersion: string;
***REMOVED***

export interface AppConfig ***REMOVED***
  port: number;
  corsOrigin: string;
  salesforce: SalesforceConfig;
***REMOVED***

const REQUIRED_ENV: string[] = [
  'SF_CLIENT_ID',
  'SF_CLIENT_SECRET',
  'SF_LOGIN_URL',
  'SF_API_VERSION',
  'CORS_ORIGIN',
  'PORT',
];

export function validateEnv(
  env: Record<string, unknown>,
): Record<string, unknown> ***REMOVED***
  for (const key of REQUIRED_ENV) ***REMOVED***
    if (env[key] === undefined || env[key] === null || env[key] === '') ***REMOVED***
      throw new Error(`Missing required environment variable: $***REMOVED***key***REMOVED***`);
***REMOVED***
  ***REMOVED***
  return env;
***REMOVED***

export default function configuration(): AppConfig ***REMOVED***
  return ***REMOVED***
    port: Number(process.env.PORT ?? 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
    salesforce: ***REMOVED***
      clientId: process.env.SF_CLIENT_ID ?? '',
      clientSecret: process.env.SF_CLIENT_SECRET ?? '',
      username: process.env.SF_USERNAME ?? '',
      password: process.env.SF_PASSWORD ?? '',
      securityToken: process.env.SF_SECURITY_TOKEN ?? '',
      loginUrl: (
        process.env.SF_LOGIN_URL ?? 'https://login.salesforce.com'
      ).replace(/\/+$/, ''),
      apiVersion: process.env.SF_API_VERSION ?? '60.0',
***REMOVED***
  ***REMOVED***;
***REMOVED***
