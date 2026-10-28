'use client';

import * as React from 'react';
import {
  TrendingUp,
  CreditCard,
  UserCheck,
  GraduationCap,
  FileCheck2,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@school-os/ui';

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
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 74;

  // Monthly Revenue Inflow Trend
  const monthlyInflows = [
    { month: 'Sep 2026', billed: 48.5, collected: 36.2, percentage: 75 },
    { month: 'Oct 2026', billed: 52.0, collected: 43.8, percentage: 84 },
    { month: 'Nov 2026 (Est)', billed: 54.0, collected: 46.0, percentage: 85 },
    { month: 'Dec 2026 (Est)', billed: 54.0, collected: 51.5, percentage: 95 },
  ];

  // Class Arm Attendance Breakdown
  const classAttendance = [
    { class: 'JSS 1', present: 97.4, status: 'EXCELLENT' },
    { class: 'JSS 2', present: 95.8, status: 'GOOD' },
    { class: 'JSS 3', present: 98.1, status: 'EXCELLENT' },
    { class: 'SSS 1', present: 93.6, status: 'GOOD' },
    { class: 'SSS 2', present: 96.2, status: 'GOOD' },
    { class: 'SSS 3', present: 98.8, status: 'EXCELLENT' },
  ];

  // WAEC Terminal Score Grade Distribution
  const gradeBands = [
    { grade: 'A1 (Distinction)', range: '75 - 100%', count: 184, percent: 38, color: 'bg-emerald-600' },
    { grade: 'B2 - B3 (Very Good)', range: '65 - 74%', count: 142, percent: 29, color: 'bg-emerald-500' },
    { grade: 'C4 - C6 (Credit)', range: '50 - 64%', count: 110, percent: 23, color: 'bg-blue-500' },
    { grade: 'D7 - E8 (Pass)', range: '40 - 49%', count: 34, percent: 7, color: 'bg-amber-500' },
    { grade: 'F9 (Fail / Remedial)', range: '0 - 39%', count: 14, percent: 3, color: 'bg-rose-500' },
  ];

  // Admissions Pipeline Conversion Funnel
  const admissionsStages = [
    { stage: 'Portal Inquiries', count: 148, percent: 100, barWidth: 'w-full' },
    { stage: 'Entrance Exam Sat', count: 122, percent: 82, barWidth: 'w-[82%]' },
    { stage: 'Executive Interview', count: 98, percent: 66, barWidth: 'w-[66%]' },
    { stage: 'Offers Extended', count: 85, percent: 57, barWidth: 'w-[57%]' },
    { stage: 'Enrolled & Paid', count: 76, percent: 51, barWidth: 'w-[51%]' },
  ];

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-navy-950 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Institutional Performance & Operational Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time visual distribution of revenue yield, academic pass rates, and classroom attendance.
          </p>
        </div>
        <Badge variant="approved" className="self-start sm:self-auto gap-1">
          <ShieldCheck className="h-3 w-3" /> Live Institutional Telemetry
        </Badge>
      </div>

      {/* ── ROW 1: REVENUE TRENDS & ATTENDANCE HEATMAP ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Fee Collection Yield & Monthly Cash Flow */}
        <Card className="shadow-institutional">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-navy-950">
                  Termly Fee Recovery & Inflow Projection
                </CardTitle>
                <CardDescription>
                  Reconciled collections vs. outstanding billing via Paystack rails
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
            {/* Visual Overall Yield Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tuition Realization Progress</span>
                <span className="font-bold text-navy-950">₦36.2M of ₦48.5M</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>

            {/* Monthly Trend Bars */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Monthly Breakdown (₦ Millions)
              </span>
              <div className="grid grid-cols-4 gap-2 text-center">
                {monthlyInflows.map((item) => (
                  <div key={item.month} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <span className="text-[10px] text-slate-500 block truncate font-medium">{item.month}</span>
                    <div className="text-xs font-extrabold text-navy-950 font-mono">₦{item.collected}M</div>
                    <div className="text-[10px] text-emerald-700 font-bold">{item.percentage}% Yield</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Attendance Heatmap & Punctuality Distribution */}
        <Card className="shadow-institutional">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-navy-950">
                  Classroom Attendance & Bell Punctuality
                </CardTitle>
                <CardDescription>
                  Sub-60s morning roll call sync across academic class levels
                </CardDescription>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {overallAttendanceRate || 96.4}% School-Wide
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              {classAttendance.map((item) => (
                <div key={item.class} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-navy-950 w-14 shrink-0">{item.class}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${item.present}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-emerald-800 w-12 text-right">{item.present}%</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                Cutoff 08:15 AM
              </span>
              <span>Average register mark time: 42 seconds</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── ROW 2: GRADE DISTRIBUTION & ADMISSIONS FUNNEL ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 3: Academic Letter-Grade Distribution */}
        <Card className="shadow-institutional">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-navy-950">
              Continuous Assessment & WAEC Grade Spread
            </CardTitle>
            <CardDescription>
              Cumulative distribution across 484 enrolled secondary students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Visual Multi-Segment Bar */}
            <div className="h-3.5 w-full rounded-full overflow-hidden flex shadow-2xs">
              {gradeBands.map((band) => (
                <div
                  key={band.grade}
                  className={`${band.color} h-full transition-all`}
                  style={{ width: `${band.percent}%` }}
                  title={`${band.grade}: ${band.count} students (${band.percent}%)`}
                />
              ))}
            </div>

            {/* Legend Table */}
            <div className="divide-y divide-slate-100 text-xs pt-1">
              {gradeBands.map((band) => (
                <div key={band.grade} className="py-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${band.color}`} />
                    <span className="font-semibold text-slate-700">{band.grade}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({band.range})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-navy-950">{band.count}</span>
                    <span className="text-slate-400 text-[11px]">({band.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Admissions Conversion Pipeline */}
        <Card className="shadow-institutional">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-navy-950">
              Admissions & Intake Conversion Funnel
            </CardTitle>
            <CardDescription>
              From public portal application through exams to enrolled scholars
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {admissionsStages.map((stage) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{stage.stage}</span>
                  <span className="font-mono text-navy-950 font-bold">
                    {stage.count} ({stage.percent}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-navy-950 rounded-full ${stage.barWidth}`} />
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Next Entrance Exam: Saturday, Nov 14</span>
              <span className="font-semibold text-emerald-700">51.3% Overall Conversion</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
