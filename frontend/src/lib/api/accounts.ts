import ***REMOVED*** type ApiErrorBody, type Account, type AccountCreateResponse, type AccountListResponse ***REMOVED*** from '../../types/account';

const NETWORK_MESSAGE = 'Unable to reach the server. Please check your connection and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

function friendly(status: number): string ***REMOVED***
  if (status === 400) ***REMOVED***
    return 'Please check the form and try again.';
  ***REMOVED***
  if (status === 401 || status === 403) ***REMOVED***
    return 'You are not authorised to perform this action.';
  ***REMOVED***
  if (status === 404) ***REMOVED***
    return 'The requested information could not be found.';
  ***REMOVED***
  if (status >= 500) ***REMOVED***
    return 'The server is currently unavailable. Please try again shortly.';
  ***REMOVED***
  return GENERIC_MESSAGE;
***REMOVED***

function isErrorBody(value: unknown): value is ApiErrorBody ***REMOVED***
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return typeof r.statusCode === 'number' && typeof r.message === 'string';
***REMOVED***

interface FetchOptions ***REMOVED***
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: string;
***REMOVED***

export async function fetchJson<T>(path: string, options: FetchOptions = ***REMOVED******REMOVED***): Promise<T> ***REMOVED***
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) ***REMOVED***
    throw ***REMOVED*** statusCode: 0, message: 'API URL is not configured.' ***REMOVED*** as ApiErrorBody;
  ***REMOVED***
  const url = `$***REMOVED***baseUrl***REMOVED***$***REMOVED***path***REMOVED***`;
  let res: Response;
  try ***REMOVED***
    res = await fetch(url, ***REMOVED***
      method: options.method ?? 'GET',
      headers: ***REMOVED***
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? ***REMOVED******REMOVED***),
  ***REMOVED***
      body: options.body,
      cache: 'no-store',
***REMOVED***);
  ***REMOVED*** catch ***REMOVED***
    throw ***REMOVED*** statusCode: 0, message: NETWORK_MESSAGE ***REMOVED*** as ApiErrorBody;
  ***REMOVED***

  const text = await res.text();
  if (!text) ***REMOVED***
    if (!res.ok) ***REMOVED***
      throw ***REMOVED*** statusCode: res.status, message: friendly(res.status) ***REMOVED*** as ApiErrorBody;
***REMOVED***
    return null as T;
  ***REMOVED***
  let body: unknown;
  try ***REMOVED***
    body = JSON.parse(text);
  ***REMOVED*** catch ***REMOVED***
    if (!res.ok) ***REMOVED***
      throw ***REMOVED*** statusCode: res.status, message: friendly(res.status) ***REMOVED*** as ApiErrorBody;
***REMOVED***
    return text as T;
  ***REMOVED***

  if (!res.ok) ***REMOVED***
    const errors = isErrorBody(body) ? body.errors : undefined;
    throw ***REMOVED*** statusCode: res.status, message: friendly(res.status), errors ***REMOVED*** as ApiErrorBody;
  ***REMOVED***

  return body as T;
***REMOVED***

export async function getAccounts(limit?: number): Promise<AccountListResponse> ***REMOVED***
  const params = limit ? `?limit=$***REMOVED***encodeURIComponent(String(limit))***REMOVED***` : '';
  return fetchJson<AccountListResponse>(`/api/accounts$***REMOVED***params***REMOVED***`);
***REMOVED***

export async function createAccount(values: ***REMOVED***
  name: string;
  phone?: string;
  website?: string;
  industry?: string;
***REMOVED***): Promise<Account> ***REMOVED***
  const payload: Record<string, string | undefined> = ***REMOVED***
    name: values.name,
  ***REMOVED***;
  if (values.phone?.trim()) ***REMOVED***
    payload.phone = values.phone.trim();
  ***REMOVED***
  if (values.website?.trim()) ***REMOVED***
    payload.website = values.website.trim();
  ***REMOVED***
  if (values.industry?.trim()) ***REMOVED***
    payload.industry = values.industry.trim();
  ***REMOVED***
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined && v !== '')
  ) as Record<string, string>;

  const res = await fetchJson<AccountCreateResponse>('/api/accounts', ***REMOVED***
    method: 'POST',
    body: JSON.stringify(cleaned),
  ***REMOVED***);
  return res.data;
***REMOVED***