'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Layers,
  HelpCircle,
  FileCheck,
  Video,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Plus,
  Play,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/rbac';
import {
  CourseModule,
  Quiz,
  Assignment,
  VirtualClassSession,
  StudentLmsAnalytics,
} from '@/lib/lms/lms-types';
import {
  createLessonAction,
  submitQuizAttemptAction,
  gradeAssignmentAction,
  scheduleVirtualClassAction,
  recordVirtualClassAttendanceAction,
  markLessonCompleteAction,
} from '@/app/actions/lms';

interface LmsClientPageProps {
  session: AuthSession;
  initialModules: CourseModule[];
  initialQuizzes: Quiz[];
  initialAssignments: Assignment[];
  initialVirtualClasses: VirtualClassSession[];
  sampleAnalytics: StudentLmsAnalytics;
}

export default function LmsClientPage({
  session,
  initialModules,
  initialQuizzes,
  initialAssignments,
  initialVirtualClasses,
  sampleAnalytics,
}: LmsClientPageProps) {
  const [activeTab, setActiveTab] = useState<'modules' | 'quizzes' | 'assignments' | 'virtual' | 'analytics'>('modules');

  const [modules, setModules] = useState(initialModules);
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [virtualClasses, setVirtualClasses] = useState(initialVirtualClasses);
  const [analytics, setAnalytics] = useState(sampleAnalytics);

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected lesson modal
  const [selectedLesson, setSelectedLesson] = useState<{
    title: string;
    content: string;
    videoUrl?: string;
    pdfUrl?: string;
    lessonId: string;
  } | null>(null);

  // Quiz simulation state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ scorePercent: number; passed: boolean } | null>(null);

  // Quick virtual class modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [vclassForm, setVclassForm] = useState({
    subjectName: 'Basic Science',
    classArm: 'JSS 1 Gold',
    title: 'Live Lab Demonstration: States of Matter',
    provider: 'ZOOM' as const,
    joinUrl: 'https://zoom.us/j/1234567890',
    meetingId: '123 456 7890',
    passcode: 'SCIENCE26',
    scheduledStartTime: '2026-10-25T14:00:00Z',
    durationMinutes: 45,
  });

  const handleCompleteLesson = async (lessonId: string) => {
    setIsSubmitting(true);
    const res = await markLessonCompleteAction('stu_kcl_001', lessonId);
    setIsSubmitting(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: 'Lesson marked as completed. Progress updated!' });
      setAnalytics((prev) => ({
        ...prev,
        completedLessonsCount: prev.completedLessonsCount + 1,
        lessonProgressPercent: Math.min(100, Math.round(((prev.completedLessonsCount + 1) / prev.totalLessonsCount) * 100)),
      }));
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to update lesson completion.' });
    }
  };

  const handleSubmitSimulatedQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz) return;

    setIsSubmitting(true);
    const answersPayload = Object.entries(quizAnswers).map(([qId, optIdx]) => ({
      questionId: qId,
      selectedOptionIndex: optIdx,
    }));

    const res = await submitQuizAttemptAction({
      quizId: activeQuiz.id,
      studentId: 'stu_kcl_001',
      studentName: 'Chidubem Adeleke',
      classArm: 'JSS 1 Gold',
      answers: answersPayload,
      startedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      const attempt = res.data as any;
      setQuizResult({ scorePercent: attempt.scorePercent, passed: attempt.passed });
      setActionMessage({
        type: 'success',
        text: `Quiz graded automatically: ${attempt.scorePercent}% (${attempt.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}).`,
      });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to submit quiz.' });
    }
  };

  const handleScheduleVirtualClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await scheduleVirtualClassAction(vclassForm);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setVirtualClasses([res.data as VirtualClassSession, ...virtualClasses]);
      setShowScheduleModal(false);
      setActionMessage({ type: 'success', text: res.message || 'Virtual class scheduled.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to schedule class.' });
    }
  };

  const handleRecordAttendance = async (sessionId: string) => {
    setIsSubmitting(true);
    const res = await recordVirtualClassAttendanceAction(sessionId, 'stu_kcl_001');
    setIsSubmitting(false);

    if (res.success) {
      setActionMessage({ type: 'success', text: 'Live session attendance confirmed for Chidubem Adeleke.' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to record attendance.' });
    }
  };

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Digital Curriculum &amp; Virtual Learning Environment
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Learning Management System & Virtual Classrooms
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Deliver hybrid curriculum: structured subject units, multimedia lessons, objective online quizzes with automated scoring, homework submissions with rubric feedback, and Zoom/Google Meet live sessions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Metric Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800 text-slate-300 text-xs">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Course Modules</span>
            <span className="text-lg font-bold text-white mt-1 block">{modules.length} Active</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Published Lessons</span>
            <span className="text-lg font-bold text-white mt-1 block">{totalLessons} Lessons</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Online Quizzes</span>
            <span className="text-lg font-bold text-indigo-400 mt-1 block">{quizzes.length} Auto-Scored</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Homework Tasks</span>
            <span className="text-lg font-bold text-white mt-1 block">{assignments.length} Active</span>
          </div>
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block">Virtual Classes</span>
            <span className="text-lg font-bold text-emerald-400 mt-1 block">{virtualClasses.length} Scheduled</span>
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <p className="font-medium">{actionMessage.text}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto space-x-2 pb-1">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" /> Modules & Lessons ({modules.length})
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'quizzes'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Online Quizzes ({quizzes.length})
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileCheck className="w-4 h-4" /> Homework & Rubrics ({assignments.length})
        </button>
        <button
          onClick={() => setActiveTab('virtual')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'virtual'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" /> Virtual Classrooms ({virtualClasses.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Learning Analytics
        </button>
      </div>

      {/* Tab 1: Modules & Lessons */}
      {activeTab === 'modules' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Course Curriculum Hierarchy & Learning Units
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize curriculum into thematic modules, rich lessons, downloadable worksheets, and lecture videos.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {modules.map((mod) => (
              <div
                key={mod.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {mod.subjectName} • {mod.classArm}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{mod.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{mod.description}</p>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">
                    {mod.lessons.length} {mod.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                </div>

                {/* Lesson List */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  {mod.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-indigo-400 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {lesson.orderIndex}
                        </div>
                        <div>
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">{lesson.title}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {lesson.estimatedDurationMinutes} mins
                            </span>
                            {lesson.videoUrl && <span className="text-indigo-600 dark:text-indigo-400">• Video Lecture</span>}
                            {lesson.resourcePdfUrl && <span>• PDF Worksheet</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setSelectedLesson({
                              title: lesson.title,
                              content: lesson.contentMarkdown,
                              videoUrl: lesson.videoUrl,
                              pdfUrl: lesson.resourcePdfUrl,
                              lessonId: lesson.id,
                            })
                          }
                          className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition"
                        >
                          View Lesson
                        </button>
                        <button
                          onClick={() => handleCompleteLesson(lesson.id)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                        >
                          Mark Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Lesson Content Modal */}
          {selectedLesson && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedLesson.title}</h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      Course Curriculum Viewer
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="prose dark:prose-invert text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  {selectedLesson.content}
                </div>
                {selectedLesson.videoUrl && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-xs flex items-center justify-between text-indigo-800 dark:text-indigo-300">
                    <span className="flex items-center gap-2">
                      <Play className="w-4 h-4" /> Stream Video Lecture
                    </span>
                    <a
                      href={selectedLesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold flex items-center gap-1 hover:underline"
                    >
                      Watch <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Online Quizzes & Automated Objective Scoring Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Students take timed interactive quizzes with immediate automated grading, boundary score validation, and answer rationales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{quiz.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-bold">
                    Pass: {quiz.passingScorePercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-500">{quiz.instructions}</p>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-3">
                  <span>{quiz.questions.length} Questions</span>
                  <span>• {quiz.timeLimitMinutes} Mins</span>
                </div>
                <button
                  onClick={() => {
                    setActiveQuiz(quiz);
                    setQuizAnswers({});
                    setQuizResult(null);
                  }}
                  className="w-full mt-2 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  Take Interactive Quiz
                </button>
              </div>
            ))}
          </div>

          {/* Quiz Taker Modal */}
          {activeQuiz && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form
                onSubmit={handleSubmitSimulatedQuiz}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{activeQuiz.title}</h3>
                    <p className="text-xs text-slate-500">Student: Chidubem Adeleke (JSS 1 Gold)</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                {quizResult && (
                  <div
                    className={`p-4 rounded-xl text-center font-bold text-sm ${
                      quizResult.passed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    Score: {quizResult.scorePercent}% — {quizResult.passed ? 'PASSED ✓' : 'NEEDS IMPROVEMENT'}
                  </div>
                )}

                <div className="space-y-4">
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {idx + 1}. {q.prompt} ({q.points} pts)
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border ${
                              quizAnswers[q.id] === oIdx
                                ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-600 font-semibold'
                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              checked={quizAnswers[q.id] === oIdx}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: oIdx })}
                              className="text-indigo-600"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveQuiz(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {isSubmitting ? 'Grading...' : 'Submit Answers for Auto-Grading'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Assignments */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Student Homework Submissions & Teacher Rubric Feedback
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Set clear multi-criteria grading rubrics, collect student work, and award qualitative teacher feedback.
            </p>
          </div>

          <div className="space-y-4">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{asg.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{asg.description}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 rounded font-bold text-xs">
                    Max: {asg.maxScore} pts
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold block mb-1">Grading Rubric Criteria:</span>
                  <div className="flex flex-wrap gap-2">
                    {asg.rubricCriteria.map((rc, rIdx) => (
                      <span
                        key={rIdx}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[11px] font-medium"
                      >
                        {rc.criterion} ({rc.maxPoints} pts)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
                  <span>Due Date: {new Date(asg.dueDate).toLocaleDateString()}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Active Submission Window Open
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Virtual Classrooms */}
      {activeTab === 'virtual' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live Virtual Classrooms & Video Conferencing
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct integration with Zoom and Google Meet API join links with automatic attendance logging.
              </p>
            </div>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Schedule Virtual Class
            </button>
          </div>

          {showScheduleModal && (
            <form onSubmit={handleScheduleVirtualClass} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Schedule Live Class Session
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Class Title</label>
                  <input
                    type="text"
                    value={vclassForm.title}
                    onChange={(e) => setVclassForm({ ...vclassForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Provider</label>
                  <select
                    value={vclassForm.provider}
                    onChange={(e) => setVclassForm({ ...vclassForm, provider: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  >
                    <option value="ZOOM">Zoom Video</option>
                    <option value="GOOGLE_MEET">Google Meet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Meeting URL</label>
                  <input
                    type="url"
                    value={vclassForm.joinUrl}
                    onChange={(e) => setVclassForm({ ...vclassForm, joinUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  Schedule Session
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {virtualClasses.map((vc) => (
              <div
                key={vc.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {vc.provider} • {vc.classArm}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{vc.title}</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded font-semibold">
                    {vc.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <div><strong>Host Teacher:</strong> {vc.hostTeacherName}</div>
                  <div><strong>Meeting ID:</strong> <span className="font-mono">{vc.meetingId}</span> {vc.passcode && `(Passcode: ${vc.passcode})`}</div>
                  <div><strong>Duration:</strong> {vc.durationMinutes} Minutes</div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <button
                    onClick={() => handleRecordAttendance(vc.id)}
                    disabled={isSubmitting}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Log Attendance
                  </button>
                  <a
                    href={vc.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    <Video className="w-3.5 h-3.5" /> Join Live Class
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Student Learning Analytics & Progress Metrics
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time telemetry measuring lesson completion rate, objective quiz scores, and homework timeliness.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{analytics.studentName}</h3>
                <span className="text-xs text-slate-500">Scholar ID: {analytics.studentId} • JSS 1 Gold</span>
              </div>
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                {analytics.lessonProgressPercent}% Completed
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 mb-1">
                <span>Lessons Finished: {analytics.completedLessonsCount} / {analytics.totalLessonsCount}</span>
                <span>{analytics.lessonProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${analytics.lessonProgressPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Quizzes Taken</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {analytics.quizzesAttemptedCount} Attempts
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Avg Quiz Mastery</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {analytics.averageQuizScorePercent}%
                </span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Homework Submissions</span>
                <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block">
                  {analytics.assignmentsSubmittedCount} on file
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
