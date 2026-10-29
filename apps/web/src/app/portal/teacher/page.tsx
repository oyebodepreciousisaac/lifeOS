import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getTeacherPortalData } from '@/lib/portals/portal-service';
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
  Calendar,
  Clock,
  UserCheck,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Users,
  Scale,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Teacher Portal | SchoolOS',
  description: 'Daily teaching workspace, interactive timetable, sub-60s roll call register, and CA scorebook.',
};

export default async function TeacherPortalPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const data = await getTeacherPortalData(session.schoolId, session);

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">

      {/* Top Banner */}
      <div className="rounded-2xl bg-navy-950 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-institutional-lg">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-navy-900 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <BookOpen className="h-3.5 w-3.5" />
              Teacher Workspace
            </span>
            <Badge variant="paid">{data.todaySummary.dayOfWeek} • Week {data.todaySummary.currentWeek}</Badge>
            <Badge variant="approved">Class Teacher</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {data.teacher.name}
          </h1>

          <p className="text-xs text-slate-300">
            {data.teacher.schoolName} • Department of Mathematics &amp; Science
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Link href="/admin/attendance" className="flex-1 sm:flex-initial">
            <Button
              variant="primary"
              size="sm"
              className="w-full sm:w-auto"
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              Take Register
            </Button>
          </Link>

          <Link href="/admin/assessments" className="flex-1 sm:flex-initial">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto text-white border-slate-700 bg-navy-900 hover:bg-navy-800"
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            >
              Enter Scores
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats - 2x2 on Mobile, 4-col on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Classes Today
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-1">
              {data.todaySummary.totalPeriodsToday} Periods
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-emerald-600 font-medium">
              Mathematics
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Roll Call
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-1">
              {data.todaySummary.registersTakenCount}/{data.assignedClasses.length} Done
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-amber-700 font-medium">
              {data.todaySummary.registersPendingCount > 0 ? `${data.todaySummary.registersPendingCount} Pending` : 'All Completed'}
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Students
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-1">
              68 Students
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Across 3 class arms
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Action Items
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-rose-700 mt-1">
              {data.pendingTasks.length} Pending
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-rose-600 font-medium">
              Continuous Assessment
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Two Column Grid: Today's Teaching Schedule & Assigned Class Arms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Period Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-navy-950">
                    Today&apos;s Teaching Schedule ({data.todaySummary.dateFormatted})
                  </CardTitle>
                  <CardDescription>
                    8-period clash-proof master schedule.
                  </CardDescription>
                </div>
                <Badge variant="approved">Timetable Synced</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-3">
              {data.scheduleToday.map((period) => (
                <div
                  key={period.periodNumber}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    period.status === 'CURRENT'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : period.status === 'COMPLETED'
                      ? 'bg-slate-50/60 border-slate-200 opacity-75'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-lg bg-navy-950 text-white font-mono font-bold flex items-center justify-center shrink-0">
                      P{period.periodNumber}
                    </span>

                    <div>
                      <h4 className="font-bold text-navy-950 text-sm">
                        {period.subjectName} — <span className="text-emerald-700">{period.classArm}</span>
                      </h4>
                      <p className="text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-700 font-medium">{period.timeSlot}</span>
                        <span>•</span>
                        <span>{period.room}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {period.status === 'COMPLETED' && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                        Completed
                      </span>
                    )}
                    {period.status === 'CURRENT' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold animate-pulse">
                        Active Period
                      </span>
                    )}
                    {period.status === 'UPCOMING' && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Assigned Classes Roster Card */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-navy-950">
                Assigned Class Arms & Scorebook Lifecycle
              </CardTitle>
              <CardDescription>
                Direct roll call register and continuous assessment status.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 divide-y divide-slate-100">
              {data.assignedClasses.map((cls) => (
                <div key={cls.armId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-navy-950 text-sm">{cls.classArmName}</h4>
                    <p className="text-slate-500">
                      Subject: <strong className="text-slate-700">{cls.subjectName}</strong> • {cls.studentCount} Registered Scholars
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cls.registerTakenToday ? (
                      <Badge variant="paid">Roll Call Done</Badge>
                    ) : (
                      <Link href="/admin/attendance">
                        <Badge variant="debt" className="cursor-pointer">
                          Take Register
                        </Badge>
                      </Link>
                    )}

                    <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-700 font-bold">
                      Scorebook: {cls.scorebookStatus}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Urgent Action Items & Quick Links */}
        <div className="space-y-4">
          <Card className="border-amber-200 bg-amber-50/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Urgent Teacher Tasks
                </CardTitle>
                <Badge variant="debt">{data.pendingTasks.length}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-1">
              {data.pendingTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-white border border-amber-200/80 shadow-xs text-xs space-y-1">
                  <span className="text-[10px] font-bold font-mono text-rose-600 uppercase block">
                    {task.type} • {task.urgency} PRIORITY
                  </span>
                  <p className="font-bold text-slate-900">{task.title}</p>
                  <p className="text-slate-500 font-mono text-[11px]">Due: {task.dueTime}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-navy-950">
                Quick Teacher Shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/attendance" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <UserCheck className="h-4 w-4 mr-2 text-emerald-600" />
                  Mobile Register (&lt; 60s)
                </Button>
              </Link>

              <Link href="/admin/assessments" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-blue-600" />
                  Enter CA & Exam Marks
                </Button>
              </Link>

              <Link href="/admin/timetable" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                  Master Weekly Timetable
                </Button>
              </Link>

              <Link href="/admin/governance" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Scale className="h-4 w-4 mr-2 text-amber-600" />
                  Request Score Alteration
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
