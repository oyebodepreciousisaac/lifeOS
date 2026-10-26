import * as React from 'react';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ArrowRight, ShieldAlert, Check, X } from 'lucide-react';

export interface DiffCardProps {
  title: string;
  actionType: string;
  approvalLevel: 1 | 2 | 3;
  targetEntity: string;
  requesterName: string;
  requesterRole: string;
  requestedAt: string;
  reason: string;
  beforeValue: string | Record<string, any>;
  afterValue: string | Record<string, any>;
  onApprove?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function DiffCard({
  title,
  actionType,
  approvalLevel,
  targetEntity,
  requesterName,
  requesterRole,
  requestedAt,
  reason,
  beforeValue,
  afterValue,
  onApprove,
  onReject,
  isLoading = false,
  className,
}: DiffCardProps) {
  const levelBadge = {
    1: <Badge variant="neutral">Level 1: Single Approval</Badge>,
    2: <Badge variant="pending">Level 2: Dual Control</Badge>,
    3: <Badge variant="debt">Level 3: Quorum Control</Badge>,
  }[approvalLevel];

  const formatPayload = (val: string | Record<string, any>) => {
    if (typeof val === 'string') return val;
    return JSON.stringify(val, null, 2);
  };

  return (
    <Card className={cn('overflow-hidden border-slate-300 dark:border-slate-800 shadow-institutional-md', className)}>
      <CardHeader className="bg-slate-50/70 dark:bg-slate-900/60 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
              {actionType}
            </span>
          </div>
          {levelBadge}
        </div>
        <CardTitle className="text-base font-bold mt-1">{title}</CardTitle>
        <CardDescription className="text-xs">
          Target: <span className="font-semibold text-slate-800 dark:text-slate-200">{targetEntity}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Side-by-Side Visual Diff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg border border-rose-200 bg-rose-50/40 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
              Current Authoritative State
            </span>
            <pre className="font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
              {formatPayload(beforeValue)}
            </pre>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
              Proposed Mutation
            </span>
            <pre className="font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
              {formatPayload(afterValue)}
            </pre>
          </div>
        </div>

        {/* Written Justification */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3 text-xs border border-slate-200/80 dark:border-slate-800">
          <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
            Requester Written Justification:
          </span>
          <p className="text-slate-600 dark:text-slate-400 italic">"{reason}"</p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
            <span>Requested by <strong className="text-slate-700 dark:text-slate-300">{requesterName}</strong> ({requesterRole})</span>
            <span>•</span>
            <span>{requestedAt}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-end gap-2.5 bg-slate-50/40 dark:bg-slate-900/40 mt-0 py-3">
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={isLoading}
          leftIcon={<X className="h-3.5 w-3.5 text-rose-600" />}
        >
          Reject Request
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={onApprove}
          isLoading={isLoading}
          leftIcon={<Check className="h-3.5 w-3.5" />}
        >
          Authorize & Sign
        </Button>
      </CardFooter>
    </Card>
  );
}
