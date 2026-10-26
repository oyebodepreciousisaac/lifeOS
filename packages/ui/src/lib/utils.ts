import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats standard Nigerian Naira currency strings
 */
export function formatNaira(amount: number | string): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) return '₦0.00';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(numeric);
}
