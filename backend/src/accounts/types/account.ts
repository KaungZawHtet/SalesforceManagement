export interface Account {
  id: string;
  name: string;
  phone?: string;
  website?: string;
  industry?: string;
}

export interface AccountListMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface AccountListResponse {
  data: Account[];
  meta: AccountListMeta;
}

export interface AccountCreateResponse {
  data: Account;
}
