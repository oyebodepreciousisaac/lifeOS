import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, options, helperText, error, id, disabled, ...props },
    ref
  ) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-11 w-full appearance-none rounded-lg border bg-white px-3.5 py-2 pr-10 text-sm text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800',
              error
                ? 'border-rose-500 focus-visible:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error ? (
          <p className="flex items-center gap-1 text-xs text-rose-600 font-medium mt-1">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = 'Select';
