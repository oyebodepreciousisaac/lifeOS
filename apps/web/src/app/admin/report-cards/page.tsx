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
  Award,
  ArrowLeft,
  Printer,
  ShieldCheck,
  Search,
  RefreshCw,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  X,
  GraduationCap,
  FileCheck,
  UserCheck,
  Calendar,
  Layers,
  Send,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import {
  compileClassReportCardsAction,
  listClassReportCardsAction,
  evaluateStudentPromotionAction,
  verifyReportCardHashAction,
} from '../../actions/assessment';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import {
  StudentTermReportCard,
  PromotionDecision,
} from '../../../lib/assessment/assessment-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';

export default function InstitutionalReportCardsPage() {
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [selectedArmId, setSelectedArmId] = React.useState<string>('arm_9_1');
  const [selectedTermId, setSelectedTermId] = React.useState<string>('t1');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string>('ses_2026_2027');

  const [reportCards, setReportCards] = React.useState<StudentTermReportCard[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('all');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [compiling, setCompiling] = React.useState<boolean>(false);

  // Verification Hash Lookup Modal
  const [verifyModalOpen, setVerifyModalOpen] = React.useState<boolean>(false);
  const [verificationInput, setVerificationInput] = React.useState<string>('');
  const [verifyLoading, setVerifyLoading] = React.useState<boolean>(false);
  const [verificationResult, setVerificationResult] = React.useState<{
    isValid: boolean;
    reportCard?: StudentTermReportCard;
    verifiedAt: string;
  } | null>(null);

  // Promotion Evaluation Modal
  const [promotionModalOpen, setPromotionModalOpen] = React.useState<boolean>(false);
  const [evaluatingStudent, setEvaluatingStudent] = React.useState<string | null>(null);
  const [promotionResult, setPromotionResult] = React.useState<{
    decision: PromotionDecision;
    overallAverage: number;
    totalSubjects: number;
    passedSubjects: number;
    passedEnglish: boolean;
    passedMath: boolean;
    rationale: string;
  } | null>(null);

  const [notification, setNotification] = React.useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load Report Cards
  const loadReportCards = React.useCallback(async (armId: string) => {
    setLoading(true);
    setNotification(null);
    try {
      const res = await listClassReportCardsAction(armId, selectedTermId, selectedSessionId);
      if (res.success && res.data) {
        setReportCards(res.data);
      } else {
        setReportCards([]);
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error retrieving class report cards.' });
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
      await loadReportCards(selectedArmId);
    }
    init();
  }, [loadReportCards, selectedArmId]);

  // Action: Compile/Re-compile Report Cards
  const handleCompileReportCards = async () => {
    setCompiling(true);
    setNotification(null);
    try {
      const res = await compileClassReportCardsAction(selectedArmId, selectedTermId, selectedSessionId);
      if (res.success && res.data) {
        setReportCards(res.data);
        setNotification({
          type: 'success',
          message: `Successfully compiled ${res.data.length} student report cards with ranking and QR verification hashes.`,
        });
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to compile report cards. Ensure non-draft assessment sheets exist.',
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error compiling report cards.' });
    } finally {
      setCompiling(false);
    }
  };

  // Action: Evaluate Student Promotion Decision
  const handleEvaluatePromotion = async (studentId: string) => {
    setEvaluatingStudent(studentId);
    setPromotionModalOpen(true);
    setPromotionResult(null);
    try {
      const res = await evaluateStudentPromotionAction(studentId, selectedSessionId);
      if (res.success && res.data) {
        setPromotionResult(res.data);
      } else {
        setNotification({ type: 'error', message: res.error || 'Promotion evaluation failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Error evaluating promotion.' });
    } finally {
      setEvaluatingStudent(null);
    }
  };

  // Action: Verify Digital Hash
  const handleVerifyHash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationInput.trim()) return;
    setVerifyLoading(true);
    setVerificationResult(null);
    try {
      const res = await verifyReportCardHashAction(verificationInput.trim());
      if (res.success && res.data) {
        setVerificationResult(res.data);
      } else {
        setVerificationResult({ isValid: false, verifiedAt: new Date().toISOString() });
      }
    } catch {
      setVerificationResult({ isValid: false, verifiedAt: new Date().toISOString() });
    } finally {
      setVerifyLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayedCards = React.useMemo(() => {
    if (selectedStudentId === 'all') return reportCards;
    return reportCards.filter((c) => c.studentId === selectedStudentId);
  }, [reportCards, selectedStudentId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10 space-y-8 print:p-0 print:bg-white">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link
              href="/dashboard"
              className="hover:text-institutional-blue dark:hover:text-sky-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/admin/assessments"
              className="hover:text-institutional-blue dark:hover:text-sky-400 transition-colors"
            >
              Continuous Assessment
            </Link>
            <span>/</span>
            <span className="text-institutional-blue dark:text-sky-400 font-semibold">Report Cards</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-8 h-8 text-institutional-blue dark:text-sky-400" />
              Branded Student Term Report Cards & Promotion Engine
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-300">
              Anti-Fraud SHA-256
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Cognitive results, affective/psychomotor domains, arm ranking, and verifiable QR seal for Nigerian institutional compliance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setVerifyModalOpen(true)}
            className="flex items-center gap-2 border-slate-300 dark:border-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verify Digital Seal
          </Button>

          <Button
            onClick={handleCompileReportCards}
            disabled={compiling}
            className="bg-institutional-blue hover:bg-institutional-blue/90 text-white flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${compiling ? 'animate-spin' : ''}`} />
            Compile Report Cards
          </Button>

          {reportCards.length > 0 && (
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-slate-300 dark:border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          className="shadow-sm print:hidden"
        >
          <span className="font-medium text-sm">{notification.message}</span>
        </Alert>
      )}

      {/* Filter & Student Selector Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 print:hidden">
        <CardContent className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Class Arm
            </label>
            <select
              value={selectedArmId}
              onChange={(e) => setSelectedArmId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100"
            >
              {academicConfig?.classLevels.flatMap((lvl) =>
                lvl.arms.map((arm) => (
                  <option key={arm.id} value={arm.id}>
                    {lvl.name} - {arm.name}
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
              Term
            </label>
            <select
              value={selectedTermId}
              onChange={(e) => setSelectedTermId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100"
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
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="ses_2026_2027">2026/2027 Academic Session</option>
              <option value="ses_2025_2026">2025/2026 Academic Session</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Select Student (View/Print)
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md font-medium text-slate-900 dark:text-slate-100"
            >
              <option value="all">All Students ({reportCards.length} Compiled)</option>
              {reportCards.map((c) => (
                <option key={c.studentId} value={c.studentId}>
                  #{c.positionInArm} {c.studentName} ({c.admissionNumber}) — {c.overallAverage}%
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Report Card Rendering Area */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-institutional-blue" />
          Loading student report cards...
        </div>
      ) : displayedCards.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed border-2 border-slate-300 dark:border-slate-800">
          <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              No Report Cards Compiled Yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Click &quot;Compile Report Cards&quot; above to compile term scores, compute positions in class arm, integrate attendance metrics, and mint digital verification seals.
            </p>
          </div>
          <Button
            onClick={handleCompileReportCards}
            disabled={compiling}
            className="bg-institutional-blue text-white"
          >
            Compile Now
          </Button>
        </Card>
      ) : (
        <div className="space-y-10">
          {displayedCards.map((card) => (
            <div
              key={card.id}
              className="bg-white text-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl p-8 md:p-12 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:break-after-page space-y-8"
            >
              {/* Institution Header */}
              <div className="border-b-2 border-slate-900 pb-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 bg-institutional-blue text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 border-2 border-amber-400">
                    KC
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-institutional-blue uppercase">
                      Kings College Lagos
                    </h2>
                    <p className="text-xs font-semibold text-slate-600 italic">
                      Motto: &quot;Pro Deo et Patria&quot; • Catholic Mission Street, Lagos Island, Nigeria
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Approved by Federal Ministry of Education • Registered Examination Centre No: 0019283
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-center md:items-end space-y-1">
                  <Badge className="bg-institutional-blue text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Official Term Report
                  </Badge>
                  <div className="text-xs font-mono text-slate-600">
                    Session: {card.sessionName}
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    {card.termName}
                  </div>
                </div>
              </div>

              {/* Student Biodata & Attendance Banner */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm">{card.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Admission Number</span>
                  <span className="font-bold font-mono text-slate-900 text-sm">{card.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Class & Arm</span>
                  <span className="font-bold text-slate-900 text-sm">{card.classArmName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Class Position</span>
                  <span className="font-extrabold text-institutional-blue text-sm">
                    #{card.positionInArm} of {card.totalStudentsInArm}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Total School Sessions</span>
                  <span className="font-semibold text-slate-800">{card.attendanceSummary.totalSessions} Sessions</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Sessions Present</span>
                  <span className="font-semibold text-emerald-700">{card.attendanceSummary.sessionsPresent} Sessions</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Sessions Absent</span>
                  <span className="font-semibold text-rose-700">{card.attendanceSummary.sessionsAbsent} Sessions</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Attendance Rate</span>
                  <span className="font-bold text-slate-900">{card.attendanceSummary.attendanceRate}%</span>
                </div>
              </div>

              {/* Cognitive Academic Performance Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Cognitive Domain Academic Performance
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Grading System: WAEC / Universal Standard Nigerian Secondary Scale
                  </span>
                </div>

                <div className="border border-slate-300 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead className="w-10 text-center text-[11px] font-bold text-slate-700">S/N</TableHead>
                        <TableHead className="min-w-[160px] text-[11px] font-bold text-slate-700">Subject</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">CA1 (20)</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">CA2 (20)</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">CA (40)</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">Exam (60)</TableHead>
                        <TableHead className="w-20 text-center text-[11px] font-bold text-slate-700">Total (100)</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">Grade</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">Pos</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">Avg</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">High</TableHead>
                        <TableHead className="w-16 text-center text-[11px] font-bold text-slate-700">Low</TableHead>
                        <TableHead className="min-w-[140px] text-[11px] font-bold text-slate-700">Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {card.subjects.map((sub, idx) => (
                        <TableRow key={sub.subjectId} className="border-b border-slate-200">
                          <TableCell className="text-center text-xs text-slate-500 font-medium">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="text-xs font-bold text-slate-900">
                            {sub.subjectName}
                          </TableCell>
                          <TableCell className="text-center text-xs">{sub.ca1Score ?? '-'}</TableCell>
                          <TableCell className="text-center text-xs">{sub.ca2Score ?? '-'}</TableCell>
                          <TableCell className="text-center text-xs font-semibold">
                            {(sub.ca1Score ?? 0) + (sub.ca2Score ?? 0)}
                          </TableCell>
                          <TableCell className="text-center text-xs">{sub.examScore ?? '-'}</TableCell>
                          <TableCell className="text-center text-xs font-bold text-institutional-blue">
                            {sub.totalScore}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-mono text-xs font-bold">{sub.gradeLetter}</span>
                          </TableCell>
                          <TableCell className="text-center text-xs">#{sub.positionInArm}</TableCell>
                          <TableCell className="text-center text-xs text-slate-500">{sub.classAverage}</TableCell>
                          <TableCell className="text-center text-xs text-emerald-600">{sub.highestInClass}</TableCell>
                          <TableCell className="text-center text-xs text-amber-600">{sub.lowestInClass}</TableCell>
                          <TableCell className="text-xs text-slate-700">{sub.remark}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Academic Summary Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Total Marks Obtained</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    {card.overallTotalScore} <span className="text-xs text-slate-400 font-normal">/ {card.totalPossibleMarks}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Term Cumulative Average</span>
                  <span className="font-extrabold text-institutional-blue text-base">
                    {card.overallAverage}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Overall Grade</span>
                  <Badge className="bg-emerald-600 text-white font-mono text-sm font-bold">
                    {card.overallGradeLetter}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase text-[10px] font-semibold">Rank in Arm</span>
                  <span className="font-extrabold text-slate-900 text-base">
                    #{card.positionInArm} <span className="text-xs text-slate-400 font-normal">of {card.totalStudentsInArm} Students</span>
                  </span>
                </div>
              </div>

              {/* Affective & Psychomotor Behavioral Ratings Grid (1 to 5) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Affective Domain */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                    <span>Affective Domain Ratings</span>
                    <span className="text-[10px] text-slate-500 font-normal">Key: 5=Excellent, 1=Poor</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(card.affectiveRatings).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
                        <span className="capitalize text-slate-700">{key}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                                star <= val
                                  ? 'bg-institutional-blue text-white'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {star}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Psychomotor Domain */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center justify-between">
                    <span>Psychomotor Domain Ratings</span>
                    <span className="text-[10px] text-slate-500 font-normal">Key: 5=Excellent, 1=Poor</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(card.psychomotorRatings).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-1.5 bg-slate-50 rounded">
                        <span className="capitalize text-slate-700">{key}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                                star <= val
                                  ? 'bg-institutional-blue text-white'
                                  : 'bg-slate-200 text-slate-400'
                              }`}
                            >
                              {star}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Teacher & Principal Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-700 block">
                    Form Teacher&apos;s Remarks
                  </span>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs italic text-slate-800 min-h-[50px]">
                    &quot;{card.formTeacherRemark}&quot;
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Signature: ______________________</span>
                    <span>Date: {new Date().toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-700 block">
                    Principal&apos;s Remarks & Seal
                  </span>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs italic text-slate-800 min-h-[50px]">
                    &quot;{card.principalRemark}&quot;
                  </div>
                  <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Adeyemi Ogunlesi, M.Ed (Principal)</span>
                    <span>Next Term Begins: {card.nextTermBegins}</span>
                  </div>
                </div>
              </div>

              {/* Promotion Decision Evaluation Trigger (Term 3 / Session End) */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-institutional-blue" />
                    Annual Rules-Based Promotion Engine
                  </span>
                  <p className="text-xs text-slate-500">
                    Evaluates English, Mathematics, overall average, and subject count against national promotion guidelines.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEvaluatePromotion(card.studentId)}
                  className="border-institutional-blue text-institutional-blue hover:bg-sky-50 text-xs flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Evaluate Promotion Decision
                </Button>
              </div>

              {/* Anti-Fraud Cryptographic Footer & QR Code */}
              <div className="border-t-2 border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-2 border-2 border-slate-900 rounded-md bg-white">
                    <QrCode className="w-14 h-14 text-slate-900" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Tamper-Evident Anti-Fraud Seal
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-600 break-all font-bold">
                      {card.verificationHash}
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Scan QR or enter hash at school-os.ng/verify to validate certificate authenticity.
                    </p>
                  </div>
                </div>

                <div className="text-right text-[11px] text-slate-400">
                  Document ID: {card.id} • Issued: {new Date(card.issuedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Digital Seal Verification Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Anti-Fraud Digital Seal Verification
              </h3>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Paste any cryptographic hash stamped on a SchoolOS report card to verify institutional authenticity:
            </p>

            <form onSubmit={handleVerifyHash} className="space-y-3">
              <Input
                type="text"
                placeholder="e.g. VERIFY-SHA256:4f83b1..."
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                className="font-mono text-xs"
              />
              <Button
                type="submit"
                disabled={verifyLoading || !verificationInput.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
              >
                {verifyLoading ? 'Verifying with Ledger...' : 'Verify Cryptographic Hash'}
              </Button>
            </form>

            {verificationResult && (
              <div
                className={`p-4 rounded-lg border text-xs space-y-2 ${
                  verificationResult.isValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 border-rose-300 text-rose-950 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {verificationResult.isValid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Authentic Institutional Record Verified
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      Verification Failed: Unrecognized or Tampered Hash
                    </>
                  )}
                </div>

                {verificationResult.isValid && verificationResult.reportCard && (
                  <div className="space-y-1 pt-2 border-t border-emerald-200 dark:border-emerald-800">
                    <div>
                      <span className="font-semibold">Student:</span>{' '}
                      {verificationResult.reportCard.studentName} ({verificationResult.reportCard.admissionNumber})
                    </div>
                    <div>
                      <span className="font-semibold">Class Arm:</span>{' '}
                      {verificationResult.reportCard.classArmName}
                    </div>
                    <div>
                      <span className="font-semibold">Term Cumulative:</span>{' '}
                      {verificationResult.reportCard.overallAverage}% (Grade: {verificationResult.reportCard.overallGradeLetter})
                    </div>
                    <div>
                      <span className="font-semibold">Rank in Arm:</span> #{verificationResult.reportCard.positionInArm}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Promotion Decision Details Modal */}
      {promotionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-institutional-blue" />
                Annual Promotion Decision Engine
              </h3>
              <button
                onClick={() => setPromotionModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!promotionResult ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-institutional-blue" />
                Evaluating annual promotion rules...
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div
                  className={`p-4 rounded-lg border text-center space-y-1 ${
                    promotionResult.decision === 'PROMOTED'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : promotionResult.decision === 'PROMOTED_ON_TRIAL'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-rose-50 border-rose-300 text-rose-900'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider block">Official Decision</span>
                  <div className="text-xl font-extrabold uppercase">{promotionResult.decision}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-500 font-medium">Annual Average:</span>{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {promotionResult.overallAverage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Subjects Passed:</span>{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {promotionResult.passedSubjects} of {promotionResult.totalSubjects}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">English Studies:</span>{' '}
                    <span
                      className={`font-bold ${
                        promotionResult.passedEnglish ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {promotionResult.passedEnglish ? 'PASSED (≥50%)' : 'FAILED'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Mathematics:</span>{' '}
                    <span
                      className={`font-bold ${
                        promotionResult.passedMath ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {promotionResult.passedMath ? 'PASSED (≥50%)' : 'FAILED'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 border rounded text-slate-700 dark:text-slate-300">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Decision Rationale:</span>
                  {promotionResult.rationale}
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => setPromotionModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
