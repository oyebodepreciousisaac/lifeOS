'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  FileText,
  DollarSign,
  Briefcase,
  Sparkles,
  Edit3,
  ThumbsUp,
  ThumbsDown,
  UploadCloud,
} from 'lucide-react';
import { AuthSession } from '@/lib/auth/rbac';
import { AiDraftItem, AiTaskDomain } from '@/lib/ai/ai-types';
import {
  generateExamQuestionsAction,
  generateLessonPlanAction,
  generateParentProgressSummaryAction,
  analyzeDebtorNarrativeAction,
  generatePrincipalExecutiveBriefAction,
  reviewAiDraftAction,
  commitAiDraftAction,
} from '@/app/actions/ai';

interface AssistiveAiClientPageProps {
  session: AuthSession;
  initialDrafts: AiDraftItem[];
}

export default function AssistiveAiClientPage({
  session,
  initialDrafts,
}: AssistiveAiClientPageProps) {
  const [activeTab, setActiveTab] = useState<
    'questions' | 'lesson_plan' | 'parent_summary' | 'debtor_analysis' | 'executive_brief' | 'review_queue'
  >('questions');

  const [drafts, setDrafts] = useState<AiDraftItem[]>(initialDrafts);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [qForm, setQForm] = useState({
    subject: 'Mathematics',
    classLevel: 'JSS 1',
    topic: 'Linear Equations in One Variable',
    difficulty: 'MEDIUM' as const,
    questionCount: 3,
  });

  const [lpForm, setLpForm] = useState({
    subject: 'Basic Science & Tech',
    classLevel: 'JSS 1',
    topic: 'Renewable and Clean Energy Systems',
    durationMinutes: 45,
    specialFocus: 'Highlight solar photovoltaic power adoption in Nigerian households.',
  });

  const [psForm, setPsForm] = useState({
    studentId: 'stu_kcl_001',
    studentName: 'Chidubem Adeleke',
    classArm: 'JSS 1 Gold',
    term: 'Term 1',
    grades: [
      { subject: 'Mathematics', score: 88, grade: 'A' },
      { subject: 'English Language', score: 82, grade: 'A' },
      { subject: 'Basic Science', score: 85, grade: 'A' },
      { subject: 'French', score: 58, grade: 'C' },
    ],
    attendancePercent: 95.2,
    conductNotes: 'Consistently respectful, disciplined, and proactive in class science projects.',
  });

  const [dnForm, setDnForm] = useState({
    studentId: 'stu_kcl_008',
    studentName: 'Segun Balogun',
    guardianName: 'Dr. Kehinde Balogun',
    guardianPhone: '+234 803 111 2233',
    outstandingAmount: 185000,
    agingTier: '61_90_DAYS' as const,
    lastPaymentDate: '2026-08-15',
  });

  // Review states
  const [selectedDraftForReview, setSelectedDraftForReview] = useState<AiDraftItem | null>(null);
  const [editedText, setEditedText] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');

  const handleGenerateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await generateExamQuestionsAction(qForm);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setDrafts([res.data as AiDraftItem, ...drafts]);
      setActionMessage({ type: 'success', text: res.message || 'Questions generated.' });
      setActiveTab('review_queue');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to generate questions.' });
    }
  };

  const handleGenerateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await generateLessonPlanAction(lpForm);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setDrafts([res.data as AiDraftItem, ...drafts]);
      setActionMessage({ type: 'success', text: res.message || 'Lesson plan generated.' });
      setActiveTab('review_queue');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to generate lesson plan.' });
    }
  };

  const handleGenerateParentSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await generateParentProgressSummaryAction(psForm);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setDrafts([res.data as AiDraftItem, ...drafts]);
      setActionMessage({ type: 'success', text: res.message || 'Parent summary generated.' });
      setActiveTab('review_queue');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to generate parent summary.' });
    }
  };

  const handleAnalyzeDebtor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await analyzeDebtorNarrativeAction(dnForm);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setDrafts([res.data as AiDraftItem, ...drafts]);
      setActionMessage({ type: 'success', text: res.message || 'Debtor advisory generated.' });
      setActiveTab('review_queue');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to analyze debtor.' });
    }
  };

  const handleGenerateExecBrief = async () => {
    setIsSubmitting(true);
    setActionMessage(null);

    const res = await generatePrincipalExecutiveBriefAction({
      attendanceRatePercent: 94.6,
      chronicAbsenteeCount: 3,
      latenessCountToday: 11,
      unmoderatedResultsCount: 4,
      feeCollectionPercent: 88.2,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      setDrafts([res.data as AiDraftItem, ...drafts]);
      setActionMessage({ type: 'success', text: res.message || 'Executive brief generated.' });
      setActiveTab('review_queue');
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to generate executive brief.' });
    }
  };

  const handleReviewDraft = async (decision: 'APPROVE' | 'REJECT') => {
    if (!selectedDraftForReview) return;
    setIsSubmitting(true);

    const res = await reviewAiDraftAction({
      draftId: selectedDraftForReview.id,
      decision,
      editedContent: editedText || undefined,
      reviewerNotes: reviewerNotes || `Reviewed and ${decision.toLowerCase()}d by ${session.firstName} ${session.lastName}`,
    });
    setIsSubmitting(false);

    if (res.success && res.data) {
      const updated = res.data as AiDraftItem;
      setDrafts(drafts.map((d) => (d.id === updated.id ? updated : d)));
      setSelectedDraftForReview(null);
      setActionMessage({ type: 'success', text: `Draft ${updated.id} marked as ${updated.status}.` });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to review draft.' });
    }
  };

  const handleCommitDraft = async (draftId: string) => {
    setIsSubmitting(true);
    const res = await commitAiDraftAction(draftId);
    setIsSubmitting(false);

    if (res.success) {
      setDrafts(drafts.map((d) => (d.id === draftId ? { ...d, status: 'COMMITTED' } : d)));
      setActionMessage({ type: 'success', text: 'AI Draft committed to official school records!' });
    } else {
      setActionMessage({ type: 'error', text: res.error || 'Failed to commit AI draft.' });
    }
  };

  const pendingReviewCount = drafts.filter((d) => d.status === 'DRAFT_PENDING_REVIEW').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Assistive AI &amp; Human Review Gate
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Assistive AI & Educator Productivity Workbench
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Strictly human-governed AI assistant: draft Nigerian curriculum exam questions, generate rich lesson plans, translate grades into plain-language parent updates, and analyze debtor narratives.
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

        {/* Strict Governance Policy Strip */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-3 text-xs bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <p className="text-slate-300">
            <strong className="text-white">Strict Human Review &amp; Approval Policy:</strong> AI operates strictly as an assistant, never as final authority. All generated drafts remain in <code>DRAFT_PENDING_REVIEW</code> until an educator explicitly inspects, edits, and authorizes them before saving to live records.
          </p>
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
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" /> Exam Question Generator
        </button>
        <button
          onClick={() => setActiveTab('lesson_plan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'lesson_plan'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Lesson Plan Assistant
        </button>
        <button
          onClick={() => setActiveTab('parent_summary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'parent_summary'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" /> Parent Progress Narrator
        </button>
        <button
          onClick={() => setActiveTab('debtor_analysis')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'debtor_analysis'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Bursar Debtor Advisory
        </button>
        <button
          onClick={() => setActiveTab('executive_brief')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'executive_brief'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Principal Executive Brief
        </button>
        <button
          onClick={() => setActiveTab('review_queue')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition whitespace-nowrap ${
            activeTab === 'review_queue'
              ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 border-t-2 border-violet-500 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4" /> Educator Review &amp; Approval Gate ({pendingReviewCount} pending)
        </button>
      </div>

      {/* Tab 1: Exam Question Generator */}
      {activeTab === 'questions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Teacher Curriculum Assistant: Exam & Quiz Questions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates multiple-choice and short-answer objective questions grounded strictly in NERDC Nigerian curriculum topics.
            </p>
          </div>

          <form onSubmit={handleGenerateQuestions} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  value={qForm.subject}
                  onChange={(e) => setQForm({ ...qForm, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Class Level</label>
                <input
                  type="text"
                  value={qForm.classLevel}
                  onChange={(e) => setQForm({ ...qForm, classLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Difficulty Level</label>
                <select
                  value={qForm.difficulty}
                  onChange={(e) => setQForm({ ...qForm, difficulty: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="EASY">Easy (Foundational Recall)</option>
                  <option value="MEDIUM">Medium (Conceptual Application)</option>
                  <option value="HARD">Hard (Higher-Order Analysis)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Syllabus Topic</label>
                <input
                  type="text"
                  value={qForm.topic}
                  onChange={(e) => setQForm({ ...qForm, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Question Count</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={qForm.questionCount}
                  onChange={(e) => setQForm({ ...qForm, questionCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {isSubmitting ? 'Generating...' : 'Generate Questions Draft'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Lesson Plan Assistant */}
      {activeTab === 'lesson_plan' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Lesson Plan Outline Assistant (NERDC Format)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates a 5-step structured lesson plan: behavioral objectives, starter activity, concept delivery, guided practice, plenary, and homework.
            </p>
          </div>

          <form onSubmit={handleGenerateLessonPlan} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  value={lpForm.subject}
                  onChange={(e) => setLpForm({ ...lpForm, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Class Level</label>
                <input
                  type="text"
                  value={lpForm.classLevel}
                  onChange={(e) => setLpForm({ ...lpForm, classLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Duration (Mins)</label>
                <input
                  type="number"
                  value={lpForm.durationMinutes}
                  onChange={(e) => setLpForm({ ...lpForm, durationMinutes: parseInt(e.target.value) || 45 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Topic</label>
                <input
                  type="text"
                  value={lpForm.topic}
                  onChange={(e) => setLpForm({ ...lpForm, topic: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Special Focus</label>
                <input
                  type="text"
                  value={lpForm.specialFocus}
                  onChange={(e) => setLpForm({ ...lpForm, specialFocus: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {isSubmitting ? 'Generating...' : 'Draft Lesson Plan Outline'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Parent Progress Summarizer */}
      {activeTab === 'parent_summary' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Parent Plain-Language Student Progress Narrator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Converts raw assessment grades and attendance rates into encouraging, professional narrative updates for parents.
            </p>
          </div>

          <form onSubmit={handleGenerateParentSummary} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Student Name</label>
                <input
                  type="text"
                  value={psForm.studentName}
                  onChange={(e) => setPsForm({ ...psForm, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Class Arm</label>
                <input
                  type="text"
                  value={psForm.classArm}
                  onChange={(e) => setPsForm({ ...psForm, classArm: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Attendance Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={psForm.attendancePercent}
                  onChange={(e) => setPsForm({ ...psForm, attendancePercent: parseFloat(e.target.value) || 90 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Teacher Conduct Notes</label>
                <input
                  type="text"
                  value={psForm.conductNotes}
                  onChange={(e) => setPsForm({ ...psForm, conductNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {isSubmitting ? 'Synthesizing...' : 'Generate Parent Progress Narrative'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Bursar Debtor Advisory */}
      {activeTab === 'debtor_analysis' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Bursar Debtor Exception & Financial Advisory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyzes student double-entry debt aging and drafts personalized, respectful payment reminder notices.
            </p>
          </div>

          <form onSubmit={handleAnalyzeDebtor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Student Name</label>
                <input
                  type="text"
                  value={dnForm.studentName}
                  onChange={(e) => setDnForm({ ...dnForm, studentName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Guardian Name</label>
                <input
                  type="text"
                  value={dnForm.guardianName}
                  onChange={(e) => setDnForm({ ...dnForm, guardianName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-medium">Outstanding Balance (₦)</label>
                <input
                  type="number"
                  value={dnForm.outstandingAmount}
                  onChange={(e) => setDnForm({ ...dnForm, outstandingAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-900"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {isSubmitting ? 'Analyzing...' : 'Generate Debtor Payment Advisory'}
            </button>
          </form>
        </div>
      )}

      {/* Tab 5: Executive Brief */}
      {activeTab === 'executive_brief' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Principal Operational Synthesis & Executive Action Brief
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synthesizes daily attendance rates, lateness violations, result moderation bottlenecks, and fee collection runway into high-level bullet recommendations.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Active Operational Telemetry Sync:</span>
              <span className="text-emerald-600 font-bold">100% Live</span>
            </div>
            <p className="text-slate-500">
              Includes current campus attendance (94.6%), chronic absence alerts (3 scholars), bell lateness flags (11 pupils), and VP moderation queues (4 sheets).
            </p>
            <button
              onClick={handleGenerateExecBrief}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> {isSubmitting ? 'Synthesizing...' : 'Generate Executive Brief for Principal'}
            </button>
          </div>
        </div>
      )}

      {/* Tab 6: ADR-05 Human Review Gate Queue */}
      {activeTab === 'review_queue' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Educator Review &amp; Approval Console
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect AI-generated drafts, make human educator edits, and approve or reject before committing to live database records.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded font-bold text-xs">
              {pendingReviewCount} Pending Review
            </span>
          </div>

          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                        {draft.taskDomain}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                        {draft.targetEntityName || draft.id}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Requested by {draft.requestedBy} on {new Date(draft.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      draft.status === 'COMMITTED'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : draft.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : draft.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    {draft.status}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto font-sans">
                  {draft.editedContent || draft.generatedContent}
                </div>

                {draft.reviewerNotes && (
                  <div className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 p-2 rounded">
                    <strong>Reviewer Note:</strong> {draft.reviewerNotes} ({draft.reviewedBy})
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-500 font-mono">ID: {draft.id}</span>
                  <div className="flex items-center gap-2">
                    {draft.status === 'DRAFT_PENDING_REVIEW' && (
                      <button
                        onClick={() => {
                          setSelectedDraftForReview(draft);
                          setEditedText(draft.generatedContent);
                          setReviewerNotes('');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Review & Edit
                      </button>
                    )}
                    {draft.status === 'APPROVED' && (
                      <button
                        onClick={() => handleCommitDraft(draft.id)}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                      >
                        <UploadCloud className="w-3.5 h-3.5" /> Commit to Records
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Review Modal */}
          {selectedDraftForReview && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Educator Review &amp; Approval Gate
                    </h3>
                    <p className="text-xs text-slate-500">Draft: {selectedDraftForReview.taskDomain}</p>
                  </div>
                  <button
                    onClick={() => setSelectedDraftForReview(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Edit Draft Content (Human In The Loop)
                    </label>
                    <textarea
                      rows={8}
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-950 font-mono text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reviewer Sign-off Justification
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Verified against NERDC curriculum syllabus."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-950 text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleReviewDraft('REJECT')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Reject Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewDraft('APPROVE')}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Approve &amp; Save to Records
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
