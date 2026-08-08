import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Parameters<typeof clsx>[0][]): string {
  return twMerge(clsx(...inputs));
}
