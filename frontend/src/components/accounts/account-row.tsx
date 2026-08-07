'use client';

import ***REMOVED*** Account ***REMOVED*** from '@/types/account';

export function AccountRow(***REMOVED*** account ***REMOVED***: ***REMOVED*** account: Account ***REMOVED***) ***REMOVED***
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4 align-middle text-sm font-medium text-foreground">
        ***REMOVED***account.name***REMOVED***
      </td>
      <td className="p-4 align-middle text-sm text-muted-foreground">
        ***REMOVED***account.phone || '-'***REMOVED***
      </td>
      <td className="p-4 align-middle text-sm text-muted-foreground">
        ***REMOVED***account.website ? (
          <a
            href=***REMOVED***account.website***REMOVED***
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            ***REMOVED***account.website***REMOVED***
          </a>
        ) : (
          '-'
        )***REMOVED***
      </td>
      <td className="p-4 align-middle text-sm text-muted-foreground">
        ***REMOVED***account.industry || '-'***REMOVED***
      </td>
    </tr>
  );
***REMOVED***