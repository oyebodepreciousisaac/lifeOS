import * as React from 'react';
import { cn } from '../lib/utils';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AlertType = 'success' | 'warning' | 'error' | 'info';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AlertType;
  title?: string;
  onClose?: () => void;
}

export function Alert({
  className,
  type = 'info',
  title,
  children,
  onClose,
  ...props
}: AlertProps) {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
    error: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200',
    info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-200',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-lg border p-4 text-sm',
        styles[type],
        className
      )}
      {...props}
    >
      {icons[type]}
      <div className="flex-1 space-y-0.5">
        {title && <h5 className="font-bold leading-none tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
