import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  ShieldCheck,
  Building,
  LogOut,
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
  UserPlus,
  GraduationCap,
  Calendar,
  Clock,
  Award,
  CreditCard,
  Scale,
  Receipt,
  Radio,
  BookOpen,
  HeartPulse,
  Video,
  Bot,
  Database,
  Layers,
  Users,
  Activity,
  ChevronRight,
  LayoutDashboard,
  FileText,
  Shield,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { logoutAction } from '@/app/actions/auth';
import { DEMO_USERS } from '@/lib/auth/demo-users';
import { getSchoolConfiguration, getPlatformRegisteredSchools } from '@/lib/academic/academic-store';
import RoleSpecificKpiPanel, { DashboardMetricsContext } from './RoleSpecificKpiPanel';
import { getSisDashboardMetrics } from '@/lib/sis/sis-store';
import { getSchoolAttendanceMetrics } from '@/lib/attendance/attendance-store';
import { listInvoices, generateAgingDebtorsReport } from '@/lib/finance/finance-store';
import { getGovernanceMetrics } from '@/lib/governance/governance-store';
import { getAuxiliaryMetrics } from '@/lib/auxiliary/auxiliary-store';
import { getTeacherPortalData } from '@/lib/portals/portal-service';
import TeacherDashboardView from './TeacherDashboardView';
import BursarDashboardView from './BursarDashboardView';
import PlatformOwnerDashboardView from './PlatformOwnerDashboardView';
import InstitutionalAnalytics from '@/components/dashboard/InstitutionalAnalytics';
import DashboardModuleDirectory from './DashboardModuleDirectory';

// Human-readable role labels
const ROLE_LABELS: Record<string, string> = {
  OWNER: 'School Executive',
  SUPERADMIN: 'Platform Administrator',
  PRINCIPAL: 'Principal',
  VICE_PRINCIPAL: 'Vice Principal',
  BURSAR: 'Bursar',
  TEACHER: 'Subject Teacher',
  IT_ADMIN: 'IT Administrator',
  PARENT: 'Parent / Guardian',
  STUDENT: 'Student',
  STAFF: 'Staff Member',
};

function formatNaira(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}k`;
  return `₦${n.toLocaleString('en-NG')}`;
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) redirect('/login');
  if (session.isPrivileged && !session.mfaVerified) redirect('/mfa-challenge');

  // Direct routing for portal roles
  if (session.userType === 'PARENT') redirect('/portal/parent');
  let currentSchoolName = 'Your School';
  try {
    if (session.schoolId) {
      const cfg = getSchoolConfiguration(session.schoolId);
      if (cfg?.school?.name) currentSchoolName = cfg.school.name;
    }
  } catch {
    // fallback if uninitialized
  }
  if (currentSchoolName === 'Your School' && DEMO_USERS[session.email]?.schoolName) {
    currentSchoolName = DEMO_USERS[session.email].schoolName;
  }
  const userConfig = { schoolName: currentSchoolName };

  const dateDisplay = new Date().toLocaleDateString('en-NG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Dedicated Platform Owner / SuperAdmin Command Center
  if (session.userType === 'SUPERADMIN' || session.email === 'superadmin@squareos.com') {
    const registeredSchools = getPlatformRegisteredSchools();
    return (
      <PlatformOwnerDashboardView
        session={session}
        dateDisplay={dateDisplay}
        initialSchools={registeredSchools}
      />
    );
  }

  // Dedicated Teacher Dashboard
  if (session.userType === 'TEACHER') {
    const teacherData = await getTeacherPortalData(session.schoolId, session);
    return (
      <TeacherDashboardView
        session={session}
        data={teacherData}
        schoolName={userConfig.schoolName}
      />
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const roleLabel = ROLE_LABELS[session.userType] ?? session.userType;


  // --- Fetch all metrics gracefully ---
  let sisMetrics = {
    totalStudents: 0,
    activeStudents: 0,
    maleCount: 0,
    femaleCount: 0,
    bySection: { earlyYears: 0, primary: 0, juniorSecondary: 0, seniorSecondary: 0 },
    admissionsFunnel: { totalApplications: 0, submitted: 0, scored: 0, offered: 0, accepted: 0, enrolled: 0 },
  };
  let attendanceMetrics = {
    totalEnrolled: 0,
    totalPresent: 0,
    totalAbsent: 0,
    totalLate: 0,
    totalExcused: 0,
    overallAttendanceRate: 0,
    chronicAbsentCount: 0,
    pendingAlertsCount: 0,
    bySection: { earlyYears: 0, primary: 0, juniorSecondary: 0, seniorSecondary: 0 },
  };
  let totalBilled = 0;
  let totalCollected = 0;
  let totalOutstanding = 0;
  let invoicesCount = 0;
  let agingDebtorsCount = 0;
  let governanceMetrics = {
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    avgResolutionTimeHours: 0,
  };
  let auxiliaryMetrics = {
    totalClinicVisitsToday: 0,
    criticalCasesToday: 0,
    activeTransportRoutes: 0,
    studentsOnBusesCount: 0,
    activeHostelScholarsCount: 0,
    pendingExeatsCount: 0,
    totalLibraryBooksCount: 0,
    booksOnLoanCount: 0,
    totalFixedAssetsCount: 0,
    pendingMaintenanceCount: 0,
    activePtaProjectsCount: 0,
  };

  try {
    const [sisRes, attRes, invRes, agingRes, govRes, auxRes] = await Promise.allSettled([
      getSisDashboardMetrics(session.schoolId, session),
      getSchoolAttendanceMetrics(session.schoolId, today, session),
      listInvoices(session.schoolId),
      generateAgingDebtorsReport(session.schoolId),
      getGovernanceMetrics(session.schoolId, session),
      getAuxiliaryMetrics(session.schoolId, session),
    ]);
    if (sisRes.status === 'fulfilled' && sisRes.value) sisMetrics = sisRes.value;
    if (attRes.status === 'fulfilled' && attRes.value) attendanceMetrics = attRes.value;
    if (invRes.status === 'fulfilled' && invRes.value) {
      const invs = invRes.value;
      invoicesCount = invs.length;
      totalBilled = invs.reduce((s, i) => s + i.totalAmount, 0);
      totalCollected = invs.reduce((s, i) => s + i.amountPaid, 0);
      totalOutstanding = invs.reduce((s, i) => s + i.balanceDue, 0);
    }
    if (agingRes.status === 'fulfilled' && agingRes.value) agingDebtorsCount = agingRes.value.debtorCount || 0;
    if (govRes.status === 'fulfilled' && govRes.value) governanceMetrics = govRes.value;
    if (auxRes.status === 'fulfilled' && auxRes.value) auxiliaryMetrics = auxRes.value;
  } catch {
    /* graceful fallback */
  }

  const metricsContext: DashboardMetricsContext = {
    enrolledStudents: sisMetrics.totalStudents,
    activeStudents: sisMetrics.activeStudents,
    admissionsTotal: sisMetrics.admissionsFunnel.totalApplications,
    attendanceRatePercent: attendanceMetrics.overallAttendanceRate,
    presentStudentsToday: attendanceMetrics.totalPresent,
    lateStudentsToday: attendanceMetrics.totalLate,
    totalBilledNaira: totalBilled,
    totalCollectedNaira: totalCollected,
    totalOutstandingNaira: totalOutstanding,
    invoicesCount,
    agingDebtorsCount,
    pendingApprovalsCount: governanceMetrics.pendingCount,
    clinicVisitsToday: auxiliaryMetrics.totalClinicVisitsToday,
    activeBusRoutes: auxiliaryMetrics.activeTransportRoutes,
  };

  // Dedicated Bursar Financial Command Center
  if (session.userType === 'BURSAR') {
    return (
      <BursarDashboardView
        session={session}
        metrics={metricsContext}
        schoolName={userConfig.schoolName}
        dateDisplay={dateDisplay}
      />
    );
  }

  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const attendanceOk = attendanceMetrics.overallAttendanceRate >= 85;
  const hasUrgentApprovals = governanceMetrics.pendingCount > 0;

  return (
    <div className="space-y-6">

      {/* ── HERO BANNER: Institutional Leadership ── */}
      <div className="relative rounded-2xl overflow-hidden bg-navy-950 shadow-institutional-lg">
        {/* Subtle dot-grid ambient overlay */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy-950/80 to-transparent pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
            {/* Left: Identity and School Profile */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                  <Building className="h-3 w-3" />
                  {userConfig.schoolName}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  2026/2027 Academic Session &bull; First Term
                </span>
                {session.isPrivileged && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-emerald-600 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3 w-3" /> MFA Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
                <span className="text-emerald-400">{session.firstName}</span>
              </h1>

              <p className="text-sm text-slate-300">
                <span className="text-white font-semibold">{roleLabel}</span>
                &ensp;•&ensp;<span className="text-slate-400">{session.email}</span>
                &ensp;•&ensp;<span className="text-slate-400">{dateDisplay}</span>
              </p>
            </div>

            {/* Right: Quick actions */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href="/dashboard">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                  <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
                </span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 border border-slate-700 bg-navy-900/80 px-3 py-1.5 rounded-lg hover:bg-navy-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </form>
            </div>
          </div>

          {/* ── TODAY'S QUICK-GLANCE STRIP ── */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Attendance */}
            <div className={`rounded-xl px-4 py-3 border ${attendanceOk ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Today&apos;s Attendance</p>
              <p className={`text-xl font-extrabold mt-0.5 ${attendanceOk ? 'text-emerald-300' : 'text-amber-300'}`}>
                {attendanceMetrics.overallAttendanceRate > 0 ? `${attendanceMetrics.overallAttendanceRate}%` : 'Pending'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{attendanceMetrics.totalPresent} of {sisMetrics.totalStudents} present</p>
            </div>

            {/* Students */}
            <div className="rounded-xl px-4 py-3 bg-blue-500/10 border border-blue-500/20">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Enrolled Students</p>
              <p className="text-xl font-extrabold text-blue-300 mt-0.5">{sisMetrics.totalStudents.toLocaleString()}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{sisMetrics.activeStudents} active in class arms</p>
            </div>

            {/* Finance */}
            <div className="rounded-xl px-4 py-3 bg-purple-500/10 border border-purple-500/20">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Fees Collected</p>
              <p className="text-xl font-extrabold text-purple-300 mt-0.5">{formatNaira(totalCollected)}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{collectionRate}% of {formatNaira(totalBilled)} invoiced</p>
            </div>

            {/* Approvals */}
            <div className={`rounded-xl px-4 py-3 border ${hasUrgentApprovals ? 'bg-rose-500/15 border-rose-500/30' : 'bg-slate-500/10 border-slate-500/20'}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Pending Approvals</p>
              <p className={`text-xl font-extrabold mt-0.5 ${hasUrgentApprovals ? 'text-rose-300' : 'text-slate-300'}`}>
                {governanceMetrics.pendingCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {hasUrgentApprovals ? 'Require your authorization' : 'All queues clear'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── URGENT BANNER: Pending Approvals ── */}
      {hasUrgentApprovals && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {governanceMetrics.pendingCount} Dual-Authorization {governanceMetrics.pendingCount === 1 ? 'Request' : 'Requests'} Awaiting Secondary Approval
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Sensitive operations (score modifications, fee reversals, class arm transfers) require a second authorized signatory.
              </p>
            </div>
          </div>
          <Link href="/admin/governance" className="shrink-0">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-500 transition-colors shadow-sm">
              <Scale className="h-3.5 w-3.5" /> Open Approval Queue
            </button>
          </Link>
        </div>
      )}

      {/* ── EMPTY STATE GUIDANCE: No students enrolled yet ── */}
      {sisMetrics.totalStudents === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-bold text-navy-950 text-sm">Welcome to your new school portal!</h3>
            <p className="text-xs text-slate-600">
              Get started by uploading your student roster via CSV or enrolling applicants through the admissions pipeline.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/admin/students">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors shadow-sm">
                <FileSpreadsheet className="h-3.5 w-3.5" /> Student Directory
              </button>
            </Link>
            <Link href="/admin/admissions">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors">
                Admissions Funnel
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* ── ROLE-SPECIFIC KPI INTELLIGENCE PANEL ── */}
      <RoleSpecificKpiPanel session={session} metrics={metricsContext} />

      {/* ── REAL-TIME INSTITUTIONAL PERFORMANCE & VISUAL ANALYTICS ── */}
      <InstitutionalAnalytics
        totalBilled={totalBilled}
        totalCollected={totalCollected}
        overallAttendanceRate={attendanceMetrics.overallAttendanceRate}
      />

      {/* ── CORE WORKFLOW LAUNCH DOCK (4 Primary School Pillars) ── */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Primary Workspaces</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Essential day-to-day administrative centers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Student Records */}
          <Link href="/admin/students" className="group block p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Student Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enrolled students, profiles, and class roster</p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Enrolled</span>
              <span className="text-emerald-700 dark:text-emerald-400">{sisMetrics.totalStudents} Students</span>
            </div>
          </Link>

          {/* Daily Attendance */}
          <Link href="/admin/attendance" className="group block p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-sky-500 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center font-bold">
                <Calendar className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Daily Attendance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Morning roll call, lateness, and parent SMS</p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Today&apos;s Status</span>
              <span className="text-sky-700 dark:text-sky-400">{attendanceMetrics.totalPresent} Present</span>
            </div>
          </Link>

          {/* Fees & Billing */}
          <Link href="/admin/finance" className="group block p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-purple-500 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold">
                <CreditCard className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Fees &amp; Invoices</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Term billing, fee payments, and debtor ledger</p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Collected</span>
              <span className="text-purple-700 dark:text-purple-400">{formatNaira(totalCollected)}</span>
            </div>
          </Link>

          {/* Academic Setup */}
          <Link href="/admin/academic-setup" className="group block p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500 hover:shadow-xs transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Layers className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Academic Setup</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Classes, custom arms, and curriculum subjects</p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Structure</span>
              <span className="text-indigo-700 dark:text-indigo-400">Active</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── ALL MODULE DIRECTORY (INTERACTIVE APPLE-STYLE SEGMENTED BROWSER) ── */}
      <DashboardModuleDirectory
        sisMetrics={sisMetrics}
        attendanceMetrics={attendanceMetrics}
        financeMetrics={{
          totalBilled,
          totalCollected,
          totalOutstanding,
          collectionRate,
        }}
        governanceMetrics={governanceMetrics}
      />

      {/* ── STAKEHOLDER PORTAL FAST SWITCHER ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Role Portal Fast-Switch</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Preview or open dedicated workspaces for each stakeholder group</p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full w-fit border border-emerald-200/50 dark:border-emerald-800/50">
            Multi-Tenant Scoped
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Link href="/portal/teacher" className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Teacher</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/portal/parent" className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Parent</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/portal/student" className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Student</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/admissions/apply" className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-all flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Admissions</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>

    </div>
  );
}
