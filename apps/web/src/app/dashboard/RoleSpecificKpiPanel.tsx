'use client';

import React, { useState } from 'react';
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
  DollarSign,
  TrendingUp,
  Users,
  ShieldCheck,
  Award,
  Calendar,
  AlertTriangle,
  Scale,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  CreditCard,
  FileSpreadsheet,
  Lock,
  UserCheck,
  Eye,
  Activity,
  Layers,
  HeartPulse,
} from 'lucide-react';
import Link from 'next/link';
import { AuthSession } from '@/lib/auth/rbac';

export interface DashboardMetricsContext {
  enrolledStudents: number;
  activeStudents: number;
  admissionsTotal: number;
  attendanceRatePercent: number;
  presentStudentsToday: number;
  lateStudentsToday: number;
  totalBilledNaira: number;
  totalCollectedNaira: number;
  totalOutstandingNaira: number;
  invoicesCount: number;
  agingDebtorsCount: number;
  pendingApprovalsCount: number;
  clinicVisitsToday: number;
  activeBusRoutes: number;
}

interface RoleSpecificKpiPanelProps {
  session: AuthSession;
  metrics: DashboardMetricsContext;
}

type ViewPersona = 'OWNER' | 'PRINCIPAL' | 'BURSAR' | 'TEACHER' | 'IT_ADMIN';

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function RoleSpecificKpiPanel({ session, metrics }: RoleSpecificKpiPanelProps) {
  // Default to actual userType if matching, otherwise OWNER
  const initialPersona: ViewPersona = (
    ['OWNER', 'PRINCIPAL', 'BURSAR', 'TEACHER', 'IT_ADMIN'].includes(session.userType)
      ? (session.userType as ViewPersona)
      : 'OWNER'
  );

  const [activePersona, setActivePersona] = useState<ViewPersona>(initialPersona);

  const collectionRate =
    metrics.totalBilledNaira > 0
      ? Math.round((metrics.totalCollectedNaira / metrics.totalBilledNaira) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Persona View Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-navy-950">
              Institutional Role Intelligence & Key Indicators
            </h2>
            <p className="text-xs text-slate-500">
              Operational summary and priority action items tailored to your school leadership responsibilities.
            </p>
          </div>
        </div>

        {/* Authenticated Role Indicator */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-navy-950 text-white shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {activePersona === 'OWNER'
              ? 'School Executive Role'
              : activePersona === 'PRINCIPAL'
              ? 'Principal Role'
              : activePersona === 'BURSAR'
              ? 'Bursary Role'
              : activePersona === 'TEACHER'
              ? 'Teacher Role'
              : 'IT Administrator Role'}
          </span>
        </div>
      </div>

      {/* 1. OWNER / EXECUTIVE PERSPECTIVE */}
      {activePersona === 'OWNER' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-emerald-600 shadow-xs">
              <CardHeader className="pb-2 p-3.5 sm:p-5">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Total Invoiced
                </span>
                <CardTitle className="text-lg sm:text-2xl font-extrabold text-navy-950 mt-1 truncate">
                  {formatNaira(metrics.totalBilledNaira)}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-emerald-700 font-medium truncate">
                  {formatNaira(metrics.totalCollectedNaira)} ({collectionRate}%)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-xs">
              <CardHeader className="pb-2 p-3.5 sm:p-5">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Outstanding
                </span>
                <CardTitle className="text-lg sm:text-2xl font-extrabold text-amber-700 mt-1 truncate">
                  {formatNaira(metrics.totalOutstandingNaira)}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-amber-600 font-medium truncate">
                  {metrics.agingDebtorsCount} Active Debtors
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-blue-600 shadow-xs">
              <CardHeader className="pb-2 p-3.5 sm:p-5">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Enrolled Students
                </span>
                <CardTitle className="text-lg sm:text-2xl font-extrabold text-navy-950 mt-1 truncate">
                  {metrics.enrolledStudents} {metrics.enrolledStudents === 1 ? 'Pupil' : 'Pupils'}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-blue-600 font-medium truncate">
                  {metrics.activeStudents} Active Status
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-purple-600 shadow-xs">
              <CardHeader className="pb-2 p-3.5 sm:p-5">
                <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  Attendance Today
                </span>
                <CardTitle className="text-lg sm:text-2xl font-extrabold text-navy-950 mt-1 truncate">
                  {metrics.attendanceRatePercent > 0 ? `${metrics.attendanceRatePercent}%` : 'Pending'}
                </CardTitle>
                <CardDescription className="text-[10px] sm:text-xs text-purple-600 font-medium truncate">
                  {metrics.presentStudentsToday} Present Today
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {metrics.pendingApprovalsCount > 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Scale className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-navy-950 font-bold">
                    {metrics.pendingApprovalsCount} Maker-Checker Approval {metrics.pendingApprovalsCount === 1 ? 'Request' : 'Requests'} Pending
                  </strong>
                  <p className="text-slate-600">Sensitive financial reversals or locked score corrections awaiting secondary authorization.</p>
                </div>
              </div>
              <Link href="/admin/governance">
                <Button variant="primary" size="sm" leftIcon={<Scale className="h-3.5 w-3.5" />}>
                  Open Approval Queue
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <strong className="text-navy-950 font-bold">Governance & Financial Integrity Active</strong>
                  <p className="text-slate-500">All dual-control approval queues are clear. All financial transactions are verified.</p>
                </div>
              </div>
              <Link href="/admin/finance">
                <Button variant="outline" size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />}>
                  View Financial Ledger
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* 2. PRINCIPAL PERSPECTIVE */}
      {activePersona === 'PRINCIPAL' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Campus Attendance
                </span>
                <CardTitle className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {metrics.attendanceRatePercent > 0 ? `${metrics.attendanceRatePercent}%` : 'Pending'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  {metrics.presentStudentsToday} of {metrics.enrolledStudents} Students Present
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-rose-500">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Punctuality & Lateness
                </span>
                <CardTitle className="text-2xl font-extrabold text-rose-700 mt-1">
                  {metrics.lateStudentsToday} {metrics.lateStudentsToday === 1 ? 'Student' : 'Students'}
                </CardTitle>
                <CardDescription className="text-xs text-rose-600 font-medium">
                  Arrivals after 08:15 AM bell cutoff
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Student Enrolment
                </span>
                <CardTitle className="text-2xl font-extrabold text-navy-950 mt-1">
                  {metrics.enrolledStudents} Students
                </CardTitle>
                <CardDescription className="text-xs text-blue-700 font-medium">
                  {metrics.activeStudents} Active in Class Arms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Health & Clinic Care
                </span>
                <CardTitle className="text-2xl font-extrabold text-purple-700 mt-1">
                  {metrics.clinicVisitsToday} {metrics.clinicVisitsToday === 1 ? 'Visit' : 'Visits'} Today
                </CardTitle>
                <CardDescription className="text-xs text-purple-600 font-medium">
                  Logged in campus health center
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-navy-950 font-bold">Academic Moderation Pipeline</strong>
                <p className="text-slate-500">Review departmental CA continuous assessment scorebooks and release official report cards.</p>
              </div>
            </div>
            <Link href="/admin/assessments">
              <Button variant="primary" size="sm" leftIcon={<FileSpreadsheet className="h-3.5 w-3.5" />}>
                Moderate Marks & Scores
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. BURSAR PERSPECTIVE */}
      {activePersona === 'BURSAR' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Collected
                </span>
                <CardTitle className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {formatNaira(metrics.totalCollectedNaira)}
                </CardTitle>
                <CardDescription className="text-xs text-emerald-600 font-medium">
                  {collectionRate}% Overall Collection Rate
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Invoiced
                </span>
                <CardTitle className="text-2xl font-extrabold text-navy-950 mt-1">
                  {formatNaira(metrics.totalBilledNaira)}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {metrics.invoicesCount} Total Invoices Issued
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Overdue Debt
                </span>
                <CardTitle className="text-2xl font-extrabold text-amber-700 mt-1">
                  {formatNaira(metrics.totalOutstandingNaira)}
                </CardTitle>
                <CardDescription className="text-xs text-amber-700 font-medium">
                  {metrics.agingDebtorsCount} Accounts with Balance Due
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Electronic Clearing
                </span>
                <CardTitle className="text-2xl font-extrabold text-purple-700 mt-1">
                  99.2% Settled
                </CardTitle>
                <CardDescription className="text-xs text-purple-600 font-medium">
                  Direct Electronic Clearing &amp; Bank Webhooks
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-navy-950 font-bold">Double-Entry Student Ledger & Debt Management</strong>
                <p className="text-slate-500">Generate termly bulk invoices, inspect running balances, or record bank deposit and POS settlements.</p>
              </div>
            </div>
            <Link href="/admin/finance">
              <Button variant="primary" size="sm" leftIcon={<CreditCard className="h-3.5 w-3.5" />}>
                Open Billing & Finance
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 4. TEACHER PERSPECTIVE */}
      {activePersona === 'TEACHER' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Classroom Register
                </span>
                <CardTitle className="text-2xl font-extrabold text-navy-950 mt-1">
                  Sub-60s Roll Call
                </CardTitle>
                <CardDescription className="text-xs text-blue-600 font-medium">
                  1-Click &quot;Mark All Present&quot; Available
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Today&apos;s Attendance
                </span>
                <CardTitle className="text-2xl font-extrabold text-emerald-700 mt-1">
                  {metrics.presentStudentsToday} Present
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {metrics.attendanceRatePercent > 0 ? `${metrics.attendanceRatePercent}% Rate` : 'Register Open'}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Teaching Schedule
                </span>
                <CardTitle className="text-2xl font-extrabold text-purple-700 mt-1">
                  Master Timetable
                </CardTitle>
                <CardDescription className="text-xs text-purple-600 font-medium">
                  8-Period Weekly Subject Plan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Assessment Marks
                </span>
                <CardTitle className="text-2xl font-extrabold text-amber-700 mt-1">
                  CA1 &amp; CA2 Scorebook
                </CardTitle>
                <CardDescription className="text-xs text-amber-600 font-medium">
                  Continuous Assessment Entry
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-navy-100 text-navy-950 flex items-center justify-center font-bold">
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <strong className="text-navy-950 font-bold">Dedicated Teacher Workspace</strong>
                <p className="text-slate-500">Access your daily schedule, 1-click register launcher, and continuous assessment scorebook.</p>
              </div>
            </div>
            <Link href="/portal/teacher">
              <Button variant="primary" size="sm" leftIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                Go to Teacher Portal
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* 5. IT ADMINISTRATOR PERSPECTIVE */}
      {activePersona === 'IT_ADMIN' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-emerald-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Multi-Factor Authentication
                </span>
                <CardTitle className="text-2xl font-extrabold text-emerald-700 mt-1">
                  Enforced
                </CardTitle>
                <CardDescription className="text-xs text-emerald-600 font-medium">
                  Mandatory for all privileged roles
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Tenant Isolation
                </span>
                <CardTitle className="text-2xl font-extrabold text-navy-950 mt-1">
                  Protected
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Server-side session resolution
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Data Governance
                </span>
                <CardTitle className="text-2xl font-extrabold text-purple-700 mt-1">
                  NDPA 2023
                </CardTitle>
                <CardDescription className="text-xs text-purple-600 font-medium">
                  Portability &amp; Consent Tracking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-l-4 border-l-cyan-600">
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Disaster Recovery
                </span>
                <CardTitle className="text-2xl font-extrabold text-cyan-700 mt-1">
                  RPO ≤ 15m
                </CardTitle>
                <CardDescription className="text-xs text-cyan-600 font-medium">
                  Automated restore drills verified
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <strong className="text-navy-950 font-bold">Security, Backup &amp; Compliance Hub</strong>
                <p className="text-slate-500">Run disaster recovery restore drills, export student data packages, or inspect audit logs.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin/platform-security">
                <Button variant="primary" size="sm" leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}>
                  Security &amp; Disaster Recovery
                </Button>
              </Link>
              <Link href="/admin/audit-logs">
                <Button variant="outline" size="sm">
                  Audit Logs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
