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

      {/* ═══════════════════════════════════════════════════════
          SECTION 1: ACADEMICS & STUDENTS
      ═══════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-emerald-700" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-950">Academics &amp; Student Information</h2>
              <p className="text-xs text-slate-500">Students, admissions, attendance, timetables, assessments, and report cards</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student Directory */}
          <Link href="/admin/students" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-navy-950">Student Directory</p>
                <p className="text-xs text-slate-500">Biodata, guardian contacts, medical tags, and arm transfer history</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
                <div>
                  <p className="text-lg font-extrabold text-navy-950">{sisMetrics.totalStudents.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Enrolled</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-emerald-700">{sisMetrics.activeStudents.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Active</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-blue-700">{sisMetrics.admissionsFunnel.totalApplications}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Applicants</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Admissions Funnel */}
          <Link href="/admin/admissions" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-navy-950">Admissions Funnel</p>
                <p className="text-xs text-slate-500">Application review, 70/30 entrance exam scoring, and 1-click enrolment conversion</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
                <div>
                  <p className="text-lg font-extrabold text-navy-950">{sisMetrics.admissionsFunnel.totalApplications}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Total Applied</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-amber-600">{sisMetrics.admissionsFunnel.offered}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Offered</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-emerald-700">{sisMetrics.admissionsFunnel.enrolled}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Enrolled</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Daily Attendance */}
          <Link href="/admin/attendance" className="group block">
            <div className={`h-full rounded-xl border p-5 hover:shadow-institutional-md transition-all shadow-institutional ${
              attendanceMetrics.overallAttendanceRate > 0 && attendanceMetrics.overallAttendanceRate < 85
                ? 'border-amber-300 bg-amber-50/40'
                : 'border-slate-200 bg-white hover:border-sky-500'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  attendanceMetrics.overallAttendanceRate > 0 && attendanceMetrics.overallAttendanceRate < 85
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-sky-50 text-sky-700'
                }`}>
                  <Calendar className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-navy-950">Daily Attendance Register</p>
                <p className="text-xs text-slate-500">Sub-60s mobile roll call, 08:15 AM bell cutoff lateness, and parent SMS alerts</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4">
                <div>
                  <p className="text-lg font-extrabold text-emerald-700">
                    {attendanceMetrics.overallAttendanceRate > 0 ? `${attendanceMetrics.overallAttendanceRate}%` : '—'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">Today&apos;s Rate</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-navy-950">{attendanceMetrics.totalPresent}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Present</p>
                </div>
                <div>
                  <p className="text-lg font-extrabold text-rose-600">{attendanceMetrics.totalLate}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Late</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Master Timetable */}
          <Link href="/admin/timetable" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-navy-950">Master Timetable</p>
                <p className="text-xs text-slate-500">8-period weekly schedule grid with teacher and classroom clash detection</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <Activity className="h-3 w-3" /> Period Grid Active
                </span>
              </div>
            </div>
          </Link>

          {/* Continuous Assessment */}
          <Link href="/admin/assessments" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-purple-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-navy-950">Continuous Assessment</p>
                <p className="text-xs text-slate-500">CA1, CA2, and exam marks with multi-stage moderation workflow</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                  <Shield className="h-3 w-3" /> Cryptographic Score Lock
                </span>
              </div>
            </div>
          </Link>

          {/* Report Cards */}
          <Link href="/admin/report-cards" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-navy-950">Report Cards &amp; Promotion</p>
                <p className="text-xs text-slate-500">Branded termly report cards with QR verification seals and automated promotion engine</p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" /> QR Anti-Tamper Seals
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2: FINANCE & BILLING
      ═══════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <CreditCard className="h-4.5 w-4.5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950">Finance, Fees &amp; Invoicing</h2>
            <p className="text-xs text-slate-500">Fee schedules, bulk invoices, Paystack gateway, and append-only student ledgers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Billing & Invoices */}
          <Link href="/admin/finance" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-emerald-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Receipt className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Billing &amp; Invoices</p>
              <p className="text-xs text-slate-500 mt-0.5">Termly class invoices with sibling discounts and settlement receipts</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div>
                  <p className="text-base font-extrabold text-emerald-700">{invoicesCount}</p>
                  <p className="text-[10px] text-slate-500">Invoices</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-navy-950">{formatNaira(totalBilled)}</p>
                  <p className="text-[10px] text-slate-500">Total Billed</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Fee Schedules */}
          <Link href="/admin/finance?tab=fees" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <CreditCard className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Fee Schedule Rules</p>
              <p className="text-xs text-slate-500 mt-0.5">Tuition, ICT, books, transport, boarding &amp; sibling concession rules</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                  Paystack Gateway Active
                </span>
              </div>
            </div>
          </Link>

          {/* Student Ledger */}
          <Link href="/admin/finance?tab=ledger" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-purple-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Scale className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Student Financial Ledger</p>
              <p className="text-xs text-slate-500 mt-0.5">Immutable double-entry running balance from verified debits and payments</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div>
                  <p className="text-base font-extrabold text-purple-700">{formatNaira(totalCollected)}</p>
                  <p className="text-[10px] text-slate-500">{collectionRate}% collected</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Aging Debtors */}
          <Link href="/admin/finance?tab=aging" className="group block">
            <div className={`h-full rounded-xl border p-5 hover:shadow-institutional-md transition-all shadow-institutional ${
              agingDebtorsCount > 0 ? 'border-amber-300 bg-amber-50/30 hover:border-amber-400' : 'border-slate-200 bg-white hover:border-amber-500'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Aging Debtors Report</p>
              <p className="text-xs text-slate-500 mt-0.5">Balances by 30/60/90-day aging brackets with guardian outreach tools</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div>
                  <p className="text-base font-extrabold text-amber-700">{agingDebtorsCount}</p>
                  <p className="text-[10px] text-slate-500">Debtors</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-rose-700">{formatNaira(totalOutstanding)}</p>
                  <p className="text-[10px] text-slate-500">Outstanding</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 3: SCHOOL OPERATIONS & WELFARE
      ═══════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <HeartPulse className="h-4.5 w-4.5 text-rose-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950">School Operations, Welfare &amp; Learning</h2>
            <p className="text-xs text-slate-500">Hostel, transport, clinic, library, virtual classes, and parent communications</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Auxiliary Services */}
          <Link href="/admin/auxiliary" className="group block">
            <div className={`h-full rounded-xl border p-5 hover:shadow-institutional-md transition-all shadow-institutional ${
              auxiliaryMetrics.criticalCasesToday > 0 ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white hover:border-rose-400'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-rose-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Auxiliary Operations</p>
              <p className="text-xs text-slate-500 mt-0.5">Clinic triage, bus routes, hostel exeat passes, library loans, and PTA projects</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div>
                  <p className="text-base font-extrabold text-rose-700">{auxiliaryMetrics.totalClinicVisitsToday}</p>
                  <p className="text-[10px] text-slate-500">Clinic Today</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-navy-950">{auxiliaryMetrics.activeTransportRoutes}</p>
                  <p className="text-[10px] text-slate-500">Bus Routes</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Virtual LMS */}
          <Link href="/admin/lms" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Video className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Virtual LMS &amp; Classes</p>
              <p className="text-xs text-slate-500 mt-0.5">Course modules, timed quizzes, and live Google Meet / Zoom class sessions</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  <Video className="h-3 w-3" /> Google Meet &amp; Zoom Ready
                </span>
              </div>
            </div>
          </Link>

          {/* School Broadcasts */}
          <Link href="/admin/communications" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-violet-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center">
                  <Radio className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-violet-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">School Broadcasts</p>
              <p className="text-xs text-slate-500 mt-0.5">Broadcast alerts to parents, class arms, or fee debtors via SMS, WhatsApp, and email</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                  Termii SMS · WhatsApp · Email
                </span>
              </div>
            </div>
          </Link>

          {/* Assistive AI */}
          <Link href="/admin/assistive-ai" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-sky-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Assistive AI Workbench</p>
              <p className="text-xs text-slate-500 mt-0.5">NERDC exam questions, lesson plans, and parent summaries with human review gates</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                  <UserCheck className="h-3 w-3" /> Human Review Enforced
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SECTION 4: GOVERNANCE, PORTALS & SECURITY
      ═══════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <ShieldCheck className="h-4.5 w-4.5 text-navy-700" />
          </div>
          <div>
            <h2 className="text-base font-bold text-navy-950">Governance, Portals &amp; Platform Security</h2>
            <p className="text-xs text-slate-500">Maker-Checker approvals, role portals, staff management, and disaster recovery</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Maker-Checker */}
          <Link href="/admin/governance" className="group block">
            <div className={`h-full rounded-xl border p-5 hover:shadow-institutional-md transition-all shadow-institutional ${
              hasUrgentApprovals ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200 bg-white hover:border-amber-500'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Scale className="h-5 w-5" />
                </div>
                {hasUrgentApprovals && (
                  <span className="text-[10px] font-bold text-white bg-amber-600 px-2.5 py-0.5 rounded-full">
                    {governanceMetrics.pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-navy-950">Maker-Checker Approvals</p>
              <p className="text-xs text-slate-500 mt-0.5">Secondary authorization queue for locked grade corrections, fee reversals, and class arm transfers</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-3">
                <div>
                  <p className="text-base font-extrabold text-amber-700">{governanceMetrics.pendingCount}</p>
                  <p className="text-[10px] text-slate-500">Pending</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-emerald-700">{governanceMetrics.approvedCount}</p>
                  <p className="text-[10px] text-slate-500">Approved</p>
                </div>
                <div>
                  <p className="text-base font-extrabold text-slate-600">{governanceMetrics.totalRequests}</p>
                  <p className="text-[10px] text-slate-500">Total</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Staff & Roles */}
          <Link href="/admin/users" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-navy-700 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-navy-700 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Staff &amp; Role Management</p>
              <p className="text-xs text-slate-500 mt-0.5">Staff directory, role assignments, and granular RBAC permission boundaries</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-navy-700 bg-navy-100 px-2 py-0.5 rounded-full">
                  MFA · TOTP · scrypt
                </span>
              </div>
            </div>
          </Link>

          {/* Academic Setup */}
          <Link href="/admin/academic-setup" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Layers className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Academic Setup</p>
              <p className="text-xs text-slate-500 mt-0.5">Sessions, terms, class levels, arms, subjects, and Nigerian NERDC curriculum presets</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                  NERDC Curriculum Presets
                </span>
              </div>
            </div>
          </Link>

          {/* Audit Trail */}
          <Link href="/admin/audit-logs" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-600 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Audit Trail</p>
              <p className="text-xs text-slate-500 mt-0.5">Immutable event log of every action across all modules — who, what, when, and changes</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                  PII-Sanitized &amp; Tamper-Proof
                </span>
              </div>
            </div>
          </Link>

          {/* Security & Backup */}
          <Link href="/admin/platform-security" className="group block">
            <div className="h-full rounded-xl border border-slate-200 bg-white p-5 hover:border-cyan-500 hover:shadow-institutional-md transition-all shadow-institutional">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                  <Database className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
              <p className="font-bold text-sm text-navy-950">Security &amp; Disaster Recovery</p>
              <p className="text-xs text-slate-500 mt-0.5">Automated backup restore drills (RPO ≤ 15m verified), NDPA 2023 data exports</p>
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                  RPO ≤ 15m · RTO ≤ 60m
                </span>
              </div>
            </div>
          </Link>

          {/* Quick Portal Launchpad */}
          <div className="rounded-xl border border-navy-900 bg-gradient-to-br from-navy-950 to-navy-900 p-5 shadow-institutional text-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Stakeholder Portals</p>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">Live</span>
            </div>
            <div className="space-y-2">
              <Link href="/portal/parent" className="flex items-center justify-between p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Parent Portal</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
              </Link>
              <Link href="/portal/teacher" className="flex items-center justify-between p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Teacher Workspace</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
              </Link>
              <Link href="/portal/student" className="flex items-center justify-between p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Student Portal</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
              </Link>
              <Link href="/admissions/apply" className="flex items-center justify-between p-2.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Admissions Form</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
