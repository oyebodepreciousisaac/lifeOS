import * as React from 'react';
import { cn } from '../lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      helperText,
      error,
      id,
      leftElement,
      rightElement,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider"
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-11 w-full rounded-lg border bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800',
              error
                ? 'border-rose-500 focus-visible:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
              {rightElement}
            </div>
          )}
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
Input.displayName = 'Input';
