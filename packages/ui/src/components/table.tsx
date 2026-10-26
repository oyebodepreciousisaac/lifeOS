import * as React from 'react';
import { cn } from '../lib/utils';

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table
        className={cn('w-full caption-bottom text-sm text-left', className)}
        {...props}
      />
    </div>
  );
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn('bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800', className)}
      {...props}
    />
  );
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={cn('divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-950', className)}
      {...props}
    />
  );
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/60 data-[state=selected]:bg-slate-100',
        className
      )}
      {...props}
    />
  );
}

export function TableHead({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-11 px-4 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  );
}

export function TableCell({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn('p-4 align-middle text-sm text-slate-800 dark:text-slate-200 [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  );
}
