export interface SalesforceConfig {
  clientId: string;
  clientSecret: string;
  loginUrl: string;
  apiVersion: string;
}

export interface AppConfig {
  port: number;
  corsOrigin: string;
  salesforce: SalesforceConfig;
}

const REQUIRED_ENV: string[] = [
  'SF_CLIENT_ID',
  'SF_CLIENT_SECRET',
  'SF_LOGIN_URL',
  'SF_API_VERSION',
  'CORS_ORIGIN',
  'PORT',
];

function requireString(env: Record<string, unknown>, key: string): string {
  const value = env[key];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value.trim();
}

export function validateEnv(
  env: Record<string, unknown>,
): Record<string, unknown> {
  for (const key of REQUIRED_ENV) {
    requireString(env, key);
  }

  const port = Number(requireString(env, 'PORT'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  const apiVersion = requireString(env, 'SF_API_VERSION');
  if (!/^\d+(?:\.\d+)?$/.test(apiVersion)) {
    throw new Error('SF_API_VERSION must be a numeric Salesforce API version.');
  }

  for (const key of ['SF_LOGIN_URL', 'CORS_ORIGIN']) {
    const value = requireString(env, key);
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error();
      }
    } catch {
      throw new Error(`${key} must be a valid HTTP or HTTPS URL.`);
    }
  }
  return env;
}

export default function configuration(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3001',
    salesforce: {
      clientId: process.env.SF_CLIENT_ID ?? '',
      clientSecret: process.env.SF_CLIENT_SECRET ?? '',
      loginUrl: (
        process.env.SF_LOGIN_URL ?? 'https://login.salesforce.com'
      ).replace(/\/+$/, ''),
      apiVersion: process.env.SF_API_VERSION ?? '60.0',
    },
  };
}
