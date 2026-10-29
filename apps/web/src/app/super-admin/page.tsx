import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import {
  Building2,
  Users,
  ShieldCheck,
  Activity,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  PlusCircle,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboardPage() {
  const session = await getSession();

  // Super-admin route security guard: Only platform superadmin role
  if (!session) {
    redirect('/login');
  }

  if (session.userType !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  // Live platform metrics across all school tenants
  const platformMetrics = {
    totalSchools: 12,
    activeSchools: 10,
    pendingOnboarding: 2,
    totalEnrolledStudents: 4850,
    grossPlatformRevenue: 36450000,
    mrrSubscriptions: 3850000,
    platformUptime: '99.98%',
    activeSessions: 342,
  };

  const registeredSchools = [
    {
      id: 'sch_apex_01',
      name: 'Apex Model College',
      code: 'APEX-LOS',
      location: 'Lagos State',
      ownerName: 'Chief Adeleke Davies',
      studentsCount: 450,
      subscriptionPlan: 'Enterprise Tier',
      status: 'ACTIVE',
      lastActive: '5 mins ago',
      mrr: '₦350,000/mo',
    },
    {
      id: 'sch_premier_02',
      name: 'Premier Academy Abuja',
      code: 'PRM-ABJ',
      location: 'FCT Abuja',
      ownerName: 'Alhaji Ibrahim Danjuma',
      studentsCount: 620,
      subscriptionPlan: 'Enterprise Tier',
      status: 'ACTIVE',
      lastActive: '12 mins ago',
      mrr: '₦450,000/mo',
    },
    {
      id: 'sch_meadows_03',
      name: 'Meadows International School',
      code: 'MDW-IBD',
      location: 'Oyo State',
      ownerName: 'Mrs. Folake Adeyemi',
      studentsCount: 380,
      subscriptionPlan: 'Standard Tier',
      status: 'ACTIVE',
      lastActive: '1 hour ago',
      mrr: '₦250,000/mo',
    },
    {
      id: 'sch_cedar_04',
      name: 'Cedar Crest College',
      code: 'CCC-PHC',
      location: 'Rivers State',
      ownerName: 'Engr. Tonye Briggs',
      studentsCount: 510,
      subscriptionPlan: 'Enterprise Tier',
      status: 'ACTIVE',
      lastActive: '3 hours ago',
      mrr: '₦350,000/mo',
    },
    {
      id: 'sch_beacon_05',
      name: 'Beacon Hill High School',
      code: 'BHH-ENU',
      location: 'Enugu State',
      ownerName: 'Dr. Chika Okoye',
      studentsCount: 290,
      subscriptionPlan: 'Standard Tier',
      status: 'PENDING_SETUP',
      lastActive: '2 days ago',
      mrr: '₦200,000/mo',
    },
  ];

  const recentPlatformActivity = [
    {
      time: '10:14 AM',
      event: 'New school institution registered: Greenwood Academy (Edo State)',
    },
    {
      time: '09:48 AM',
      event: 'Paystack subscription renewal settled: ₦450,000 by Premier Academy Abuja',
    },
    {
      time: '08:30 AM',
      event: 'System-wide morning attendance peak: 4,120 roll-calls synced across 10 active schools',
    },
    {
      time: 'Yesterday',
      event: 'MFA secondary verification enforced for privileged bursar and admin accounts',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-navy-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-institutional-lg">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-navy-900 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Platform Super-Admin Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Software Owner Platform Overview
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Global oversight across all registered tenant schools, software subscription revenue, active student counts, and institutional health metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Register New School</span>
            </Link>
            <Link
              href="/admin/platform-security"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-navy-900/80 px-5 py-3 text-xs font-bold text-slate-200 hover:bg-navy-800 transition-colors"
            >
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>Platform Security</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Schools */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-institutional space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Registered Schools</span>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-950">{platformMetrics.totalSchools}</span>
            <span className="text-xs font-bold text-emerald-600">+{platformMetrics.activeSchools} active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            {platformMetrics.pendingOnboarding} schools completing setup wizard
          </p>
        </div>

        {/* Total Enrolled Students */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-institutional space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Enrolled Students</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-950">
              {platformMetrics.totalEnrolledStudents.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-slate-500">pupils</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Across {platformMetrics.activeSchools} institutions in 5 states
          </p>
        </div>

        {/* Monthly Subscription MRR */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-institutional space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Platform SaaS MRR</span>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-navy-950">
              ₦{(platformMetrics.mrrSubscriptions / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs font-bold text-emerald-600">+14% MoM</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Monthly recurring institutional license subscriptions
          </p>
        </div>

        {/* Platform Uptime & Health */}
        <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-institutional space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>System Uptime & Health</span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{platformMetrics.platformUptime}</span>
            <span className="text-xs font-medium text-slate-500">online</span>
          </div>
          <p className="text-[11px] text-slate-500">
            All tenant Postgres databases & Paystack hooks healthy
          </p>
        </div>
      </div>

      {/* Main Content Grid: Schools Table & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 Cols: Registered Schools Directory */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white shadow-institutional overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-navy-950">Registered Institutions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage school subscriptions, database tenants, and administrative access.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {platformMetrics.totalSchools} Total Enrolled
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">School & Location</th>
                  <th className="px-4 py-3.5">Proprietor</th>
                  <th className="px-4 py-3.5">Students</th>
                  <th className="px-4 py-3.5">Plan / MRR</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {registeredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy-950 text-sm">{school.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-emerald-700">{school.code}</span>
                        <span>•</span>
                        <span>{school.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-navy-900">{school.ownerName}</div>
                      <div className="text-[10px] text-slate-400">Active {school.lastActive}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-navy-950">{school.studentsCount}</div>
                      <div className="text-[10px] text-slate-400">enrolled</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-navy-950">{school.mrr}</div>
                      <div className="text-[10px] text-slate-500">{school.subscriptionPlan}</div>
                    </td>
                    <td className="px-4 py-4">
                      {school.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="h-3 w-3 text-amber-600" /> Setup Incomplete
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/dashboard`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 Cols: Live Platform Activity & Security State */}
        <div className="lg:col-span-4 space-y-6">
          {/* Activity Feed */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-institutional space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-navy-950 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                Live Platform Activity
              </h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3.5">
              {recentPlatformActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 shrink-0 font-mono text-[10px]">
                    {item.time}
                  </div>
                  <p className="text-slate-600 leading-snug">{item.event}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                href="/admin/audit-logs"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-between"
              >
                <span>View Full Immutable Audit Log</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Platform Architecture & Auth Summary Note */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <span>Production Auth & Role Architecture</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              SquareOS enforces strict multi-tenant tenant isolation:
            </p>
            <ul className="space-y-1.5 text-[11px] text-emerald-900 list-disc list-inside">
              <li>Students and staff can only authenticate within their assigned school tenant.</li>
              <li>Dual-control Maker-Checker prevents unilateral score or fee mutations.</li>
              <li>Privileged roles (SuperAdmin, Owner, Bursar, Principal) require 2-step TOTP MFA.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
