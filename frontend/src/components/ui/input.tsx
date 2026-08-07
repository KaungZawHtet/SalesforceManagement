import ***REMOVED*** forwardRef ***REMOVED*** from 'react';
import ***REMOVED*** cn ***REMOVED*** from '@/lib/utils';

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((***REMOVED*** className, type, ...props ***REMOVED***, ref) => (
  <input
    type=***REMOVED***type***REMOVED***
    className=***REMOVED***cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )***REMOVED***
    ref=***REMOVED***ref***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
));
Input.displayName = 'Input';