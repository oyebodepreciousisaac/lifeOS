import React from 'react';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
} from '@school-os/ui';
import {
  CreditCard,
  Receipt,
  Scale,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  HeartPulse,
  Radio,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { DashboardMetricsContext } from './RoleSpecificKpiPanel';
import { AuthSession } from '@/lib/auth/rbac';

interface BursarDashboardViewProps {
  session: AuthSession;
  metrics: DashboardMetricsContext;
  schoolName: string;
  dateDisplay: string;
}

function formatNaira(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}k`;
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function BursarDashboardView({
  session,
  metrics,
  schoolName,
  dateDisplay,
}: BursarDashboardViewProps) {
  const collectionRate =
    metrics.totalBilledNaira > 0
      ? Math.round((metrics.totalCollectedNaira / metrics.totalBilledNaira) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* ── BURSAR HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden bg-navy-950 text-white p-5 sm:p-8 shadow-institutional-lg">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                <Building className="h-3 w-3" />
                {schoolName}
              </span>
              <Badge variant="paid">2026/2027 • Term 1</Badge>
              <Badge variant="approved">Bursar Workspace</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{session.firstName} {session.lastName}</span>
            </h1>

            <p className="text-xs text-slate-300">
              Chief Bursar &bull; Financial Operations &amp; Double-Entry Ledger Lead &bull; {session.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/admin/finance">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<CreditCard className="h-4 w-4" />}
              >
                Invoices &amp; Billing
              </Button>
            </Link>
            <Link href="/admin/finance?tab=fees">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-700 bg-navy-900 hover:bg-navy-800"
                leftIcon={<Receipt className="h-4 w-4" />}
              >
                Fee Schedules
              </Button>
            </Link>
          </div>
        </div>

        {/* ── QUICK FINANCIAL METRICS ── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl px-4 py-3 bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Billed</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{formatNaira(metrics.totalBilledNaira)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{metrics.invoicesCount} Invoices Issued</p>
          </div>

          <div className="rounded-xl px-4 py-3 bg-blue-500/10 border border-blue-500/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Collected</p>
            <p className="text-xl font-extrabold text-blue-300 mt-0.5">{formatNaira(metrics.totalCollectedNaira)}</p>
            <p className="text-[11px] text-emerald-300 mt-0.5 font-bold">{collectionRate}% Collection Rate</p>
          </div>

          <div className="rounded-xl px-4 py-3 bg-amber-500/15 border border-amber-500/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Outstanding Debt</p>
            <p className="text-xl font-extrabold text-amber-300 mt-0.5">{formatNaira(metrics.totalOutstandingNaira)}</p>
            <p className="text-[11px] text-amber-200 mt-0.5">{metrics.agingDebtorsCount} Active Debtors</p>
          </div>

          <div className="rounded-xl px-4 py-3 bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Dual Approvals</p>
            <p className="text-xl font-extrabold text-purple-300 mt-0.5">{metrics.pendingApprovalsCount} Requests</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Maker-Checker Queue</p>
          </div>
        </div>
      </div>

      {/* ── BURSAR ACTION RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/finance" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-emerald-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <Receipt className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Invoices &amp; Ledger</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Double-Entry Ledger</p>
          </div>
        </Link>

        <Link href="/admin/finance?tab=fees" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-blue-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <CreditCard className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Fee Schedules</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Sectional Pricing</p>
          </div>
        </Link>

        <Link href="/admin/finance?tab=gateway" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-purple-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Paystack Gateway</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Webhook Reconcile</p>
          </div>
        </Link>

        <Link href="/admin/students" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-amber-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Student Debtors</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Balances by Arm</p>
          </div>
        </Link>

        <Link href="/admin/governance" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-rose-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-2">
              <Scale className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Dual-Control Queue</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Refund Authorizations</p>
          </div>
        </Link>

        <Link href="/admin/auxiliary" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-cyan-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-2">
              <HeartPulse className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">PTA &amp; Auxiliary</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Special Levies</p>
          </div>
        </Link>
      </div>

      {/* ── TWO-COLUMN FINANCIAL INSIGHTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-navy-950">
                    Term Fee Collection Progress
                  </CardTitle>
                  <CardDescription>
                    Real-time append-only double-entry ledger status
                  </CardDescription>
                </div>
                <Badge variant="paid">{collectionRate}% Reconciled</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Collected vs Invoiced</span>
                  <span className="text-emerald-700">{formatNaira(metrics.totalCollectedNaira)} / {formatNaira(metrics.totalBilledNaira)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(collectionRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">Electronic Clearing</span>
                  <span className="font-extrabold text-navy-950 text-base mt-0.5 block">99.2% Settled</span>
                  <span className="text-slate-400 text-[10px]">Instant Bank Webhooks</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">Aging Debtors</span>
                  <span className="font-extrabold text-amber-700 text-base mt-0.5 block">{metrics.agingDebtorsCount} Accounts</span>
                  <span className="text-slate-400 text-[10px]">Overdue &gt; 30 Days</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">Ledger Immutability</span>
                  <span className="font-extrabold text-emerald-700 text-base mt-0.5 block">100% Balanced</span>
                  <span className="text-slate-400 text-[10px]">ADR-03 Double Entry</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-navy-950">
                Maker-Checker Dual Control Status
              </CardTitle>
              <CardDescription>
                Separation of Duties (SoD) for financial reversals and adjustments
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              {metrics.pendingApprovalsCount > 0 ? (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-amber-700 shrink-0" />
                    <div>
                      <strong className="text-amber-950 font-bold">
                        {metrics.pendingApprovalsCount} Dual-Control Approval Requests Pending
                      </strong>
                      <p className="text-amber-800 mt-0.5">
                        Requires secondary authorization before ledger journal commitment.
                      </p>
                    </div>
                  </div>
                  <Link href="/admin/governance">
                    <Button variant="primary" size="sm" leftIcon={<Scale className="h-3.5 w-3.5" />}>
                      Review Requests
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>All dual-control approval queues are clear. All transactions reconciled.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950">
                Bursar Direct Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/finance" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Receipt className="h-4 w-4 mr-2 text-emerald-600" />
                  Issue Bulk Term Invoices
                </Button>
              </Link>
              <Link href="/admin/finance?tab=gateway" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
                  Paystack Live Reconciliation
                </Button>
              </Link>
              <Link href="/admin/audit-logs" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <FileText className="h-4 w-4 mr-2 text-purple-600" />
                  Financial Audit Trail
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
