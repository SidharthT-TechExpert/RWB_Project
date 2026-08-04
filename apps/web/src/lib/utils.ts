'use client';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
};

export const formatTime = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
};

export const getRelativeTime = (date: string | Date) => {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diff = (new Date(date).getTime() - Date.now()) / 1000;

  if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
  if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  return rtf.format(Math.round(diff / 86400), 'day');
};

export const getPriceRangeSymbol = (priceRange: number) => '₹'.repeat(priceRange);

export const truncateText = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length)}...` : text;

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const debounce = <T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const e = error as {
      code?: string;
      message?: string;
      response?: {
        data?: {
          message?: string;
          error?: string;
          errors?: Array<{ msg?: string; message?: string }>;
        };
        status?: number;
      };
    };

    // 1. API Response error message (e.g. invalid credentials, 404, 400, 500)
    const apiMsg = e.response?.data?.message || e.response?.data?.error || e.response?.data?.errors?.[0]?.msg || e.response?.data?.errors?.[0]?.message;
    if (apiMsg) return apiMsg;

    // 2. HTTP status code fallback messages
    if (e.response?.status === 401) return 'Invalid credentials. Please check your email and password.';
    if (e.response?.status === 403) return 'Access denied. You do not have permission to perform this action.';
    if (e.response?.status === 404) return 'Requested account or resource was not found.';
    if (e.response?.status === 500) return 'Server error encountered. Please try again in a few moments.';

    // 3. Network / Connection failure
    if (e.code === 'ERR_NETWORK' || e.code === 'ECONNREFUSED' || e.message === 'Network Error' || e.message?.includes('Network Error')) {
      return 'Backend API server (http://localhost:3000) is currently offline or unreachable.';
    }

    if (e.message) return e.message;
  }

  if (error instanceof Error) {
    if (error.message === 'Network Error') {
      return 'Backend API server (http://localhost:3000) is currently offline or unreachable.';
    }
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const bookingStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  checked_in: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const orderStatusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-green-100 text-green-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-800',
};
