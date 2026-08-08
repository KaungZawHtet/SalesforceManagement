import type { Account } from '@/types/account';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AccountRow } from './account-row';

export function AccountsTable({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[680px]">
        <caption className="sr-only">Salesforce account records</caption>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-[0.14em]">
              Name
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-[0.14em]">
              Phone
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-[0.14em]">
              Website
            </TableHead>
            <TableHead className="h-11 text-[11px] font-semibold uppercase tracking-[0.14em]">
              Industry
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <AccountRow key={account.id} account={account} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
