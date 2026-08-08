import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Table = forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn('w-full caption-bottom text-sm bg-card', className)}
    {...props}
  />
));
Table.displayName = 'Table';

export const TableHeader = ({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('[&_tr]:border-b', className)} {...props} />
);
TableHeader.displayName = 'TableHeader';

export const TableBody = ({
  className,
  ...props
}: React.TableHTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);
TableBody.displayName = 'TableBody';

export const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className,
    )}
    {...props}
  />
);
TableRow.displayName = 'TableRow';

export const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      'h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&[role=checkbox]]:pl-2',
      className,
    )}
    {...props}
  />
);
TableHead.displayName = 'TableHead';

export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn('p-4 align-middle text-sm [&:has([role=checkbox])]:pr-0 [&[role=checkbox]]:pl-2', className)}
    {...props}
  />
);
TableCell.displayName = 'TableCell';
