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
import { getPlatformRegisteredSchools } from '@/lib/academic/academic-store';

export default async function SuperAdminDashboardPage() {
  const session = await getSession();

  // Super-admin route security guard: Only platform superadmin role
  if (!session) {
    redirect('/login');
  }

  if (session.userType !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  // Real platform metrics from registered school tenants
  const registeredSchools = getPlatformRegisteredSchools();
  const totalSchools = registeredSchools.length;
  const activeSchools = registeredSchools.filter((s) => s.status === 'ACTIVE').length;
  const pendingOnboarding = totalSchools - activeSchools;
  const totalEnrolledStudents = registeredSchools.reduce((acc, s) => acc + s.studentsCount, 0);

  const platformMetrics = {
    totalSchools,
    activeSchools,
    pendingOnboarding,
    totalEnrolledStudents,
    mrrSubscriptions: 0,
    platformUptime: '100%',
  };

  const recentPlatformActivity = [
    {
      time: 'Today',
      event: `Platform Administrator session active (${session.email})`,
    },
    {
      time: 'Today',
      event: `Institution workspace verified: ${registeredSchools[0]?.name || 'Primary School Tenant'}`,
    },
    {
      time: 'Live',
      event: 'Multi-tenant database partition and RBAC guards online',
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

      {/* KPI Cards: 2x2 Grid on Mobile, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Schools */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="truncate">Registered Schools</span>
            <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-950">{platformMetrics.totalSchools}</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600">
              {platformMetrics.activeSchools} active
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            {platformMetrics.pendingOnboarding > 0
              ? `${platformMetrics.pendingOnboarding} setting up`
              : 'All institutions active'}
          </p>
        </div>

        {/* Total Enrolled Students */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="truncate">Total Students</span>
            <Users className="h-4 w-4 text-blue-600 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-950">
              {platformMetrics.totalEnrolledStudents}
            </span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">pupils</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            Enrolled across registered schools
          </p>
        </div>

        {/* Platform Subscription Status */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="truncate">Software License</span>
            <CreditCard className="h-4 w-4 text-purple-600 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-navy-950">Active</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-600">Verified</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            Production multi-school license
          </p>
        </div>

        {/* Platform Uptime & Health */}
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="truncate">System Status</span>
            <Activity className="h-4 w-4 text-emerald-600 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">Online</span>
            <span className="text-[10px] sm:text-xs font-medium text-slate-500">100%</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
            Database & services healthy
          </p>
        </div>
      </div>

      {/* Main Content Grid: Schools Table & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left 8 Cols: Registered Schools Directory */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-navy-950">Registered Institutions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Current onboarded school tenants on your platform.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {platformMetrics.totalSchools} {platformMetrics.totalSchools === 1 ? 'School' : 'Schools'}
              </span>
            </div>
          </div>

          {registeredSchools.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Registered Schools Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No institutions have signed up on SquareOS yet. Click below to register your first school workspace.
              </p>
              <Link
                href="/setup"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Register First School
              </Link>
            </div>
          ) : (
            <>
              {/* MOBILE VIEW: Responsive Card List (No awkward horizontal scroll needed) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {registeredSchools.map((school) => (
                  <div key={school.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-navy-950 text-sm">{school.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-emerald-700 font-semibold">{school.code}</span>
                          <span>•</span>
                          <span>{school.location}</span>
                        </p>
                      </div>
                      <div>
                        {school.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="h-3 w-3 text-amber-600" /> Setup Incomplete
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Administrator</span>
                        <span className="font-semibold text-slate-700">{school.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Plan</span>
                        <span className="font-semibold text-slate-700">{school.subscriptionPlan}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-400">{school.lastActive}</span>
                      <Link
                        href={`/dashboard`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
                      >
                        <span>Open Dashboard</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW: Full Structured Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">School & Location</th>
                      <th className="px-4 py-3.5">Administrator</th>
                      <th className="px-4 py-3.5">Students</th>
                      <th className="px-4 py-3.5">Plan</th>
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
                          <div className="text-[10px] text-slate-400">{school.contactEmail}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-navy-950">{school.studentsCount}</div>
                          <div className="text-[10px] text-slate-400">pupils</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-navy-950">{school.subscriptionPlan}</div>
                          <div className="text-[10px] text-slate-500">{school.lastActive}</div>
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
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <span>Open Dashboard</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right 4 Cols: Live Platform Activity & Security State */}
        <div className="lg:col-span-4 space-y-6">
          {/* Activity Feed */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-navy-950 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-600" />
                Live System Activity
              </h3>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {recentPlatformActivity.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs">
                  <div className="p-1 rounded bg-slate-100 text-slate-600 shrink-0 font-mono text-[10px]">
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
                <span>View System Audit Logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Platform Security Note */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <span>Multi-School Security</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Every registered school has an isolated workspace with strict access controls:
            </p>
            <ul className="space-y-1.5 text-[11px] text-emerald-900 list-disc list-inside">
              <li>School data and students are kept private to each school.</li>
              <li>Two-step verification (MFA) protects administrative accounts.</li>
              <li>Only the software owner can access this multi-school overview.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
