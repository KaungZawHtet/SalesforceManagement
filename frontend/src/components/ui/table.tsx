import ***REMOVED*** forwardRef ***REMOVED*** from 'react';
import ***REMOVED*** cn ***REMOVED*** from '@/lib/utils';

export const Table = forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>((***REMOVED*** className, ...props ***REMOVED***, ref) => (
  <table
    ref=***REMOVED***ref***REMOVED***
    className=***REMOVED***cn(
      'w-full caption-bottom text-sm bg-background',
      className
    )***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
));
Table.displayName = 'Table';

export const TableHeader = (***REMOVED***
  className,
  ...props
***REMOVED***: React.TableHTMLAttributes<HTMLTableSectionElement>) => (
  <thead className=***REMOVED***cn(className)***REMOVED*** ***REMOVED***...props***REMOVED*** />
);
TableHeader.displayName = 'TableHeader';

export const TableBody = (***REMOVED***
  className,
  ...props
***REMOVED***: React.TableHTMLAttributes<HTMLTableSectionElement>) => (
  <tbody
    className=***REMOVED***cn('[&_tr:border-b]', className)***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
);
TableBody.displayName = 'TableBody';

export const TableRow = (***REMOVED***
  className,
  ...props
***REMOVED***: React.TableHTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className=***REMOVED***cn(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
);
TableRow.displayName = 'TableRow';

export const TableHead = (***REMOVED***
  className,
  ...props
***REMOVED***: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className=***REMOVED***cn(
      'h-12 px-4 text-left align-middle text-sm font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&[role=checkbox]]:pl-2',
      className
    )***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
);
TableHead.displayName = 'TableHead';

export const TableCell = (***REMOVED***
  className,
  ...props
***REMOVED***: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className=***REMOVED***cn('p-4 align-middle text-sm [&:has([role=checkbox])]:pr-0 [&[role=checkbox]]:pl-2', className)***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
);
TableCell.displayName = 'TableCell';