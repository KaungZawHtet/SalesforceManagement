export interface SalesforceTokenResponse ***REMOVED***
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
  scope?: string;
  refresh_token?: string;
  community_id?: string;
  user_id?: string;
  expires_in?: number | string;
  error?: string;
  error_description?: string;
***REMOVED***

export interface SalesforceError ***REMOVED***
  errorCode?: string;
  message: string;
  fields?: string[];
  statusCode?: string;
***REMOVED***

export interface SalesforceAccountRecord ***REMOVED***
  Id: string;
  Name: string;
  Phone?: string | null;
  Website?: string | null;
  Industry?: string | null;
***REMOVED***

export interface SalesforceQueryResponse<T> ***REMOVED***
  totalSize: number;
  done: boolean;
  records: T[];
***REMOVED***

export interface SalesforceCreateResponse ***REMOVED***
  id: string;
  success: boolean;
  errors: SalesforceError[];
***REMOVED***
