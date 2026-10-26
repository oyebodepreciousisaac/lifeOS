import * as React from 'react';
import { cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      primary:
        'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm',
      secondary:
        'bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-sm',
      outline:
        'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-sm dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      destructive:
        'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 active:bg-rose-200 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300',
      ghost:
        'text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800',
    };

    const sizes = {
      sm: 'h-9 px-3 text-xs gap-1.5 min-h-[36px]',
      md: 'h-11 px-4 text-sm gap-2 min-h-[44px]', // Mobile-first touch target
      lg: 'h-12 px-6 text-base gap-2.5 min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
