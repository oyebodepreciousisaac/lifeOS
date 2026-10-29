'use client';

import * as React from 'react';
import {
  TrendingUp,
  CreditCard,
  UserCheck,
  GraduationCap,
  FileCheck2,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Layers,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '@school-os/ui';
import Link from 'next/link';

interface InstitutionalAnalyticsProps {
  totalBilled: number;
  totalCollected: number;
  overallAttendanceRate: number;
}

export default function InstitutionalAnalytics({
  totalBilled,
  totalCollected,
  overallAttendanceRate,
}: InstitutionalAnalyticsProps) {
  const isFreshSchool = totalBilled === 0 && overallAttendanceRate === 0;

  if (isFreshSchool) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Institutional Performance &amp; Operational Analytics
            </h2>
            <p className="text-xs text-slate-500">
              Live operational metrics and revenue distribution for your school.
            </p>
          </div>
          <Badge variant="neutral" className="self-start sm:self-auto gap-1">
            <ShieldCheck className="h-3 w-3 text-slate-400" /> Ready for Initial Records
          </Badge>
        </div>

        {/* Clean Onboarding Checklist for Newly Registered School */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-institutional space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-navy-950 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              School Setup &amp; Activation Steps
            </h3>
            <p className="text-xs text-slate-500">
              Your institutional workspace is fresh and clean. Complete these 3 quick steps to begin tracking live attendance, fees, and grade reports:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-navy-950 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h4 className="text-xs font-bold text-navy-950">Class Structure &amp; Arms</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Customize your classes (Creche, Primary, JSS, SSS) and arm names (A/B/C, Gold/Silver, Diamond, or custom).
                </p>
              </div>
              <Link
                href="/admin/academic-setup"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 pt-2 border-t border-slate-200"
              >
                <span>Configure Classes &amp; Arms</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-navy-950 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h4 className="text-xs font-bold text-navy-950">Staff &amp; Teachers</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Provision accounts for your bursar, principal, and subject teachers to manage attendance and marks.
                </p>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 pt-2 border-t border-slate-200"
              >
                <span>Add Staff Members</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-navy-950 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h4 className="text-xs font-bold text-navy-950">Student Enrollment</h4>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Import students via bulk Excel / CSV or add them individually with their guardian contacts.
                </p>
              </div>
              <Link
                href="/admin/students"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 pt-2 border-t border-slate-200"
              >
                <span>Enroll Students</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active School with live billing / attendance data
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Institutional Performance &amp; Operational Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time visual distribution of revenue yield and classroom attendance.
          </p>
        </div>
        <Badge variant="approved" className="self-start sm:self-auto gap-1">
          <ShieldCheck className="h-3 w-3" /> Live Institutional Telemetry
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Fee Collection Yield */}
        <Card className="shadow-institutional">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-navy-950">
                  Termly Fee Recovery &amp; Inflow
                </CardTitle>
                <CardDescription>
                  Reconciled collections vs. outstanding billing
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {collectionRate}% Realized
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tuition Realization Progress</span>
                <span className="font-bold text-navy-950">
                  ₦{totalCollected.toLocaleString()} of ₦{totalBilled.toLocaleString()}
                </span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, collectionRate)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Outstanding Balances: <strong>₦{(totalBilled - totalCollected).toLocaleString()}</strong></span>
              <Link href="/admin/finance" className="text-emerald-700 hover:underline font-bold">
                View Ledger &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Classroom Attendance & Bell Punctuality */}
        <Card className="shadow-institutional">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-navy-950">
                  Classroom Attendance &amp; Bell Punctuality
                </CardTitle>
                <CardDescription>
                  Sub-60s morning roll call sync across academic class levels
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {overallAttendanceRate}% School-Wide
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-navy-950 w-24 shrink-0">School Roll Call</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${overallAttendanceRate}%` }}
                  />
                </div>
                <span className="font-mono font-bold text-emerald-800 w-12 text-right">{overallAttendanceRate}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Cutoff 08:15 AM
              </span>
              <Link href="/admin/attendance" className="text-emerald-700 hover:underline font-bold">
                Open Daily Register &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
