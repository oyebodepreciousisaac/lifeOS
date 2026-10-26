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
  Select,
  Alert,
} from '@school-os/ui';
import {
  GraduationCap,
  Search,
  Filter,
  ArrowLeft,
  UserCheck,
  FileText,
  Award,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  Eye,
  ExternalLink,
  Phone,
  Mail,
  Building,
  Calendar,
  X,
  Sparkles,
  ClipboardCheck,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import {
  listApplicationsAction,
  scoreApplicationAction,
  issueOfferLetterAction,
  acceptOfferAction,
  convertApplicantToStudentAction,
  getSisDashboardMetricsAction,
} from '../../actions/sis';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import {
  AdmissionApplication,
  SisDashboardMetrics,
} from '../../../lib/sis/sis-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';

export default function AdmissionsFunnelPage() {
  const [applications, setApplications] = React.useState<AdmissionApplication[]>([]);
  const [metrics, setMetrics] = React.useState<SisDashboardMetrics | null>(null);
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [stageFilter, setStageFilter] = React.useState<string>('ALL');
  const [classFilter, setClassFilter] = React.useState<string>('ALL');

  // Modals state
  const [selectedApp, setSelectedApp] = React.useState<AdmissionApplication | null>(null);
  const [scoreModalOpen, setScoreModalOpen] = React.useState(false);
  const [offerModalOpen, setOfferModalOpen] = React.useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = React.useState(false);
  const [detailModalOpen, setDetailModalOpen] = React.useState(false);

  // Form states for Scoring
  const [examScore, setExamScore] = React.useState<number>(75);
  const [interviewScore, setInterviewScore] = React.useState<number>(80);
  const [remarks, setRemarks] = React.useState<string>('');

  // Form states for Offer Letter
  const [tuitionDeposit, setTuitionDeposit] = React.useState<number>(50000);
  const [acceptanceDeadline, setAcceptanceDeadline] = React.useState<string>('');
  const [conditionalNotes, setConditionalNotes] = React.useState<string>('');

  // Form states for 1-Click Enrollment
  const [targetArmId, setTargetArmId] = React.useState<string>('');
  const [admissionPrefix, setAdmissionPrefix] = React.useState<string>('');

  // Action status feedback
  const [processing, setProcessing] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [appsRes, metricsRes, configRes] = await Promise.all([
      listApplicationsAction(),
      getSisDashboardMetricsAction(),
      getAcademicConfigAction(),
    ]);

    if (appsRes.success && appsRes.data) {
      setApplications(appsRes.data);
    }
    if (metricsRes.success && metricsRes.data) {
      setMetrics(metricsRes.data);
    }
    if (configRes.success && configRes.data) {
      setAcademicConfig(configRes.data);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Set default deadline 14 days ahead when opening offer modal
  const handleOpenOfferModal = (app: AdmissionApplication, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedApp(app);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    setAcceptanceDeadline(futureDate.toISOString().split('T')[0]);
    setTuitionDeposit(50000);
    setConditionalNotes(
      'Admission is conditional upon submission of original transfer certificate and verified medical immunization records prior to term resumption.'
    );
    setOfferModalOpen(true);
  };

  const handleOpenScoreModal = (app: AdmissionApplication, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedApp(app);
    setExamScore(app.examScore ?? 75);
    setInterviewScore(app.interviewScore ?? 80);
    setRemarks(app.reviewerRemarks || 'Candidate demonstrated strong academic aptitude and positive behavioral conduct.');
    setScoreModalOpen(true);
  };

  const handleOpenEnrollModal = (app: AdmissionApplication, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedApp(app);
    // Find class level arms
    const level = academicConfig?.classLevels.find(
      (l) => l.id === app.appliedClassLevelId
    );
    if (level && level.arms.length > 0) {
      setTargetArmId(level.arms[0].id);
    } else {
      setTargetArmId('');
    }
    setAdmissionPrefix('');
    setEnrollModalOpen(true);
  };

  const handleOpenDetailModal = (app: AdmissionApplication) => {
    setSelectedApp(app);
    setDetailModalOpen(true);
  };

  // Submit candidate scoring
  const handleScoreSubmit = async () => {
    if (!selectedApp) return;
    setProcessing(true);
    setFeedback(null);

    const res = await scoreApplicationAction(selectedApp.id, {
      examScore: Number(examScore),
      interviewScore: Number(interviewScore),
      reviewerRemarks: remarks.trim() || 'Evaluated by admissions committee.',
    });

    setProcessing(false);
    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: `Successfully scored ${res.data.firstName} ${res.data.lastName}. Composite Score: ${res.data.totalScore}% (${res.data.status}).`,
      });
      setScoreModalOpen(false);
      setApplications((prev) =>
        prev.map((a) => (a.id === res.data!.id ? res.data! : a))
      );
      if (selectedApp.id === res.data.id) setSelectedApp(res.data);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to record candidate scores.',
      });
    }
  };

  // Submit conditional offer letter
  const handleOfferSubmit = async () => {
    if (!selectedApp || !acceptanceDeadline) return;
    setProcessing(true);
    setFeedback(null);

    const res = await issueOfferLetterAction(selectedApp.id, {
      tuitionDeposit: Number(tuitionDeposit),
      acceptanceDeadline,
      conditionalNotes: conditionalNotes.trim(),
    });

    setProcessing(false);
    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: `Official conditional offer letter generated for ${res.data.firstName} ${res.data.lastName}. Deadline: ${res.data.offerLetter?.acceptanceDeadline}.`,
      });
      setOfferModalOpen(false);
      setApplications((prev) =>
        prev.map((a) => (a.id === res.data!.id ? res.data! : a))
      );
      if (selectedApp.id === res.data.id) setSelectedApp(res.data);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to issue offer letter.',
      });
    }
  };

  // Quick accept offer
  const handleAcceptOffer = async (app: AdmissionApplication, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProcessing(true);
    setFeedback(null);

    const res = await acceptOfferAction(app.id);
    setProcessing(false);

    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: `Offer accepted for ${res.data.firstName} ${res.data.lastName}. Ready for 1-click enrollment!`,
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === res.data!.id ? res.data! : a))
      );
      if (selectedApp?.id === res.data.id) setSelectedApp(res.data);
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to record offer acceptance.',
      });
    }
  };

  // Submit 1-click student conversion
  const handleEnrollSubmit = async () => {
    if (!selectedApp || !targetArmId) {
      setFeedback({
        type: 'error',
        message: 'Please select an assigned class arm for enrollment.',
      });
      return;
    }

    setProcessing(true);
    setFeedback(null);

    const res = await convertApplicantToStudentAction(selectedApp.id, {
      classArmId: targetArmId,
      termId: 't1',
      admissionNumberPrefix: admissionPrefix.trim() || undefined,
    });

    setProcessing(false);
    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: `Candidate enrolled successfully! Student ${res.data.firstName} ${res.data.lastName} assigned Admission Number: ${res.data.admissionNumber} (${res.data.currentClassLevelName} ${res.data.currentClassArmName}).`,
      });
      setEnrollModalOpen(false);
      // Reload applications and metrics to reflect conversion
      loadData();
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to complete 1-click student enrollment.',
      });
    }
  };

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.firstName.toLowerCase().includes(search.toLowerCase()) ||
      app.lastName.toLowerCase().includes(search.toLowerCase()) ||
      app.applicationNumber.toLowerCase().includes(search.toLowerCase()) ||
      app.guardian.phonePrimary.includes(search) ||
      app.guardian.email.toLowerCase().includes(search.toLowerCase());

    const matchesStage = stageFilter === 'ALL' || app.status === stageFilter;
    const matchesClass =
      classFilter === 'ALL' || app.appliedClassLevelId === classFilter;

    return matchesSearch && matchesStage && matchesClass;
  });

  const weightedScoreCalc = Math.round(examScore * 0.7 + interviewScore * 0.3);

  // Status badge styling helper
  const renderStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <Badge variant="neutral" className="bg-sky-50 text-sky-700 border-sky-200">
            <Clock className="w-3 h-3 mr-1" /> Submitted
          </Badge>
        );
      case 'EXAM_SCHEDULED':
        return (
          <Badge variant="neutral" className="bg-blue-50 text-blue-700 border-blue-200">
            Exam Scheduled
          </Badge>
        );
      case 'SCORED':
        return (
          <Badge variant="neutral" className="bg-amber-50 text-amber-800 border-amber-200">
            <ClipboardCheck className="w-3 h-3 mr-1" /> Scored
          </Badge>
        );
      case 'OFFERED':
        return (
          <Badge variant="neutral" className="bg-purple-50 text-purple-700 border-purple-200">
            <Send className="w-3 h-3 mr-1" /> Offer Issued
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge variant="approved">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Offer Accepted
          </Badge>
        );
      case 'ENROLLED':
        return (
          <Badge variant="paid">
            <UserCheck className="w-3 h-3 mr-1" /> Enrolled
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="debt">
            <AlertCircle className="w-3 h-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Navigation & Institutional Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-emerald-800">Admissions Funnel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-emerald-600" />
            Admissions & Enrollment Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review prospective applications, score entrance exams & interviews, issue conditional offers, and 1-click enroll accepted candidates into class arms.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admissions/apply" target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="h-4 w-4 text-emerald-600" />}
              className="border-emerald-300 text-emerald-900 bg-emerald-50/50 hover:bg-emerald-100/50"
            >
              Public Application Portal
            </Button>
          </Link>
          <Link href="/admin/students">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<UserCheck className="h-4 w-4" />}
            >
              SIS Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <Alert
          type={feedback.type === 'success' ? 'success' : 'error'}
          title={feedback.type === 'success' ? 'Operation Completed' : 'Operation Failed'}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Funnel Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 shadow-sm border-slate-200 bg-white">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline</span>
          <div className="text-2xl font-black text-navy-950 mt-1">
            {metrics?.admissionsFunnel.totalApplications ?? applications.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">All candidates</span>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200 bg-sky-50/50">
          <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">Submitted</span>
          <div className="text-2xl font-black text-sky-950 mt-1">
            {metrics?.admissionsFunnel.submitted ?? applications.filter((a) => a.status === 'SUBMITTED').length}
          </div>
          <span className="text-[10px] text-sky-600 mt-0.5 block">Pending evaluation</span>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200 bg-amber-50/50">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Scored</span>
          <div className="text-2xl font-black text-amber-950 mt-1">
            {metrics?.admissionsFunnel.scored ?? applications.filter((a) => a.status === 'SCORED').length}
          </div>
          <span className="text-[10px] text-amber-700 mt-0.5 block">Exam/Interview done</span>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200 bg-purple-50/50">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Offered</span>
          <div className="text-2xl font-black text-purple-950 mt-1">
            {metrics?.admissionsFunnel.offered ?? applications.filter((a) => a.status === 'OFFERED').length}
          </div>
          <span className="text-[10px] text-purple-600 mt-0.5 block">Conditional offer</span>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200 bg-emerald-50/50">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Accepted</span>
          <div className="text-2xl font-black text-emerald-950 mt-1">
            {metrics?.admissionsFunnel.accepted ?? applications.filter((a) => a.status === 'ACCEPTED').length}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">Ready for enrollment</span>
        </Card>

        <Card className="p-4 shadow-sm border-slate-200 bg-navy-950 text-white">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Enrolled in SIS</span>
          <div className="text-2xl font-black text-white mt-1">
            {metrics?.admissionsFunnel.enrolled ?? applications.filter((a) => a.status === 'ENROLLED').length}
          </div>
          <span className="text-[10px] text-slate-300 mt-0.5 block">Active students</span>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card className="p-4 shadow-institutional">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by candidate name, application ref #, guardian phone or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="w-44">
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Class Levels</option>
                {academicConfig?.classLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name} ({lvl.section})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-40">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Stages</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="SCORED">Scored</option>
                <option value="OFFERED">Offered</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {(search || classFilter !== 'ALL' || stageFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setClassFilter('ALL');
                  setStageFilter('ALL');
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Applications Data Table */}
      <Card className="shadow-institutional overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="font-bold text-navy-950 text-xs">Application Ref</TableHead>
                <TableHead className="font-bold text-navy-950 text-xs">Candidate Name</TableHead>
                <TableHead className="font-bold text-navy-950 text-xs">Applied Level</TableHead>
                <TableHead className="font-bold text-navy-950 text-xs">Entrance Evaluation</TableHead>
                <TableHead className="font-bold text-navy-950 text-xs">Guardian Details</TableHead>
                <TableHead className="font-bold text-navy-950 text-xs">Stage</TableHead>
                <TableHead className="font-bold text-navy-950 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600"></div>
                      <span className="text-xs">Loading candidate application records...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <GraduationCap className="h-10 w-10 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-700">No applications match your criteria</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search terms or stage filters, or share the public application portal with parents.
                      </p>
                      <Link href="/admissions/apply" className="mt-2">
                        <Button size="sm" variant="outline">
                          Open Public Application Form
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app) => (
                  <TableRow
                    key={app.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                    onClick={() => handleOpenDetailModal(app)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-slate-900">
                      <div>{app.applicationNumber}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="font-bold text-slate-900 text-sm">
                        {app.firstName} {app.middleName ? `${app.middleName} ` : ''}{app.lastName}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <span className="font-medium text-slate-700">{app.gender}</span>
                        <span>•</span>
                        <span>DOB: {app.dateOfBirth}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-navy-50 text-navy-900 border border-navy-100">
                        {app.appliedClassLevelName}
                      </span>
                    </TableCell>

                    <TableCell>
                      {app.totalScore !== undefined ? (
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">
                              {app.totalScore}%
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                app.totalScore >= 50
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {app.totalScore >= 50 ? 'PASSED' : 'FAILED'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Exam: {app.examScore}% (70%) | Interview: {app.interviewScore}% (30%)
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unscored</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-slate-900 font-medium">
                        {app.guardian.firstName} {app.guardian.lastName} ({app.guardian.relationship})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                        <span>{app.guardian.phonePrimary}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {renderStatusBadge(app.status)}
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Stage 1: Submitted -> Score Candidate */}
                        {app.status === 'SUBMITTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50"
                            leftIcon={<Award className="h-3.5 w-3.5" />}
                            onClick={(e) => handleOpenScoreModal(app, e)}
                          >
                            Score
                          </Button>
                        )}

                        {/* Stage 2: Scored -> Issue Offer Letter */}
                        {app.status === 'SCORED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                            leftIcon={<Send className="h-3.5 w-3.5" />}
                            onClick={(e) => handleOpenOfferModal(app, e)}
                          >
                            Issue Offer
                          </Button>
                        )}

                        {/* Stage 3: Offered -> Quick Accept */}
                        {app.status === 'OFFERED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                            leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            onClick={(e) => handleAcceptOffer(app, e)}
                          >
                            Accept Offer
                          </Button>
                        )}

                        {/* Stage 4: Accepted -> 1-Click Enroll */}
                        {app.status === 'ACCEPTED' && (
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-8 px-2.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800"
                            leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                            onClick={(e) => handleOpenEnrollModal(app, e)}
                          >
                            1-Click Enroll
                          </Button>
                        )}

                        {/* If Enrolled: Link to student profile */}
                        {app.status === 'ENROLLED' && (
                          <Link href={`/admin/students`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 px-2 text-xs text-emerald-800"
                              leftIcon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                            >
                              Enrolled
                            </Button>
                          </Link>
                        )}

                        {/* General View Details Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-slate-500 hover:text-slate-900"
                          onClick={() => handleOpenDetailModal(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 1: Candidate Score Entry (Exam 70% + Interview 30%)             */}
      {/* --------------------------------------------------------------------- */}
      {scoreModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-amber-700 uppercase">
                  Admissions Evaluation
                </span>
                <h3 className="text-lg font-bold text-navy-950">
                  Entrance Evaluation: {selectedApp.firstName} {selectedApp.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  Target Class: <strong className="text-slate-800">{selectedApp.appliedClassLevelName}</strong> • Ref: {selectedApp.applicationNumber}
                </p>
              </div>
              <button
                onClick={() => setScoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Entrance Exam Score (70% Weight)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={examScore}
                    onChange={(e) => setExamScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Calculated: {(examScore * 0.7).toFixed(1)} / 70 pts
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Oral Interview Score (30% Weight)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={interviewScore}
                    onChange={(e) => setInterviewScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Calculated: {(interviewScore * 0.3).toFixed(1)} / 30 pts
                  </span>
                </div>
              </div>

              {/* Reactive Composite Score Display */}
              <div className="rounded-xl p-4 bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">Total Composite Weighted Score</span>
                  <span className="text-[11px] text-slate-400">Formula: (Exam × 70%) + (Interview × 30%)</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-navy-950">{weightedScoreCalc}%</div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      weightedScoreCalc >= 50
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {weightedScoreCalc >= 50 ? 'RECOMMEND ADMISSION' : 'BELOW CUTOFF'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Admissions Committee Remarks
                </label>
                <textarea
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Detail the candidate's performance, literacy assessment, and conduct..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setScoreModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleScoreSubmit}
                isLoading={processing}
                leftIcon={<Award className="h-4 w-4" />}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                Save Candidate Scores
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 2: Conditional Offer Letter Issuance                            */}
      {/* --------------------------------------------------------------------- */}
      {offerModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in my-8">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-purple-700 uppercase">
                  Institutional Offer of Admission
                </span>
                <h3 className="text-lg font-bold text-navy-950">
                  Generate Offer: {selectedApp.firstName} {selectedApp.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  Candidate Score: <strong className="text-emerald-700">{selectedApp.totalScore}%</strong> • Applied: {selectedApp.appliedClassLevelName}
                </p>
              </div>
              <button
                onClick={() => setOfferModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Acceptance Deposit (NGN)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="5000"
                    value={tuitionDeposit}
                    onChange={(e) => setTuitionDeposit(Number(e.target.value))}
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Secures classroom seat allocation
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Acceptance Deadline
                  </label>
                  <Input
                    type="date"
                    value={acceptanceDeadline}
                    onChange={(e) => setAcceptanceDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Conditions of Admission
                </label>
                <textarea
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  rows={2}
                  value={conditionalNotes}
                  onChange={(e) => setConditionalNotes(e.target.value)}
                />
              </div>

              {/* Live Formal Letter Preview */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4 text-xs space-y-2 text-slate-800">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-purple-900">
                    <Building className="h-4 w-4 text-purple-700" />
                    <span>Apex Model College, Lagos — Office of the Registrar</span>
                  </div>
                  <span className="font-mono text-[10px] text-purple-700">Ref: {selectedApp.applicationNumber}</span>
                </div>

                <p className="font-semibold text-slate-900 pt-1">
                  Dear {selectedApp.guardian.firstName} {selectedApp.guardian.lastName},
                </p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Following successful performance in the entrance examination with a composite score of{' '}
                  <strong className="text-purple-900">{selectedApp.totalScore}%</strong>, the Academic Board is pleased to offer{' '}
                  <strong className="text-slate-900">{selectedApp.firstName} {selectedApp.lastName}</strong> conditional admission into{' '}
                  <strong className="text-slate-900">{selectedApp.appliedClassLevelName}</strong>.
                </p>
                <div className="p-2.5 rounded bg-white border border-purple-100 space-y-1 text-[11px]">
                  <div>• Acceptance Fee: <strong>₦{tuitionDeposit.toLocaleString('en-NG')}</strong></div>
                  <div>• Acceptance Cutoff: <strong>{acceptanceDeadline || '14 days'}</strong></div>
                  <div>• Terms: {conditionalNotes}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOfferModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOfferSubmit}
                isLoading={processing}
                leftIcon={<Send className="h-4 w-4" />}
                className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
              >
                Issue Formal Offer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* MODAL 3: 1-Click Enrollment as Active Student in SIS                  */}
      {/* --------------------------------------------------------------------- */}
      {enrollModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase">
                  1-Click Student Conversion
                </span>
                <h3 className="text-lg font-bold text-navy-950">
                  Enroll {selectedApp.firstName} {selectedApp.lastName}
                </h3>
                <p className="text-xs text-slate-500">
                  Target Level: <strong className="text-slate-800">{selectedApp.appliedClassLevelName}</strong>
                </p>
              </div>
              <button
                onClick={() => setEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <Alert type="info" title="Non-Destructive Enrollment History">
                Converting this applicant will generate an official institutional student record, configure primary guardian custody & billing links, and initialize an immutable enrollment history entry for the active term.
              </Alert>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Assign Classroom Arm *
                </label>
                <select
                  value={targetArmId}
                  onChange={(e) => setTargetArmId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Class Arm...</option>
                  {academicConfig?.classLevels
                    .find((l) => l.id === selectedApp.appliedClassLevelId)
                    ?.arms.map((arm) => (
                      <option key={arm.id} value={arm.id}>
                        {selectedApp.appliedClassLevelName} - {arm.name} (Max: {arm.capacity} students)
                      </option>
                    ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Assigning arm registers student onto official classroom attendance register.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Custom Admission Number (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="Leave empty to auto-generate (e.g. SCH/2026/001)"
                  value={admissionPrefix}
                  onChange={(e) => setAdmissionPrefix(e.target.value)}
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Unique, tamper-proof institutional identifier.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnrollModalOpen(false)}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEnrollSubmit}
                isLoading={processing}
                leftIcon={<UserCheck className="h-4 w-4" />}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Confirm & Enroll as Student
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* DRAWER: Application Dossier Details                                   */}
      {/* --------------------------------------------------------------------- */}
      {detailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 p-0">
          <div className="bg-white h-full w-full max-w-xl shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {selectedApp.applicationNumber}
                  </span>
                  {renderStatusBadge(selectedApp.status)}
                </div>
                <h2 className="text-xl font-bold text-navy-950">
                  {selectedApp.firstName} {selectedApp.middleName ? `${selectedApp.middleName} ` : ''}{selectedApp.lastName}
                </h2>
                <p className="text-xs text-slate-500">
                  Applied for {selectedApp.appliedClassLevelName}
                </p>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Candidate Biodata */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                Candidate Biodata
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Gender</span>
                  <strong className="text-slate-900">{selectedApp.gender}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Date of Birth</span>
                  <strong className="text-slate-900">{selectedApp.dateOfBirth}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">State of Origin / LGA</span>
                  <strong className="text-slate-900">{selectedApp.stateOfOrigin || 'Lagos'} / {selectedApp.lga || 'Ikeja'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Nationality</span>
                  <strong className="text-slate-900">{selectedApp.nationality}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Residential Address</span>
                  <span className="text-slate-700">{selectedApp.residentialAddress || 'Not provided'}</span>
                </div>
              </div>
            </div>

            {/* Academic History & Allergies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                Previous School & Health Flags
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Previous School</span>
                  <strong className="text-slate-900">{selectedApp.previousSchoolName || 'None (First Entry)'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Previous Class</span>
                  <strong className="text-slate-900">{selectedApp.previousSchoolClass || 'N/A'}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Medical Conditions & Allergies</span>
                  <span className="text-slate-700">{selectedApp.allergies || 'None declared'}</span>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                Guardian Details
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>{selectedApp.guardian.firstName} {selectedApp.guardian.lastName}</span>
                  <Badge variant="neutral">{selectedApp.guardian.relationship}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{selectedApp.guardian.phonePrimary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span className="truncate">{selectedApp.guardian.email}</span>
                  </div>
                  <div>Occupation: {selectedApp.guardian.occupation || 'Self-Employed'}</div>
                  <div>Custody: {selectedApp.guardian.hasCustody ? 'Full' : 'None'}</div>
                </div>
              </div>
            </div>

            {/* Evaluation Scores */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                Entrance Evaluation
              </h4>
              {selectedApp.totalScore !== undefined ? (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-950 text-sm">Composite Score: {selectedApp.totalScore}%</span>
                      <div className="text-[11px] text-amber-800">
                        Exam: {selectedApp.examScore}% | Interview: {selectedApp.interviewScore}%
                      </div>
                    </div>
                    <Badge variant={selectedApp.totalScore >= 50 ? 'approved' : 'debt'}>
                      {selectedApp.totalScore >= 50 ? 'PASSED' : 'FAILED'}
                    </Badge>
                  </div>
                  {selectedApp.reviewerRemarks && (
                    <p className="text-[11px] text-slate-700 italic border-t border-amber-200/60 pt-1.5">
                      "{selectedApp.reviewerRemarks}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">No entrance scores entered yet.</div>
              )}
            </div>

            {/* Offer Letter Details */}
            {selectedApp.offerLetter && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider flex items-center gap-1.5 border-b pb-1">
                  Conditional Offer Letter
                </h4>
                <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-200 text-xs space-y-1.5 text-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acceptance Deposit:</span>
                    <strong className="text-purple-900">₦{selectedApp.offerLetter.tuitionDeposit.toLocaleString('en-NG')}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acceptance Cutoff:</span>
                    <strong className="text-slate-900">{selectedApp.offerLetter.acceptanceDeadline}</strong>
                  </div>
                  {selectedApp.offerLetter.conditionalNotes && (
                    <div className="border-t border-purple-200 pt-1 text-[11px] text-slate-600">
                      Conditions: {selectedApp.offerLetter.conditionalNotes}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions Footer inside Drawer */}
            <div className="pt-4 border-t flex items-center gap-2">
              {selectedApp.status === 'SUBMITTED' && (
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenScoreModal(selectedApp);
                  }}
                >
                  Score Candidate
                </Button>
              )}
              {selectedApp.status === 'SCORED' && (
                <Button
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenOfferModal(selectedApp);
                  }}
                >
                  Issue Offer Letter
                </Button>
              )}
              {selectedApp.status === 'OFFERED' && (
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleAcceptOffer(selectedApp);
                  }}
                >
                  Accept Offer
                </Button>
              )}
              {selectedApp.status === 'ACCEPTED' && (
                <Button
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white"
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenEnrollModal(selectedApp);
                  }}
                >
                  1-Click Enroll Student
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
