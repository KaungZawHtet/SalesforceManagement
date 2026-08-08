'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      className="toaster data-[toast=true]:animate-in data-[toast=exit]:animate-out data-[toast=exit]:fade-out-0 data-[toast=enter]:fade-in-0"
      toastOptions={{
        classNames: {
          toast: 'group toast rounded-xl border border-border bg-card text-card-foreground shadow-lg',
          description: 'text-muted-foreground',
          success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
          error: 'border-destructive/20 bg-destructive/5 text-destructive',
          actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
          cancelButton: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          closeButton:
            'rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground',
          loader: 'bg-primary',
        },
      }}
    />
  );
}
