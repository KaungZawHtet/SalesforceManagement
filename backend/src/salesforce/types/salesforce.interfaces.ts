export interface SalesforceTokenResponse {
  access_token: string;
  instance_url?: string;
  id?: string;
  token_type?: string;
  issued_at?: string;
  signature?: string;
  scope?: string;
  refresh_token?: string;
  community_id?: string;
  user_id?: string;
  expires_in?: number | string;
  error?: string;
  error_description?: string;
}

export interface SalesforceError {
  errorCode?: string;
  message: string;
  fields?: string[];
  statusCode?: string;
}

export interface SalesforceAccountRecord {
  Id: string;
  Name: string;
  Phone?: string | null;
  Website?: string | null;
  Industry?: string | null;
}

export interface SalesforceQueryResponse<T> {
  totalSize: number;
  done: boolean;
  records: T[];
}

export interface SalesforceCreateResponse {
  id: string;
  success: boolean;
  errors: SalesforceError[];
}
