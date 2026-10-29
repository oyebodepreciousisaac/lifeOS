'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Input,
  Alert,
} from '@school-os/ui';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  Search,
  Filter,
  Sparkles,
  HelpCircle,
  FileCheck,
  Send,
  Eye,
  RefreshCw,
  Key,
  X,
  History,
  Check,
  XCircle,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import {
  getClassSubjectScoreSheetAction,
  saveSubjectScoresAction,
  submitScoresForModerationAction,
  moderateSubjectScoresAction,
  approveAndCryptographicallyLockScoresAction,
  requestLockedScoreCorrectionAction,
  executeLockedScoreCorrectionAction,
  listCorrectionRequestsAction,
} from '../../actions/assessment';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import {
  ClassSubjectAssessmentSheet,
  SubjectScoreRecord,
  ResultCorrectionRequest,
} from '../../../lib/assessment/assessment-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';

export default function InstitutionalAssessmentsScorebookPage() {
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [selectedArmId, setSelectedArmId] = React.useState<string>('arm_9_1');
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string>('sub_mth');
  const [selectedTermId, setSelectedTermId] = React.useState<string>('t1');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>('ses_2026_2027');

  const [sheet, setSheet] = React.useState<ClassSubjectAssessmentSheet | null>(null);
  const [scoresDraft, setScoresDraft] = React.useState<SubjectScoreRecord[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  // Workflow Dialogs & Modals
  const [moderationModalOpen, setModerationModalOpen] = React.useState<boolean>(false);
  const [moderationRemarks, setModerationRemarks] = React.useState<string>('');
  
  const [correctionModalOpen, setCorrectionModalOpen] = React.useState<boolean>(false);
  const [selectedCorrectionStudent, setSelectedCorrectionStudent] = React.useState<string>('');
  const [correctionComponent, setCorrectionComponent] = React.useState<'ca1Score' | 'ca2Score' | 'examScore'>('ca1Score');
  const [correctionNewScore, setCorrectionNewScore] = React.useState<string>('');
  const [correctionJustification, setCorrectionJustification] = React.useState<string>('');
  
  const [pendingCorrections, setPendingCorrections] = React.useState<ResultCorrectionRequest[]>([]);
  const [viewPendingModal, setViewPendingModal] = React.useState<boolean>(false);

  const [notification, setNotification] = React.useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load Configuration & Score Sheet
  const loadSheet = React.useCallback(async (armId: string, subjectId: string) => {
    setLoading(true);
    setNotification(null);
    try {
      const res = await getClassSubjectScoreSheetAction(armId, subjectId, selectedTermId, selectedSessionId);
      if (res.success && res.data) {
        setSheet(res.data);
        setScoresDraft(JSON.parse(JSON.stringify(res.data.scores)));
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to load score sheet.' });
      }

      // Load pending correction requests
      const corrRes = await listCorrectionRequestsAction();
      if (corrRes.success && corrRes.data) {
        setPendingCorrections(corrRes.data);
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error loading score sheet.' });
    } finally {
      setLoading(false);
    }
  }, [selectedTermId, selectedSessionId]);

  React.useEffect(() => {
    async function init() {
      const configRes = await getAcademicConfigAction();
      if (configRes.success && configRes.data) {
        setAcademicConfig(configRes.data);
      }
      await loadSheet(selectedArmId, selectedSubjectId);
    }
    init();
  }, [loadSheet, selectedArmId, selectedSubjectId]);

  // Handle Score Input Change
  const handleScoreChange = (
    studentId: string,
    field: 'ca1Score' | 'ca2Score' | 'examScore',
    rawVal: string
  ) => {
    const val = rawVal === '' ? null : Number(rawVal);

    setScoresDraft((prev) =>
      prev.map((item) => {
        if (item.studentId !== studentId) return item;

        const updated = { ...item, [field]: val };
        const c1 = updated.ca1Score;
        const c2 = updated.ca2Score;
        const ex = updated.examScore;

        if (c1 === null && c2 === null && ex === null) {
          updated.totalScore = null;
          updated.gradeLetter = null;
          updated.gradePoint = 0;
          updated.remark = 'Incomplete';
        } else {
          const total = (c1 ?? 0) + (c2 ?? 0) + (ex ?? 0);
          updated.totalScore = total;

          // Simple dynamic grade calculation for UI preview
          if (total >= 75) {
            updated.gradeLetter = 'A';
            updated.remark = 'Excellent';
          } else if (total >= 65) {
            updated.gradeLetter = 'B';
            updated.remark = 'Very Good';
          } else if (total >= 50) {
            updated.gradeLetter = 'C';
            updated.remark = 'Good / Credit';
          } else if (total >= 45) {
            updated.gradeLetter = 'D';
            updated.remark = 'Fair / Pass';
          } else if (total >= 40) {
            updated.gradeLetter = 'E';
            updated.remark = 'Pass';
          } else {
            updated.gradeLetter = 'F';
            updated.remark = 'Fail';
          }
        }
        return updated;
      })
    );
  };

  // Quick Action: Save Draft Scores
  const handleSaveDraft = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const res = await saveSubjectScoresAction({
        classArmId: selectedArmId,
        subjectId: selectedSubjectId,
        termId: selectedTermId,
        sessionId: selectedSessionId,
        scores: scoresDraft.map((s) => ({
          studentId: s.studentId,
          studentName: s.studentName,
          admissionNumber: s.admissionNumber,
          ca1Score: s.ca1Score,
          ca2Score: s.ca2Score,
          examScore: s.examScore,
        })),
      });

      if (res.success && res.data) {
        setSheet(res.data);
        setScoresDraft(JSON.parse(JSON.stringify(res.data.scores)));
        setNotification({
          type: 'success',
          message: 'Continuous Assessment scorebook draft saved successfully.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to save scores. Ensure scores are within allowed boundaries.',
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error communicating with scorebook server.' });
    } finally {
      setSaving(false);
    }
  };

  // Quick Action: Submit for Moderation
  const handleSubmitForModeration = async () => {
    if (!sheet) return;
    setSaving(true);
    try {
      // Auto-save first
      await handleSaveDraft();
      const res = await submitScoresForModerationAction(sheet.id);
      if (res.success && res.data) {
        setSheet(res.data);
        setNotification({
          type: 'success',
          message: 'Scores submitted to Academic Committee for moderation.',
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Cannot submit: Please resolve missing marks before submission.',
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to submit score sheet.' });
    } finally {
      setSaving(false);
    }
  };

  // Quick Action: Moderate Scores
  const handleModerate = async () => {
    if (!sheet) return;
    setSaving(true);
    try {
      const res = await moderateSubjectScoresAction(sheet.id, moderationRemarks || 'Reviewed & verified by Academic VP.');
      if (res.success && res.data) {
        setSheet(res.data);
        setModerationModalOpen(false);
        setNotification({
          type: 'success',
          message: 'Scores successfully moderated and cleared for cryptographic sealing.',
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Moderation failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error moderating scores.' });
    } finally {
      setSaving(false);
    }
  };

  // Quick Action: Approve & Cryptographically Lock (HMAC-SHA256)
  const handleCryptographicLock = async () => {
    if (!sheet) return;
    if (!window.confirm('Are you sure you want to cryptographically lock and seal this score sheet? Once sealed, direct edits are permanently prevented unless unlocked via Level 2 Maker-Checker review.')) {
      return;
    }
    setSaving(true);
    try {
      const res = await approveAndCryptographicallyLockScoresAction(sheet.id);
      if (res.success && res.data) {
        setSheet(res.data);
        setNotification({
          type: 'success',
          message: `Score sheet cryptographically locked! Digital Seal: ${res.data.lockedSealHash}`,
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to lock score sheet.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error sealing score sheet.' });
    } finally {
      setSaving(false);
    }
  };

  // Level 2 Maker-Checker: Request Post-Lock Score Correction
  const handleRequestCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheet || !selectedCorrectionStudent) return;
    setSaving(true);
    try {
      const res = await requestLockedScoreCorrectionAction({
        sheetId: sheet.id,
        studentId: selectedCorrectionStudent,
        component: correctionComponent,
        proposedScore: Number(correctionNewScore),
        justification: correctionJustification,
      });

      if (res.success && res.data) {
        setCorrectionModalOpen(false);
        setCorrectionJustification('');
        setCorrectionNewScore('');
        // Refresh list
        const corrRes = await listCorrectionRequestsAction();
        if (corrRes.success && corrRes.data) {
          setPendingCorrections(corrRes.data);
        }
        setNotification({
          type: 'success',
          message: 'Correction request submitted for Level 2 Maker-Checker authorization.',
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to submit correction request.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error submitting correction request.' });
    } finally {
      setSaving(false);
    }
  };

  // Level 2 Maker-Checker: Execute Correction Decision (Principal)
  const handleExecuteCorrection = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setSaving(true);
    try {
      const res = await executeLockedScoreCorrectionAction(
        requestId,
        decision,
        decision === 'APPROVED' ? 'Approved after script audit verification.' : 'Rejected upon review.'
      );
      if (res.success) {
        await loadSheet(selectedArmId, selectedSubjectId);
        setNotification({
          type: 'success',
          message: `Correction request ${decision.toLowerCase()} and sheet re-sealed.`,
        });
      } else {
        setNotification({ type: 'error', message: res.error || 'Failed to execute decision.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error executing correction decision.' });
    } finally {
      setSaving(false);
    }
  };

  // Missing Marks Detection
  const missingScoresList = React.useMemo(() => {
    return scoresDraft.filter((s) => s.ca1Score === null || s.ca2Score === null || s.examScore === null);
  }, [scoresDraft]);

  // Filtered Students in Table
  const filteredScores = React.useMemo(() => {
    if (!searchQuery.trim()) return scoresDraft;
    const q = searchQuery.toLowerCase();
    return scoresDraft.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
    );
  }, [scoresDraft, searchQuery]);

  const isLocked = sheet?.status === 'LOCKED';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-2 sm:p-6 lg:p-8 space-y-5 transition-colors">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/dashboard"
              className="hover:text-institutional-blue dark:hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">Academics</span>
            <span>/</span>
            <span className="text-institutional-blue dark:text-sky-400 font-semibold">CA Scorebook</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-institutional-blue dark:text-sky-400" />
              Continuous Assessment & Examination Scorebook
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Record test scores (CA 1 &amp; 2, max 20 each) and final exam (max 60). Grades and totals calculate automatically.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setViewPendingModal(true)}
            className="flex items-center gap-1.5 text-xs h-9 relative border-slate-300 dark:border-slate-700"
          >
            <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Audit History
            {pendingCorrections.filter((p) => p.status === 'PENDING_APPROVAL').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                {pendingCorrections.filter((p) => p.status === 'PENDING_APPROVAL').length}
              </span>
            )}
          </Button>
          <Link href="/admin/report-cards">
            <Button className="bg-institutional-blue hover:bg-institutional-blue/90 text-white flex items-center gap-1.5 text-xs h-9 shadow-sm">
              <Award className="w-3.5 h-3.5" />
              Compile Report Cards
            </Button>
          </Link>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          className="shadow-sm animate-in fade-in duration-200"
        >
          <span className="font-medium text-sm">{notification.message}</span>
        </Alert>
      )}

      {/* Primary Selection & Filtering Toolbar */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Class Arm
            </label>
            <select
              value={selectedArmId}
              onChange={(e) => setSelectedArmId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-institutional-blue"
            >
              {academicConfig?.classLevels.flatMap((lvl) =>
                lvl.arms.map((arm) => (
                  <option key={arm.id} value={arm.id}>
                    {lvl.name} - {arm.name} (Capacity: {arm.capacity})
                  </option>
                ))
              ) || (
                <>
                  <option value="arm_9_1">JSS 1 - Gold</option>
                  <option value="arm_9_2">JSS 1 - Diamond</option>
                  <option value="arm_14_1">SSS 3 - Science</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-institutional-blue"
            >
              {academicConfig?.subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              )) || (
                <>
                  <option value="sub_mth">Mathematics (MTH)</option>
                  <option value="sub_eng">English Studies (ENG)</option>
                  <option value="sub_bsc">Basic Science (BSC)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Term
            </label>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-institutional-blue"
            >
              <option value="t1">First Term (Michaelmas)</option>
              <option value="t2">Second Term (Lent)</option>
              <option value="t3">Third Term (Trinity)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Academic Session
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-institutional-blue"
            >
              <option value="ses_2026_2027">2026/2027 Academic Session</option>
              <option value="ses_2025_2026">2025/2026 Academic Session</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Moderation Status Banner & Cryptographic Seal Display */}
      {sheet && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-full ${
                  sheet.status === 'LOCKED'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : sheet.status === 'MODERATED'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                    : sheet.status === 'SUBMITTED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {sheet.status === 'LOCKED' ? (
                  <Lock className="w-6 h-6" />
                ) : sheet.status === 'MODERATED' ? (
                  <FileCheck className="w-6 h-6" />
                ) : sheet.status === 'SUBMITTED' ? (
                  <Send className="w-6 h-6" />
                ) : (
                  <Unlock className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {sheet.subjectName} — {sheet.classArmName}
                  </h3>
                  <Badge
                    className={`${
                      sheet.status === 'LOCKED'
                        ? 'bg-emerald-600 text-white'
                        : sheet.status === 'MODERATED'
                        ? 'bg-purple-600 text-white'
                        : sheet.status === 'SUBMITTED'
                        ? 'bg-blue-600 text-white'
                        : 'bg-amber-600 text-white'
                    } uppercase text-xs font-bold tracking-wider`}
                  >
                    {sheet.status}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assigned Teacher: <span className="font-medium text-slate-700 dark:text-slate-300">{sheet.submittedByName || 'Assigned Subject Teacher'}</span> • Weighting: CA1 (20) + CA2 (20) + Exam (60) = 100 Marks
                </p>
              </div>
            </div>

            {/* Workflow Action Stepper Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {!isLocked && (
                <>
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={handleSaveDraft}
                    className="border-slate-300 dark:border-slate-700"
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-1.5" />
                    Save Draft
                  </Button>

                  {sheet.status === 'DRAFT' && (
                    <Button
                      disabled={saving || missingScoresList.length > 0}
                      onClick={handleSubmitForModeration}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Submit to HOD
                    </Button>
                  )}

                  {sheet.status === 'SUBMITTED' && (
                    <Button
                      disabled={saving}
                      onClick={() => setModerationModalOpen(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <FileCheck className="w-4 h-4 mr-1.5" />
                      Moderate Sheet
                    </Button>
                  )}

                  {(sheet.status === 'MODERATED' || sheet.status === 'SUBMITTED') && (
                    <Button
                      disabled={saving}
                      onClick={handleCryptographicLock}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                    >
                      <Lock className="w-4 h-4" />
                      Approve & Seal (SHA-256)
                    </Button>
                  )}
                </>
              )}

              {isLocked && (
                <Button
                  variant="outline"
                  onClick={() => setCorrectionModalOpen(true)}
                  className="border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 flex items-center gap-1.5"
                >
                  <Key className="w-4 h-4 text-purple-600" />
                  Request Score Correction (L2)
                </Button>
              )}
            </div>
          </div>

          {/* Cryptographic Seal Details (If Locked) */}
          {isLocked && sheet.lockedSealHash && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Cryptographically Sealed Sheet:
                  </span>{' '}
                  <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold break-all">
                    {sheet.lockedSealHash}
                  </span>
                  <div className="text-emerald-700 dark:text-emerald-400 text-[11px] mt-0.5">
                    Sealed by: {sheet.lockedByName || 'Principal'} on{' '}
                    {sheet.lockedAt ? new Date(sheet.lockedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full font-semibold bg-white dark:bg-slate-900 text-emerald-700 border border-emerald-300 text-[11px]">
                Tamper Proof
              </span>
            </div>
          )}
        </div>
      )}

      {/* Missing Marks Detector Alert Banner */}
      {missingScoresList.length > 0 && !isLocked && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-lg p-4 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Missing Marks Detected ({missingScoresList.length} Student{missingScoresList.length > 1 ? 's' : ''})
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                The following students have incomplete scores. Submission to Academic Committee will remain blocked until all marks are supplied:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingScoresList.map((m) => (
                  <span
                    key={m.studentId}
                    className="inline-block px-2 py-0.5 bg-amber-200/80 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-xs rounded font-medium"
                  >
                    {m.studentName} ({m.admissionNumber})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score Statistics Cards Bar */}
      {sheet && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Total Students</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {sheet.stats.totalEnrolled}
            </div>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Class Average</span>
            <div className="text-2xl font-bold text-institutional-blue dark:text-sky-400 mt-1">
              {sheet.stats.classAverage}%
            </div>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Highest Score</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {sheet.stats.highestScore}
            </div>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Lowest Score</span>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {sheet.stats.lowestScore}
            </div>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Passed (≥50%)</span>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {sheet.stats.passCount}
            </div>
          </Card>
          <Card className="p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">Failed (&lt;50%)</span>
            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {sheet.stats.failCount}
            </div>
          </Card>
        </div>
      )}

      {/* Main Score Entry Grid */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <Input
              type="text"
              placeholder="Search student or admission no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {isLocked ? (
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <Lock className="w-4 h-4" /> Read-Only Sealed Sheet
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-sky-500" /> Boundary Guard: CA1 ≤ 20, CA2 ≤ 20, Exam ≤ 60
              </span>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/60">
              <TableRow>
                <TableHead className="w-8 sm:w-12 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">#</TableHead>
                <TableHead className="min-w-[130px] sm:min-w-[200px] text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-2 sm:px-4">Student Name</TableHead>
                <TableHead className="w-16 sm:w-28 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">
                  CA 1 <span className="text-[10px] text-slate-400 font-normal">(/20)</span>
                </TableHead>
                <TableHead className="w-16 sm:w-28 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">
                  CA 2 <span className="text-[10px] text-slate-400 font-normal">(/20)</span>
                </TableHead>
                <TableHead className="w-16 sm:w-28 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">
                  Exam <span className="text-[10px] text-slate-400 font-normal">(/60)</span>
                </TableHead>
                <TableHead className="w-14 sm:w-24 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">
                  Total <span className="text-[10px] text-slate-400 font-normal">(/100)</span>
                </TableHead>
                <TableHead className="w-12 sm:w-20 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">Grade</TableHead>
                <TableHead className="hidden md:table-cell w-28 text-center text-xs font-bold text-slate-600 dark:text-slate-300 px-2 sm:px-4">Remark</TableHead>
                <TableHead className="w-16 sm:w-24 text-center text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 px-1 sm:px-3">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-institutional-blue" />
                    Loading scorebook records...
                  </TableCell>
                </TableRow>
              ) : filteredScores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                    No student records found matching filter.
                  </TableCell>
                </TableRow>
              ) : (
                filteredScores.map((score, index) => {
                  const isIncomplete =
                    score.ca1Score === null || score.ca2Score === null || score.examScore === null;
                  const isPass = (score.totalScore ?? 0) >= 50;

                  return (
                    <TableRow key={score.studentId} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <TableCell className="text-center text-xs font-medium text-slate-500 px-1 sm:px-3">
                        {index + 1}
                      </TableCell>
                      <TableCell className="px-2 sm:px-4">
                        <div className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
                          {score.studentName}
                        </div>
                        <div className="text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400">
                          {score.admissionNumber}
                        </div>
                      </TableCell>
                      
                      {/* CA1 Input */}
                      <TableCell className="text-center px-1 sm:px-3">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          disabled={isLocked}
                          value={score.ca1Score ?? ''}
                          onChange={(e) => handleScoreChange(score.studentId, 'ca1Score', e.target.value)}
                          className={`w-14 sm:w-20 mx-auto text-center font-bold text-xs sm:text-sm h-8 sm:h-9 px-1 ${
                            (score.ca1Score ?? 0) > 20
                              ? 'border-rose-500 text-rose-600 bg-rose-50'
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        />
                      </TableCell>

                      {/* CA2 Input */}
                      <TableCell className="text-center px-1 sm:px-3">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          disabled={isLocked}
                          value={score.ca2Score ?? ''}
                          onChange={(e) => handleScoreChange(score.studentId, 'ca2Score', e.target.value)}
                          className={`w-14 sm:w-20 mx-auto text-center font-bold text-xs sm:text-sm h-8 sm:h-9 px-1 ${
                            (score.ca2Score ?? 0) > 20
                              ? 'border-rose-500 text-rose-600 bg-rose-50'
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        />
                      </TableCell>

                      {/* Exam Input */}
                      <TableCell className="text-center px-1 sm:px-3">
                        <Input
                          type="number"
                          min={0}
                          max={60}
                          disabled={isLocked}
                          value={score.examScore ?? ''}
                          onChange={(e) => handleScoreChange(score.studentId, 'examScore', e.target.value)}
                          className={`w-14 sm:w-20 mx-auto text-center font-bold text-xs sm:text-sm h-8 sm:h-9 px-1 ${
                            (score.examScore ?? 0) > 60
                              ? 'border-rose-500 text-rose-600 bg-rose-50'
                              : 'bg-white dark:bg-slate-800'
                          }`}
                        />
                      </TableCell>

                      {/* Total Score */}
                      <TableCell className="text-center px-1 sm:px-3">
                        <span
                          className={`font-bold text-xs sm:text-base ${
                            score.totalScore === null
                              ? 'text-slate-400'
                              : isPass
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {score.totalScore ?? '-'}
                        </span>
                      </TableCell>

                      {/* Grade */}
                      <TableCell className="text-center px-1 sm:px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded font-mono text-[11px] sm:text-xs font-bold border ${
                            score.gradeLetter === 'A'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : score.gradeLetter === 'B'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : score.gradeLetter === 'C'
                              ? 'bg-sky-50 text-sky-700 border-sky-300'
                              : score.gradeLetter === 'D' || score.gradeLetter === 'E'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : score.gradeLetter === 'F'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {score.gradeLetter || '-'}
                        </span>
                      </TableCell>

                      {/* Remark */}
                      <TableCell className="hidden md:table-cell text-center text-xs text-slate-600 dark:text-slate-300 font-medium px-2 sm:px-4">
                        {score.remark || '-'}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center px-1 sm:px-3">
                        {isIncomplete ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Incomplete
                          </span>
                        ) : (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Complete
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Moderation Remarks Modal */}
      {moderationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                Moderate Subject Scores
              </h3>
              <button
                onClick={() => setModerationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Provide formal moderation notes regarding syllabus coverage, grade distribution, and anomaly checks:
            </p>
            <textarea
              rows={4}
              value={moderationRemarks}
              onChange={(e) => setModerationRemarks(e.target.value)}
              placeholder="e.g., Mathematics department moderation completed. Grade curve conforms with WAEC benchmarks."
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setModerationModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleModerate}
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Confirm Moderation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Level 2 Maker-Checker Correction Request Modal */}
      {correctionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRequestCorrection}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                Level 2 Maker-Checker Score Alteration
              </h3>
              <button
                type="button"
                onClick={() => setCorrectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Under SchoolOS institutional policy, locked scores cannot be altered directly. Submit a formal correction proposal with justification for Principal sign-off:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Student
                </label>
                <select
                  required
                  value={selectedCorrectionStudent}
                  onChange={(e) => setSelectedCorrectionStudent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                >
                  <option value="">-- Choose Student --</option>
                  {scoresDraft.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Component
                  </label>
                  <select
                    value={correctionComponent}
                    onChange={(e) => setCorrectionComponent(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white"
                  >
                    <option value="ca1Score">Continuous Assessment 1 (Max 20)</option>
                    <option value="ca2Score">Continuous Assessment 2 (Max 20)</option>
                    <option value="examScore">Examination Score (Max 60)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proposed New Score
                  </label>
                  <Input
                    required
                    type="number"
                    min={0}
                    max={correctionComponent === 'examScore' ? 60 : 20}
                    value={correctionNewScore}
                    onChange={(e) => setCorrectionNewScore(e.target.value)}
                    placeholder="Enter score"
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mandatory Audit Justification
                </label>
                <textarea
                  required
                  rows={3}
                  value={correctionJustification}
                  onChange={(e) => setCorrectionJustification(e.target.value)}
                  placeholder="Detail rationale (e.g., Script re-marking verified by HOD following student petition #KC/2026/09)."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCorrectionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Submit Correction Request
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Maker-Checker Pending Corrections Review Modal */}
      {viewPendingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-3xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Level 2 Maker-Checker Score Alteration Requests
              </h3>
              <button
                onClick={() => setViewPendingModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pendingCorrections.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No score alteration requests recorded for this institution.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingCorrections.map((corr) => (
                  <div
                    key={corr.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-md p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {corr.studentName} ({corr.admissionNumber}) — {corr.subjectName}
                      </div>
                      <Badge
                        className={`${
                          corr.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-600 text-white'
                            : corr.status === 'APPROVED' || corr.status === 'EXECUTED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {corr.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-medium text-slate-500">Component:</span>{' '}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{corr.component}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500">Old Score:</span>{' '}
                        <span className="font-semibold text-rose-600">{corr.oldScore}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500">Proposed Score:</span>{' '}
                        <span className="font-semibold text-emerald-600">{corr.proposedScore}</span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500">Requester:</span> {corr.requesterName}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-white">Audit Justification:</span>{' '}
                      {corr.justification}
                    </div>

                    {corr.status === 'PENDING_APPROVAL' && (
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={saving}
                          onClick={() => handleExecuteCorrection(corr.id, 'REJECTED')}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject Request
                        </Button>
                        <Button
                          size="sm"
                          disabled={saving}
                          onClick={() => handleExecuteCorrection(corr.id, 'APPROVED')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Authorize & Re-seal
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
