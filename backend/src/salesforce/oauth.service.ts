import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SalesforceConfig } from '../config/configuration';
import { TokenCache, type CachedToken } from './token-cache';
import type { SalesforceTokenResponse } from './types/salesforce.interfaces';
import { translateAuthError } from './salesforce.errors';

const DEFAULT_EXPIRES_IN = 3600;

@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenCache: TokenCache,
  ) {}

  async authenticate(): Promise<CachedToken> {
    const existing = this.tokenCache.getValid();
    if (existing) {
      return existing;
    }
    return this.obtainToken();
  }

  invalidate(): void {
    this.tokenCache.clear();
  }

  private async obtainToken(): Promise<CachedToken> {
    const config = this.getSalesforceConfig();

    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', config.clientId);
    body.append('client_secret', config.clientSecret);

    const url = `${config.loginUrl}/services/oauth2/token`;
    this.logger.log('Requesting a new Salesforce access token');

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
    } catch {
      this.logger.error(
        'Network error while contacting the Salesforce auth service',
      );
      throw new BadGatewayException(
        'Unable to reach the Salesforce authentication service.',
      );
    }

    let payload: SalesforceTokenResponse;
    try {
      payload = (await response.json()) as SalesforceTokenResponse;
    } catch {
      payload = {} as SalesforceTokenResponse;
    }

    if (!response.ok) {
      throw translateAuthError(response, payload);
    }

    if (
      typeof payload.access_token !== 'string' ||
      payload.access_token.trim() === '' ||
      typeof payload.instance_url !== 'string' ||
      payload.instance_url.trim() === ''
    ) {
      throw new BadGatewayException(
        'Salesforce authentication returned an invalid token response.',
      );
    }

    const expiresIn = this.parseExpiresIn(payload);
    this.tokenCache.set(payload, expiresIn);

    const cached = this.tokenCache.getValid();
    if (!cached) {
      throw new InternalServerErrorException(
        'Failed to cache the Salesforce access token.',
      );
    }
    return cached;
  }

  private parseExpiresIn(response: SalesforceTokenResponse): number {
    const raw = response.expires_in;
    if (raw === undefined || raw === null) {
      return DEFAULT_EXPIRES_IN;
    }
    const parsed = typeof raw === 'string' ? Number(raw) : raw;
    return Number.isFinite(parsed) ? parsed : DEFAULT_EXPIRES_IN;
  }

  private getSalesforceConfig(): SalesforceConfig {
    const config = this.configService.get<SalesforceConfig>('salesforce');
    if (!config) {
      throw new InternalServerErrorException(
        'Salesforce configuration is not available.',
      );
    }
    return config;
  }
}
