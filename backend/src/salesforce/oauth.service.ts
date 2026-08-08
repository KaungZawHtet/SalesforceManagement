import ***REMOVED***
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
***REMOVED*** from '@nestjs/common';
import ***REMOVED*** ConfigService ***REMOVED*** from '@nestjs/config';
import ***REMOVED*** SalesforceConfig ***REMOVED*** from '../config/configuration';
import ***REMOVED*** TokenCache, CachedToken ***REMOVED*** from './token-cache';
import ***REMOVED*** SalesforceTokenResponse ***REMOVED*** from './types/salesforce.interfaces';
import ***REMOVED*** translateAuthError ***REMOVED*** from './salesforce.errors';

const DEFAULT_EXPIRES_IN = 3600;

@Injectable()
export class OauthService ***REMOVED***
  private readonly logger = new Logger(OauthService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly tokenCache: TokenCache,
  ) ***REMOVED******REMOVED***

  async authenticate(): Promise<CachedToken> ***REMOVED***
    const existing = this.tokenCache.getValid();
    if (existing) ***REMOVED***
      return existing;
***REMOVED***
    return this.obtainToken();
  ***REMOVED***

  invalidate(): void ***REMOVED***
    this.tokenCache.clear();
  ***REMOVED***

  private async obtainToken(): Promise<CachedToken> ***REMOVED***
    const config = this.getSalesforceConfig();

    const body = new URLSearchParams();
    body.append('grant_type', 'client_credentials');
    body.append('client_id', config.clientId);
    body.append('client_secret', config.clientSecret);

    const url = `$***REMOVED***config.loginUrl***REMOVED***/services/oauth2/token`;
    this.logger.log('Requesting a new Salesforce access token');

    let response: Response;
    try ***REMOVED***
      response = await fetch(url, ***REMOVED***
        method: 'POST',
        headers: ***REMOVED*** 'Content-Type': 'application/x-www-form-urlencoded' ***REMOVED***,
        body,
  ***REMOVED***);
***REMOVED*** catch ***REMOVED***
      this.logger.error(
        'Network error while contacting the Salesforce auth service',
      );
      throw new BadGatewayException(
        'Unable to reach the Salesforce authentication service.',
      );
***REMOVED***

    let payload: SalesforceTokenResponse;
    try ***REMOVED***
      payload = (await response.json()) as SalesforceTokenResponse;
***REMOVED*** catch ***REMOVED***
      payload = ***REMOVED******REMOVED*** as SalesforceTokenResponse;
***REMOVED***

    if (!response.ok) ***REMOVED***
      throw translateAuthError(response, payload);
***REMOVED***

    if (
      typeof payload.access_token !== 'string' ||
      payload.access_token.trim() === '' ||
      typeof payload.instance_url !== 'string' ||
      payload.instance_url.trim() === ''
    ) ***REMOVED***
      throw new BadGatewayException(
        'Salesforce authentication returned an invalid token response.',
      );
***REMOVED***

    const expiresIn = this.parseExpiresIn(payload);
    this.tokenCache.set(payload, expiresIn);

    const cached = this.tokenCache.getValid();
    if (!cached) ***REMOVED***
      throw new InternalServerErrorException(
        'Failed to cache the Salesforce access token.',
      );
***REMOVED***
    return cached;
  ***REMOVED***

  private parseExpiresIn(response: SalesforceTokenResponse): number ***REMOVED***
    const raw = response.expires_in;
    if (raw === undefined || raw === null) ***REMOVED***
      return DEFAULT_EXPIRES_IN;
***REMOVED***
    const parsed = typeof raw === 'string' ? Number(raw) : raw;
    return Number.isFinite(parsed) ? parsed : DEFAULT_EXPIRES_IN;
  ***REMOVED***

  private getSalesforceConfig(): SalesforceConfig ***REMOVED***
    const config = this.configService.get<SalesforceConfig>('salesforce');
    if (!config) ***REMOVED***
      throw new InternalServerErrorException(
        'Salesforce configuration is not available.',
      );
***REMOVED***
    return config;
  ***REMOVED***
***REMOVED***
