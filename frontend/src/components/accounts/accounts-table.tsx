'use client';

import ***REMOVED*** Account ***REMOVED*** from '@/types/account';
import ***REMOVED*** AccountRow ***REMOVED*** from './account-row';

export function AccountsTable(***REMOVED*** accounts ***REMOVED***: ***REMOVED*** accounts: Account[] ***REMOVED***) ***REMOVED***
  if (accounts.length === 0) ***REMOVED***
    return null;
  ***REMOVED***

  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50">
              <th className="h-12 px-4 text-left align-middle bg-muted font-medium text-muted-foreground">
                Name
              </th>
              <th className="h-12 px-4 text-left align-middle bg-muted font-medium text-muted-foreground">
                Phone
              </th>
              <th className="h-12 px-4 text-left align-middle bg-muted font-medium text-muted-foreground">
                Website
              </th>
              <th className="h-12 px-4 text-left align-middle bg-muted font-medium text-muted-foreground">
                Industry
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr]:border-b">
            ***REMOVED***accounts.map((account) => (
              <AccountRow key=***REMOVED***account.id***REMOVED*** account=***REMOVED***account***REMOVED*** />
            ))***REMOVED***
          </tbody>
        </table>
      </div>
    </div>
  );
***REMOVED***