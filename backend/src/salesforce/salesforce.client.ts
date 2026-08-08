import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { SalesforceConfig } from '../config/configuration';
import { translateSalesforceError } from './salesforce.errors';
import type { CachedToken } from './token-cache';
import { OauthService } from './oauth.service';

const SF_TIMEOUT_MS = 10_000;

@Injectable()
export class SalesforceClient {
  private readonly logger = new Logger(SalesforceClient.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly oauthService: OauthService,
  ) {}

  async request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.oauthService.authenticate();
    let response: Response;

    try {
      response = await this.fetchWithAuth(path, init, token);
    } catch (error) {
      throw this.translateRequestError(error);
    }

    if (response.status === 401) {
      this.logger.warn(
        'Salesforce returned 401; refreshing token and retrying the request',
      );
      this.oauthService.invalidate();
      const refreshedToken = await this.oauthService.authenticate();
      try {
        response = await this.fetchWithAuth(path, init, refreshedToken);
      } catch (error) {
        throw this.translateRequestError(error);
      }
      if (response.status === 401) {
        const body = await this.parseBody(response);
        throw translateSalesforceError(401, body);
      }
    }

    return this.handleResponse<T>(response);
  }

  private async fetchWithAuth(
    path: string,
    init: RequestInit,
    token: CachedToken,
  ): Promise<Response> {
    const config = this.getSalesforceConfig();
    const url = this.buildUrl(path, config.apiVersion, token.instanceUrl);
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
    };
    if (init.headers) {
      Object.assign(headers, init.headers as Record<string, string>);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SF_TIMEOUT_MS);

    try {
      return await fetch(url, {
        method: init.method ?? 'GET',
        headers,
        body: init.body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const body = await this.parseBody(response);
      throw translateSalesforceError(response.status, body);
    }
    const text = await response.text();
    if (!text) {
      return null as unknown as T;
    }
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private translateRequestError(error: unknown): Error {
    if (error instanceof Error && error.name === 'AbortError') {
      this.logger.warn(`Salesforce request timed out after ${SF_TIMEOUT_MS}ms`);
      return translateSalesforceError(504, {});
    }

    this.logger.error('Network error while contacting the Salesforce API');
    return translateSalesforceError(502, {});
  }

  private buildUrl(
    path: string,
    apiVersion: string,
    instanceUrl: string,
  ): string {
    const base = instanceUrl.replace(/\/+$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}/services/data/v${apiVersion}${normalizedPath}`;
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
