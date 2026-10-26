import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  listCourseModules,
  listQuizzes,
  listAssignments,
  listVirtualClasses,
  getStudentLmsAnalytics,
} from '@/lib/lms/lms-store';
import LmsClientPage from './LmsClientPage';

export const metadata = {
  title: 'Learning Management System & Virtual Classrooms | SchoolOS',
  description: 'Modular curriculum builder, online quizzes with automated scoring, homework submissions, and Zoom/Google Meet live sessions.',
};

export default async function LmsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const [
    initialModules,
    initialQuizzes,
    initialAssignments,
    initialVirtualClasses,
    sampleAnalytics,
  ] = await Promise.all([
    listCourseModules(session.schoolId, session),
    listQuizzes(session.schoolId, session),
    listAssignments(session.schoolId, session),
    listVirtualClasses(session.schoolId, session),
    getStudentLmsAnalytics(session.schoolId, session, 'stu_kcl_001', 'Chidubem Adeleke'),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <LmsClientPage
        session={session}
        initialModules={initialModules}
        initialQuizzes={initialQuizzes}
        initialAssignments={initialAssignments}
        initialVirtualClasses={initialVirtualClasses}
        sampleAnalytics={sampleAnalytics}
      />
    </div>
  );
}
