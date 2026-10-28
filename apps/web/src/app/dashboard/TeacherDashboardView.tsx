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
  UserCheck,
  FileSpreadsheet,
  Calendar,
  BookOpen,
  Bot,
  Scale,
  Users,
  Video,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { TeacherPortalData } from '@/lib/portals/portal-service';
import { AuthSession } from '@/lib/auth/rbac';

interface TeacherDashboardViewProps {
  session: AuthSession;
  data: TeacherPortalData;
  schoolName: string;
}

export default function TeacherDashboardView({
  session,
  data,
  schoolName,
}: TeacherDashboardViewProps) {
  const totalAssignedScholars = data.assignedClasses.reduce((acc, c) => acc + c.studentCount, 0);

  return (
    <div className="space-y-6">
      {/* ── TEACHER HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden bg-navy-950 text-white p-5 sm:p-8 shadow-institutional-lg">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                <Building className="h-3 w-3" />
                {schoolName}
              </span>
              <Badge variant="paid">{data.todaySummary.dayOfWeek} • Week {data.todaySummary.currentWeek}</Badge>
              <Badge variant="approved">Teacher Workspace</Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{session.firstName} {session.lastName}</span>
            </h1>

            <p className="text-xs text-slate-300">
              Department of Mathematics &amp; Science • Senior Faculty Member • {session.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link href="/admin/attendance">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserCheck className="h-4 w-4" />}
              >
                Take Register
              </Button>
            </Link>
            <Link href="/admin/assessments">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-slate-700 bg-navy-900 hover:bg-navy-800"
                leftIcon={<FileSpreadsheet className="h-4 w-4" />}
              >
                CA Scorebook
              </Button>
            </Link>
          </div>
        </div>

        {/* ── QUICK METRICS STRIP ── */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl px-4 py-3 bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Periods Today</p>
            <p className="text-xl font-extrabold text-emerald-300 mt-0.5">{data.todaySummary.totalPeriodsToday} Classes</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Math &amp; Further Maths</p>
          </div>

          <div className="rounded-xl px-4 py-3 bg-blue-500/10 border border-blue-500/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Roll Call Status</p>
            <p className="text-xl font-extrabold text-blue-300 mt-0.5">
              {data.todaySummary.registersTakenCount} of {data.assignedClasses.length} Done
            </p>
            <p className="text-[11px] text-amber-300 mt-0.5 font-medium">
              {data.todaySummary.registersPendingCount} Arm Pending
            </p>
          </div>

          <div className="rounded-xl px-4 py-3 bg-purple-500/10 border border-purple-500/20">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Assigned Scholars</p>
            <p className="text-xl font-extrabold text-purple-300 mt-0.5">{totalAssignedScholars}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {data.assignedClasses.length} class arms</p>
          </div>

          <div className="rounded-xl px-4 py-3 bg-rose-500/15 border border-rose-500/30">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Action Items</p>
            <p className="text-xl font-extrabold text-rose-300 mt-0.5">{data.pendingTasks.length} Urgent</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Deadlines today</p>
          </div>
        </div>
      </div>

      {/* ── TEACHER CLASSROOM ACTIONS RIBBON ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link href="/admin/attendance" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-emerald-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
              <UserCheck className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Daily Attendance</p>
            <p className="text-[11px] text-slate-500 mt-0.5">&lt; 60s Roll Call</p>
          </div>
        </Link>

        <Link href="/admin/assessments" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-blue-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center mb-2">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">CA Scorebook</p>
            <p className="text-[11px] text-slate-500 mt-0.5">CA1, CA2 &amp; Exam</p>
          </div>
        </Link>

        <Link href="/admin/timetable" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-purple-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-2">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Timetable</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Weekly Schedule</p>
          </div>
        </Link>

        <Link href="/admin/lms" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-amber-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
              <Video className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Virtual LMS</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Lessons &amp; Quizzes</p>
          </div>
        </Link>

        <Link href="/admin/assistive-ai" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-cyan-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center mb-2">
              <Bot className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">AI Lesson Plan</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Curriculum Helper</p>
          </div>
        </Link>

        <Link href="/admin/governance" className="group block">
          <div className="h-full rounded-xl border border-slate-200/90 bg-white p-3.5 hover:border-rose-500 hover:shadow-xs transition-all shadow-xs">
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-2">
              <Scale className="h-5 w-5" />
            </div>
            <p className="font-bold text-xs text-navy-950">Score Alterations</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Maker-Checker</p>
          </div>
        </Link>
      </div>

      {/* ── TWO-COLUMN SCHEDULE & CLASS ARMS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Schedule */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-navy-950">
                    Today&apos;s Teaching Schedule
                  </CardTitle>
                  <CardDescription>
                    {data.todaySummary.dateFormatted} • Clash-proof period timetable
                  </CardDescription>
                </div>
                <Badge variant="approved">Timetable Active</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-2.5">
              {data.scheduleToday.map((period) => (
                <div
                  key={period.periodNumber}
                  className={`p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    period.status === 'CURRENT'
                      ? 'bg-emerald-50/80 border border-emerald-300'
                      : period.status === 'COMPLETED'
                      ? 'bg-slate-50/70 border border-slate-200/70 opacity-80'
                      : 'bg-white border border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-8 w-8 rounded-lg bg-navy-950 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                      P{period.periodNumber}
                    </span>

                    <div>
                      <h4 className="font-bold text-navy-950 text-sm">
                        {period.subjectName} &bull; <span className="text-emerald-700">{period.classArm}</span>
                      </h4>
                      <p className="text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-700 font-medium">{period.timeSlot}</span>
                        <span>•</span>
                        <span>{period.room}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {period.status === 'COMPLETED' && (
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                        Completed
                      </span>
                    )}
                    {period.status === 'CURRENT' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px] animate-pulse">
                        Active Period
                      </span>
                    )}
                    {period.status === 'UPCOMING' && (
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-navy-950">
                Assigned Class Arms &amp; Scorebook Status
              </CardTitle>
              <CardDescription>
                Roll call verification and continuous assessment progress.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 divide-y divide-slate-100">
              {data.assignedClasses.map((cls) => (
                <div key={cls.armId} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="font-bold text-navy-950 text-sm">{cls.classArmName}</h4>
                    <p className="text-slate-500 mt-0.5">
                      Subject: <strong className="text-slate-700">{cls.subjectName}</strong> &bull; {cls.studentCount} Scholars
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {cls.registerTakenToday ? (
                      <Badge variant="paid">Roll Call Done</Badge>
                    ) : (
                      <Link href="/admin/attendance">
                        <Badge variant="debt" className="cursor-pointer hover:opacity-90">
                          Take Register
                        </Badge>
                      </Link>
                    )}

                    <Link href="/admin/assessments">
                      <span className="px-2 py-1 rounded bg-slate-100 font-mono text-slate-700 font-bold text-[11px] hover:bg-slate-200 transition-colors cursor-pointer">
                        Scorebook: {cls.scorebookStatus}
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Urgent Action Items & Quick Links */}
        <div className="space-y-5">
          <Card className="border-amber-200 bg-amber-50/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Urgent Action Items
                </CardTitle>
                <Badge variant="debt">{data.pendingTasks.length}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-2.5 pt-1">
              {data.pendingTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-white border border-amber-200/80 shadow-xs text-xs space-y-1">
                  <span className="text-[10px] font-bold font-mono text-rose-600 uppercase block">
                    {task.type} &bull; {task.urgency} PRIORITY
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
                Classroom Direct Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/portal/teacher" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <BookOpen className="h-4 w-4 mr-2 text-emerald-600" />
                  Open Full Teacher Scorebook
                </Button>
              </Link>

              <Link href="/admin/students" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Users className="h-4 w-4 mr-2 text-blue-600" />
                  Student Biodata Directory
                </Button>
              </Link>

              <Link href="/admin/communications" className="block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                  <Clock className="h-4 w-4 mr-2 text-purple-600" />
                  Class Broadcasts &amp; Notices
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
