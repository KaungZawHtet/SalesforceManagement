'use client';

import { useState, useEffect, useRef, useCallback, startTransition } from 'react';
import { Building2, CircleAlert, Users } from 'lucide-react';
import { getAccounts } from '@/lib/api/accounts';
import type { Account, AccountListResponse } from '@/types/account';
import { AccountsTable } from '@/components/accounts/accounts-table';
import { CreateAccountForm } from '@/components/accounts/create-account-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export function AccountsView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadAccounts = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setAccounts([]);

    try {
      const response: AccountListResponse = await getAccounts();
      if (isMounted.current) {
        setAccounts(response.data);
      }
      return true;
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'Failed to load accounts';
      if (isMounted.current) {
        setError(message);
        setAccounts([]);
      }
      return false;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      void loadAccounts();
    });
  }, [loadAccounts]);

  const handleCreateSuccess = async () => {
    if (await loadAccounts()) {
      toast.success('Account created successfully', {
        description: 'The account has been added.',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <header className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
              <Building2 aria-hidden="true" className="size-4" />
            </span>
            Salesforce workspace
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Salesforce Accounts
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              View and manage your Salesforce account records from one focused workspace.
            </p>
          </div>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(260px,0.38fr)_minmax(0,1fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Create Account</CardTitle>
              <CardDescription>
                Add a new account to your Salesforce workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 sm:p-6">
              <CreateAccountForm onSuccess={handleCreateSuccess} />
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <CardTitle className="text-lg">Account List</CardTitle>
                  <CardDescription>
                    Your latest account records from Salesforce.
                  </CardDescription>
                </div>
                <span className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading && (
                <div
                  className="space-y-3 p-5 sm:p-6"
                  role="status"
                  aria-label="Loading accounts"
                >
                  <Skeleton className="h-4 w-28" />
                  <div className="space-y-2">
                    {[...Array(5)].map((_, index) => (
                      <Skeleton key={index} className="h-12 w-full" />
                    ))}
                  </div>
                  <span className="sr-only">Loading accounts</span>
                </div>
              )}

              {error && !loading && (
                <div
                  className="m-5 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-destructive sm:m-6"
                  role="alert"
                >
                  <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                  <p className="text-sm leading-6">{error}</p>
                </div>
              )}

              {!loading && !error && accounts.length === 0 && (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Users aria-hidden="true" className="size-6" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">No accounts yet</h3>
                  <p className="mt-1.5 max-w-xs text-sm leading-6 text-muted-foreground">
                    No accounts found. Create an account to get started.
                  </p>
                </div>
              )}

              {!loading && !error && accounts.length > 0 && (
                <AccountsTable accounts={accounts} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
