import { ArrowUpRight } from 'lucide-react';
import type { Account } from '@/types/account';
import { TableCell, TableRow } from '@/components/ui/table';

export function AccountRow({ account }: { account: Account }) {
  return (
    <TableRow className="border-border hover:bg-muted/40">
      <TableCell className="py-4 font-medium text-foreground">
        {account.name}
      </TableCell>
      <TableCell className="py-4 text-muted-foreground">
        {account.phone || '-'}
      </TableCell>
      <TableCell className="py-4 text-muted-foreground">
        {account.website ? (
          <a
            href={account.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-[16rem] items-center gap-1 text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="truncate">{account.website}</span>
            <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
          </a>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="py-4 text-muted-foreground">
        {account.industry || '-'}
      </TableCell>
    </TableRow>
  );
}
