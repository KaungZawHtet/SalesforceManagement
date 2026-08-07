'use client';

import ***REMOVED*** useState, useEffect, useRef ***REMOVED*** from 'react';
import ***REMOVED*** getAccounts ***REMOVED*** from '@/lib/api/accounts';
import ***REMOVED*** type Account, type AccountListResponse ***REMOVED*** from '@/types/account';
import ***REMOVED*** AccountsTable ***REMOVED*** from '@/components/accounts/accounts-table';
import ***REMOVED*** CreateAccountForm ***REMOVED*** from '@/components/accounts/create-account-form';
import ***REMOVED*** toast ***REMOVED*** from 'sonner';

export function AccountsView() ***REMOVED***
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => ***REMOVED***
    return () => ***REMOVED***
      isMounted.current = false;
***REMOVED***;
  ***REMOVED***, []);

  useEffect(() => ***REMOVED***
    const fetchAccounts = async () => ***REMOVED***
      try ***REMOVED***
        const response: AccountListResponse = await getAccounts();
        if (isMounted.current) ***REMOVED***
          setAccounts(response.data);
          setError(null);
    ***REMOVED***
  ***REMOVED*** catch (e) ***REMOVED***
        const err = e as ***REMOVED*** message: string ***REMOVED***;
        if (isMounted.current) ***REMOVED***
          setError(err.message || 'Failed to load accounts');
          setAccounts([]);
    ***REMOVED***
  ***REMOVED*** finally ***REMOVED***
        if (isMounted.current) ***REMOVED***
          setLoading(false);
    ***REMOVED***
  ***REMOVED***
***REMOVED***;
    fetchAccounts();
  ***REMOVED***, []);

  const handleCreateSuccess = (newAccount: Account) => ***REMOVED***
    setAccounts((prev) => [...prev, newAccount]);
    toast.success('Account created successfully', ***REMOVED***
      description: 'The account has been added.',
***REMOVED***);
  ***REMOVED***;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Salesforce Accounts
        </h2>
        <p className="text-muted-foreground">
          View and manage your Salesforce account records.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Create Account</h3>
          <CreateAccountForm onSuccess=***REMOVED***handleCreateSuccess***REMOVED*** />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account List</h3>
          
          ***REMOVED***loading && (
            <div className="animate-pulse space-y-2">
              <div className="h-10 bg-muted rounded-md" />
              <div className="space-y-2">
                ***REMOVED***[...Array(5)].map((_, i) => (
                  <div key=***REMOVED***i***REMOVED*** className="h-8 bg-muted rounded-md" />
                ))***REMOVED***
              </div>
            </div>
          )***REMOVED***

          ***REMOVED***error && !loading && (
            <div className="rounded-md border p-4 bg-destructive/10">
              <p className="text-sm text-destructive">***REMOVED***error***REMOVED***</p>
            </div>
          )***REMOVED***

          ***REMOVED***!loading && !error && accounts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No accounts found. Create an account to get started.
              </p>
            </div>
          )***REMOVED***

          ***REMOVED***!loading && !error && accounts.length > 0 && (
            <AccountsTable accounts=***REMOVED***accounts***REMOVED*** />
          )***REMOVED***
        </div>
      </div>
    </div>
  );
***REMOVED***