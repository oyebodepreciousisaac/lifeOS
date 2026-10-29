import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getStudentPortalData } from '@/lib/portals/portal-service';
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
  GraduationCap,
  Calendar,
  Clock,
  Award,
  Bell,
  CheckCircle2,
  BookOpen,
  MapPin,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Student Portal | SchoolOS',
  description: 'Personal class timetable, academic grades, attendance score, and official school announcements.',
};

export default async function StudentPortalPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const data = await getStudentPortalData(session.schoolId, session);

  const averageScore = Math.round(
    data.termGrades.reduce((sum, g) => sum + g.totalScore, 0) / data.termGrades.length
  );

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 transition-colors">

      {/* Top Banner */}
      <div className="rounded-2xl bg-navy-950 dark:bg-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-institutional-lg border border-slate-800 transition-colors">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-navy-900 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-emerald-500/20">
              <GraduationCap className="h-3.5 w-3.5" />
              Student Academic Workspace
            </span>
            <Badge variant="paid">{data.student.classArm}</Badge>
            <Badge variant="approved">Enrolled Scholar</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {data.student.fullName}
          </h1>

          <p className="text-xs text-slate-300 flex items-center gap-2">
            <span>Admission No: <strong className="font-mono text-white">{data.student.admissionNumber}</strong></span>
            <span>•</span>
            <span>{data.student.schoolName}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/portal/parent">
            <Button
              variant="outline"
              size="sm"
              className="text-white border-slate-700 bg-navy-900 dark:bg-slate-800 hover:bg-navy-800 dark:hover:bg-slate-700 text-xs"
            >
              Switch to Guardian View
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards - 2x2 on Mobile, 4-col on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Term Average
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-navy-950 dark:text-white mt-1">
              {averageScore}%
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Academic Standing
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Attendance
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              {data.attendanceSummary.rate}%
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              {data.attendanceSummary.daysPresent} days present
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subjects
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-1">
              {data.termGrades.length} Courses
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-blue-600 font-medium">
              Term Curriculum
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-5 pb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Today&apos;s Classes
            </span>
            <CardTitle className="text-xl sm:text-2xl font-extrabold text-navy-950 mt-1">
              {data.timetableToday.length} Lessons
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs text-slate-500">
              Timetable
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Two Column Grid: Today's Class Schedule & Term Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Today's Timetable */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-navy-950">
                  Today&apos;s Class Timetable
                </CardTitle>
                <CardDescription>Daily lesson schedule and room allocations.</CardDescription>
              </div>
              <Badge variant="approved">Active Schedule</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-3">
            {data.timetableToday.map((lesson) => (
              <div
                key={lesson.period}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-md bg-navy-950 text-white font-mono font-bold flex items-center justify-center text-[11px] shrink-0">
                    P{lesson.period}
                  </span>
                  <div>
                    <h4 className="font-bold text-navy-950">{lesson.subject}</h4>
                    <p className="text-slate-500 text-[11px]">
                      {lesson.teacher} • <span className="font-medium text-slate-700">{lesson.room}</span>
                    </p>
                  </div>
                </div>

                <span className="font-mono text-slate-600 font-medium bg-white px-2.5 py-1 rounded border border-slate-200">
                  {lesson.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Column: Academic Term Results */}
        <Card>
          <CardHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-navy-950">
                  Continuous Assessment & Exam Scores
                </CardTitle>
                <CardDescription>1st Term 2026/2027 Academic Session.</CardDescription>
              </div>
              <Badge variant="paid">CA 40% + Exam 60%</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-center">CA (40)</th>
                    <th className="py-2.5 px-3 text-center">Exam (60)</th>
                    <th className="py-2.5 px-3 text-center">Total</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.termGrades.map((g, i) => (
                    <tr key={i} className="hover:bg-slate-50 font-medium">
                      <td className="py-2 px-3 font-bold text-navy-950">{g.subjectName}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{g.caScore}</td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">{g.examScore}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-navy-950">{g.totalScore}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          g.grade === 'A' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {g.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* School Announcements & Broadcast Notices */}
      <Card>
        <CardHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base font-bold text-navy-950">
                School Broadcast Notices & Announcements
              </CardTitle>
            </div>
            <Badge variant="neutral">{data.notices.length} Active Notices</Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {data.notices.map((notice) => (
            <div key={notice.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-navy-950 text-sm">{notice.title}</h4>
                <span className="font-mono text-[11px] text-slate-400">{notice.date}</span>
              </div>
              <p className="text-slate-600">{notice.content}</p>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block pt-1">
                Issued by {notice.author}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
