import { Injectable } from '@nestjs/common';
import type { SalesforceTokenResponse } from './types/salesforce.interfaces';

export const TOKEN_EXPIRY_MARGIN_MS = 60_000;

export interface CachedToken {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
}

@Injectable()
export class TokenCache {
  private cache: CachedToken | null = null;

  getValid(): CachedToken | null {
    if (!this.cache) {
      return null;
    }
    if (Date.now() >= this.cache.expiresAt - TOKEN_EXPIRY_MARGIN_MS) {
      this.clear();
      return null;
    }
    return this.cache;
  }

  set(token: SalesforceTokenResponse, expiresIn: number): void {
    this.cache = {
      accessToken: token.access_token,
      instanceUrl: token.instance_url || '',
      expiresAt: Date.now() + expiresIn * 1000,
    };
  }

  clear(): void {
    this.cache = null;
  }
}
