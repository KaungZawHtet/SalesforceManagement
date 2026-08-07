export interface Account ***REMOVED***
  id: string;
  name: string;
  phone?: string;
  website?: string;
  industry?: string;
***REMOVED***

export interface AccountListMeta ***REMOVED***
  total: number;
  limit: number;
  offset: number;
***REMOVED***

export interface AccountListResponse ***REMOVED***
  data: Account[];
  meta: AccountListMeta;
***REMOVED***

export interface AccountCreateResponse ***REMOVED***
  data: Account;
***REMOVED***
