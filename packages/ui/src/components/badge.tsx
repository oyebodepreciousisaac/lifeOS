import * as React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Lock, ShieldCheck } from 'lucide-react';

export type BadgeVariant =
  | 'paid'
  | 'pending'
  | 'debt'
  | 'locked'
  | 'approved'
  | 'draft'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  showIcon?: boolean;
}

export function Badge({
  className,
  variant = 'neutral',
  showIcon = true,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    paid: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    pending: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    debt: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    locked: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    approved: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    draft: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  };

  const icons = {
    paid: <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />,
    pending: <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />,
    debt: <XCircle className="h-3 w-3 text-rose-600 dark:text-rose-400" />,
    locked: <Lock className="h-3 w-3 text-slate-600 dark:text-slate-400" />,
    approved: <ShieldCheck className="h-3 w-3 text-blue-600 dark:text-blue-400" />,
    draft: <Clock className="h-3 w-3 text-slate-400" />,
    neutral: null,
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {showIcon && icons[variant]}
      {children}
    </span>
  );
}
