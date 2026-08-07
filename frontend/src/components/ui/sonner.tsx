'use client';

import ***REMOVED*** Toaster as SonnerToaster ***REMOVED*** from 'sonner';

export function Toaster() ***REMOVED***
  return (
    <SonnerToaster
      className="toaster data-[toast=true]:animate-in data-[toast=exit]:animate-out data-[toast=exit]:fade-out-0 data-[toast=enter]:fade-in-0"
      toastOptions=***REMOVED******REMOVED***
        classNames: ***REMOVED***
          toast: 'bg-background text-foreground border-b border-input',
          description: 'text-muted-foreground',
          actionButton:
            'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          closeButton:
            'rounded-md p-1 hover:bg-muted/50',
          loader: 'bg-background',
    ***REMOVED***
  ***REMOVED******REMOVED***
    />
  );
***REMOVED***