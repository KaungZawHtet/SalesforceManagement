export interface SalesforceConfig ***REMOVED***
  clientId: string;
  clientSecret: string;
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

function requireString(env: Record<string, unknown>, key: string): string ***REMOVED***
  const value = env[key];
  if (typeof value !== 'string' || value.trim() === '') ***REMOVED***
    throw new Error(`Missing required environment variable: $***REMOVED***key***REMOVED***`);
  ***REMOVED***
  return value.trim();
***REMOVED***

export function validateEnv(
  env: Record<string, unknown>,
): Record<string, unknown> ***REMOVED***
  for (const key of REQUIRED_ENV) ***REMOVED***
    requireString(env, key);
  ***REMOVED***

  const port = Number(requireString(env, 'PORT'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) ***REMOVED***
    throw new Error('PORT must be an integer between 1 and 65535.');
  ***REMOVED***

  const apiVersion = requireString(env, 'SF_API_VERSION');
  if (!/^\d+(?:\.\d+)?$/.test(apiVersion)) ***REMOVED***
    throw new Error('SF_API_VERSION must be a numeric Salesforce API version.');
  ***REMOVED***

  for (const key of ['SF_LOGIN_URL', 'CORS_ORIGIN']) ***REMOVED***
    const value = requireString(env, key);
    try ***REMOVED***
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) ***REMOVED***
        throw new Error();
  ***REMOVED***
***REMOVED*** catch ***REMOVED***
      throw new Error(`$***REMOVED***key***REMOVED*** must be a valid HTTP or HTTPS URL.`);
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
      loginUrl: (
        process.env.SF_LOGIN_URL ?? 'https://login.salesforce.com'
      ).replace(/\/+$/, ''),
      apiVersion: process.env.SF_API_VERSION ?? '60.0',
***REMOVED***
  ***REMOVED***;
***REMOVED***
