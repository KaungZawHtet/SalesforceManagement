import type {
  ApiErrorBody,
  Account,
  AccountCreateResponse,
  AccountListResponse,
} from '../../types/account';

const NETWORK_MESSAGE = 'Unable to reach the server. Please check your connection and try again.';
const GENERIC_MESSAGE = 'Something went wrong. Please try again.';

function friendly(status: number): string {
  if (status === 400) {
    return 'Please check the form and try again.';
  }
  if (status === 401 || status === 403) {
    return 'You are not authorised to perform this action.';
  }
  if (status === 404) {
    return 'The requested information could not be found.';
  }
  if (status >= 500) {
    return 'The server is currently unavailable. Please try again shortly.';
  }
  return GENERIC_MESSAGE;
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.statusCode === 'number' && typeof record.message === 'string';
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: HeadersInit;
  body?: string;
}

export async function fetchJson<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw { statusCode: 0, message: 'API URL is not configured.' } as ApiErrorBody;
  }

  const url = `${baseUrl}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers ?? {}),
      },
      body: options.body,
      cache: 'no-store',
    });
  } catch {
    throw { statusCode: 0, message: NETWORK_MESSAGE } as ApiErrorBody;
  }

  const text = await res.text();
  if (!text) {
    if (!res.ok) {
      throw { statusCode: res.status, message: friendly(res.status) } as ApiErrorBody;
    }
    return null as T;
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    if (!res.ok) {
      throw { statusCode: res.status, message: friendly(res.status) } as ApiErrorBody;
    }
    return text as T;
  }

  if (!res.ok) {
    const errors = isErrorBody(body) ? body.errors : undefined;
    throw { statusCode: res.status, message: friendly(res.status), errors } as ApiErrorBody;
  }

  return body as T;
}

export async function getAccounts(limit?: number): Promise<AccountListResponse> {
  const params = limit ? `?limit=${encodeURIComponent(String(limit))}` : '';
  return fetchJson<AccountListResponse>(`/api/accounts${params}`);
}

export async function createAccount(values: {
  name: string;
  phone?: string;
  website?: string;
  industry?: string;
}): Promise<Account> {
  const payload: Record<string, string | undefined> = {
    name: values.name,
  };
  if (values.phone?.trim()) {
    payload.phone = values.phone.trim();
  }
  if (values.website?.trim()) {
    payload.website = values.website.trim();
  }
  if (values.industry?.trim()) {
    payload.industry = values.industry.trim();
  }
  const cleaned = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
  ) as Record<string, string>;

  const response = await fetchJson<AccountCreateResponse>('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(cleaned),
  });
  return response.data;
}
