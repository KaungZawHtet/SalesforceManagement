import ***REMOVED***
  Injectable,
  InternalServerErrorException,
  Logger,
***REMOVED*** from '@nestjs/common';
import ***REMOVED*** ConfigService ***REMOVED*** from '@nestjs/config';
import ***REMOVED*** SalesforceConfig ***REMOVED*** from '../config/configuration';
import ***REMOVED*** translateSalesforceError ***REMOVED*** from './salesforce.errors';
import ***REMOVED*** CachedToken ***REMOVED*** from './token-cache';
import ***REMOVED*** OauthService ***REMOVED*** from './oauth.service';

const SF_TIMEOUT_MS = 10_000;

@Injectable()
export class SalesforceClient ***REMOVED***
  private readonly logger = new Logger(SalesforceClient.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OauthService,
  ) ***REMOVED******REMOVED***

  async request<T = unknown>(path: string, init: RequestInit = ***REMOVED******REMOVED***): Promise<T> ***REMOVED***
    const token = await this.oauthService.authenticate();
    let response: Response;

    try ***REMOVED***
      response = await this.fetchWithAuth(path, init, token);
***REMOVED*** catch (err) ***REMOVED***
      throw this.translateRequestError(err);
***REMOVED***

    if (response.status === 401) ***REMOVED***
      this.logger.warn(
        'Salesforce returned 401; refreshing token and retrying the request',
      );
      this.oauthService.invalidate();
      const refreshedToken = await this.oauthService.authenticate();
      try ***REMOVED***
        response = await this.fetchWithAuth(path, init, refreshedToken);
  ***REMOVED*** catch (err) ***REMOVED***
        throw this.translateRequestError(err);
  ***REMOVED***
      if (response.status === 401) ***REMOVED***
        const body = await this.parseBody(response);
        throw translateSalesforceError(401, body);
  ***REMOVED***
***REMOVED***

    return this.handleResponse<T>(response);
  ***REMOVED***

  private async fetchWithAuth(
    path: string,
    init: RequestInit,
    token: CachedToken,
  ): Promise<Response> ***REMOVED***
    const config = this.getSalesforceConfig();
    const url = this.buildUrl(path, config.apiVersion, token.instanceUrl);
    const headers: Record<string, string> = ***REMOVED***
      Authorization: `Bearer $***REMOVED***token.accessToken***REMOVED***`,
      'Content-Type': 'application/json',
***REMOVED***;
    if (init.headers) ***REMOVED***
      Object.assign(headers, init.headers as Record<string, string>);
***REMOVED***

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SF_TIMEOUT_MS);

    try ***REMOVED***
      return await fetch(url, ***REMOVED***
        method: init.method ?? 'GET',
        headers,
        body: init.body,
        signal: controller.signal,
  ***REMOVED***);
***REMOVED*** finally ***REMOVED***
      clearTimeout(timeoutId);
***REMOVED***
  ***REMOVED***

  private async handleResponse<T>(response: Response): Promise<T> ***REMOVED***
    if (!response.ok) ***REMOVED***
      const body = await this.parseBody(response);
      throw translateSalesforceError(response.status, body);
***REMOVED***
    const text = await response.text();
    if (!text) ***REMOVED***
      return null as unknown as T;
***REMOVED***
    try ***REMOVED***
      return JSON.parse(text) as T;
***REMOVED*** catch ***REMOVED***
      return text as unknown as T;
***REMOVED***
  ***REMOVED***

  private async parseBody(response: Response): Promise<unknown> ***REMOVED***
    const text = await response.text();
    if (!text) ***REMOVED***
      return null;
***REMOVED***
    try ***REMOVED***
      return JSON.parse(text);
***REMOVED*** catch ***REMOVED***
      return text;
***REMOVED***
  ***REMOVED***

  private translateRequestError(err: unknown) ***REMOVED***
    if (err instanceof Error && err.name === 'AbortError') ***REMOVED***
      this.logger.warn(`Salesforce request timed out after $***REMOVED***SF_TIMEOUT_MS***REMOVED***ms`);
      return translateSalesforceError(504, ***REMOVED******REMOVED***);
***REMOVED***

    this.logger.error('Network error while contacting the Salesforce API');
    return translateSalesforceError(502, ***REMOVED******REMOVED***);
  ***REMOVED***

  private buildUrl(
    path: string,
    apiVersion: string,
    instanceUrl: string,
  ): string ***REMOVED***
    const base = instanceUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/$***REMOVED***path***REMOVED***`;
    return `$***REMOVED***base***REMOVED***/services/data/v$***REMOVED***apiVersion***REMOVED***$***REMOVED***normalizedPath***REMOVED***`;
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
