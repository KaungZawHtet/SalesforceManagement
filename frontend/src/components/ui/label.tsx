import ***REMOVED*** forwardRef ***REMOVED*** from 'react';
import ***REMOVED*** cn ***REMOVED*** from '@/lib/utils';

export const Label = forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>((***REMOVED*** className, ...props ***REMOVED***, ref) => (
  <label
    className=***REMOVED***cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-75',
      className
    )***REMOVED***
    ref=***REMOVED***ref***REMOVED***
    ***REMOVED***...props***REMOVED***
  />
));
Label.displayName = 'Label';