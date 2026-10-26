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
  Users,
  Search,
  Filter,
  ArrowLeft,
  UserPlus,
  FileSpreadsheet,
  ArrowRightLeft,
  Calendar,
  Building,
  ShieldAlert,
  Phone,
  Mail,
  HeartPulse,
  History,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import {
  listStudentsAction,
  transferStudentClassArmAction,
  getSisDashboardMetricsAction,
} from '../../actions/sis';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import { StudentRecord, SisDashboardMetrics } from '../../../lib/sis/sis-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';

export default function StudentsDirectoryPage() {
  const [students, setStudents] = React.useState<StudentRecord[]>([]);
  const [metrics, setMetrics] = React.useState<SisDashboardMetrics | null>(null);
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('ALL');
  const [genderFilter, setGenderFilter] = React.useState('ALL');
  const [classFilter, setClassFilter] = React.useState('ALL');

  // Selected Student Profile Modal
  const [selectedStudent, setSelectedStudent] = React.useState<StudentRecord | null>(null);
  const [profileTab, setProfileTab] = React.useState<'biodata' | 'guardians' | 'history'>('biodata');

  // Transfer Arm Modal
  const [transferModalOpen, setTransferModalOpen] = React.useState(false);
  const [targetStudentForTransfer, setTargetStudentForTransfer] = React.useState<StudentRecord | null>(null);
  const [transferArmId, setTransferArmId] = React.useState('');
  const [transferReason, setTransferReason] = React.useState('');
  const [transferring, setTransferring] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [studentsRes, metricsRes, configRes] = await Promise.all([
      listStudentsAction(),
      getSisDashboardMetricsAction(),
      getAcademicConfigAction(),
    ]);

    if (studentsRes.success && studentsRes.data) {
      setStudents(studentsRes.data);
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

  // Client-side filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.firstName.toLowerCase().includes(search.toLowerCase()) ||
      s.lastName.toLowerCase().includes(search.toLowerCase()) ||
      s.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.guardians.some((g) => g.guardian.phonePrimary.includes(search));

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesGender = genderFilter === 'ALL' || s.gender === genderFilter;
    const matchesClass = classFilter === 'ALL' || s.currentClassLevelId === classFilter;

    return matchesSearch && matchesStatus && matchesGender && matchesClass;
  });

  const handleOpenTransfer = (student: StudentRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTargetStudentForTransfer(student);
    setTransferArmId('');
    setTransferReason('');
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = async () => {
    if (!targetStudentForTransfer || !transferArmId || !transferReason.trim()) {
      setFeedback({ type: 'error', message: 'Please select a target arm and enter a reason.' });
      return;
    }

    setTransferring(true);
    setFeedback(null);
    const res = await transferStudentClassArmAction(targetStudentForTransfer.id, {
      newClassArmId: transferArmId,
      termId: 't1',
      reason: transferReason.trim(),
    });

    setTransferring(false);
    if (res.success && res.data) {
      setFeedback({
        type: 'success',
        message: `Successfully transferred ${res.data.firstName} ${res.data.lastName} to ${res.data.currentClassLevelName} ${res.data.currentClassArmName}.`,
      });
      setTransferModalOpen(false);
      // Update local state
      setStudents((prev) =>
        prev.map((s) => (s.id === res.data!.id ? res.data! : s))
      );
      if (selectedStudent?.id === res.data.id) {
        setSelectedStudent(res.data);
      }
    } else {
      setFeedback({
        type: 'error',
        message: res.error || 'Failed to transfer student.',
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-950 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-navy-900" />
            Student Information System (SIS)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authoritative, non-destructive student registry, guardian custody linkages, and class enrollment history.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/admissions">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Sparkles className="h-4 w-4 text-emerald-600" />}
            >
              Admissions Funnel
            </Button>
          </Link>
          <Link href="/admin/students/import">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileSpreadsheet className="h-4 w-4 text-navy-700" />}
            >
              Batch CSV Import
            </Button>
          </Link>
          <Link href="/admissions/apply" target="_blank">
            <Button
              size="sm"
              className="bg-navy-950 text-white hover:bg-navy-900"
              leftIcon={<UserPlus className="h-4 w-4 text-emerald-400" />}
            >
              New Application Form
            </Button>
          </Link>
        </div>
      </div>

      {feedback && (
        <Alert
          type={feedback.type === 'error' ? 'error' : 'success'}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Enrolled
              </p>
              <p className="text-2xl font-black text-navy-950 mt-1">
                {metrics.totalStudents}
              </p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {metrics.activeStudents} active in session
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Gender Breakdown
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-lg font-bold text-navy-900">
                  {metrics.maleCount} <span className="text-xs font-normal text-slate-500">Boys</span>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-lg font-bold text-navy-900">
                  {metrics.femaleCount} <span className="text-xs font-normal text-slate-500">Girls</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {metrics.totalStudents > 0
                  ? `${Math.round((metrics.maleCount / metrics.totalStudents) * 100)}% / ${Math.round(
                      (metrics.femaleCount / metrics.totalStudents) * 100
                    )}% ratio`
                  : 'No students enrolled'}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Secondary Section
              </p>
              <p className="text-2xl font-black text-navy-950 mt-1">
                {metrics.bySection.juniorSecondary + metrics.bySection.seniorSecondary}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {metrics.bySection.juniorSecondary} Junior • {metrics.bySection.seniorSecondary} Senior
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Admissions Pipeline
              </p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {metrics.admissionsFunnel.totalApplications}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                {metrics.admissionsFunnel.offered} offered • {metrics.admissionsFunnel.enrolled} enrolled
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, admission number (e.g. KCL/2026/001), or guardian phone..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 text-xs rounded-md border border-slate-300 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Class Levels</option>
              {academicConfig?.classLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name} ({lvl.section.replace('_', ' ')})
                </option>
              ))}
            </select>

            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="h-9 text-xs rounded-md border border-slate-300 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Boys Only</option>
              <option value="FEMALE">Girls Only</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 text-xs rounded-md border border-slate-300 bg-white px-2.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="GRADUATED">Graduated</option>
              <option value="TRANSFERRED">Transferred</option>
              <option value="WITHDRAWN">Withdrawn</option>
            </select>

            {(search || classFilter !== 'ALL' || genderFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setClassFilter('ALL');
                  setGenderFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-xs text-slate-500"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Student Directory Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
          <div>
            <CardTitle className="text-base font-bold text-navy-950">
              Institutional Student Registry
            </CardTitle>
            <CardDescription>
              Showing {filteredStudents.length} of {students.length} enrolled students
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="inline-block h-7 w-7 animate-spin rounded-full border-4 border-navy-900 border-t-transparent" />
              <p className="text-xs font-semibold text-slate-600">Loading student directory...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Users className="mx-auto h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No students found matching your criteria</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or class level filter.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Admission No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Gender / Age</TableHead>
                  <TableHead>Class & Arm</TableHead>
                  <TableHead>Primary Guardian</TableHead>
                  <TableHead>Medical Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const primaryGuardian =
                    student.guardians.find((g) => g.isPrimaryContact)?.guardian ||
                    student.guardians[0]?.guardian;

                  return (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell className="font-mono text-xs font-bold text-navy-950">
                        {student.admissionNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-navy-100 text-navy-900 font-bold flex items-center justify-center text-xs">
                            {student.firstName[0]}
                            {student.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-navy-950">
                              {student.firstName} {student.lastName}
                            </p>
                            {student.middleName && (
                              <p className="text-[10px] text-slate-500">{student.middleName}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <span className="font-semibold">{student.gender}</span>
                        <span className="text-[10px] text-slate-400 block">{student.dateOfBirth}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            {student.currentClassLevelName}
                          </span>
                          <Badge variant="neutral" className="text-[10px] py-0 px-1.5 font-bold">
                            {student.currentClassArmName}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {primaryGuardian ? (
                          <div className="text-xs">
                            <p className="font-semibold text-slate-800">
                              {primaryGuardian.firstName} {primaryGuardian.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {primaryGuardian.phonePrimary}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Unlinked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {student.bloodGroup && student.bloodGroup !== 'UNKNOWN' && (
                            <Badge variant="neutral" className="text-[10px] py-0 px-1 bg-red-50 text-red-700 border-red-200">
                              {student.bloodGroup}
                            </Badge>
                          )}
                          {student.genotype && student.genotype !== 'UNKNOWN' && (
                            <Badge variant="neutral" className="text-[10px] py-0 px-1 bg-amber-50 text-amber-800 border-amber-200">
                              {student.genotype}
                            </Badge>
                          )}
                          {student.allergies && student.allergies.toLowerCase() !== 'none' && (
                            <span title={student.allergies} className="text-[10px] text-red-600 font-medium">
                              ⚠ Allergies
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={student.status === 'ACTIVE' ? 'approved' : 'draft'}
                          className="text-[10px]"
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                          onClick={(e) => handleOpenTransfer(student, e)}
                          leftIcon={<ArrowRightLeft className="h-3.5 w-3.5" />}
                        >
                          Transfer Arm
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unified Student Profile Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-navy-950 text-emerald-400 font-extrabold flex items-center justify-center text-lg">
                  {selectedStudent.firstName[0]}
                  {selectedStudent.lastName[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-navy-950">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <Badge variant="approved">{selectedStudent.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Admission Number: {selectedStudent.admissionNumber} • Assigned to{' '}
                    <strong className="text-navy-900">
                      {selectedStudent.currentClassLevelName} {selectedStudent.currentClassArmName}
                    </strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold gap-6">
              <button
                onClick={() => setProfileTab('biodata')}
                className={`pb-2.5 transition-colors ${
                  profileTab === 'biodata'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Demographics & Medical
              </button>
              <button
                onClick={() => setProfileTab('guardians')}
                className={`pb-2.5 transition-colors ${
                  profileTab === 'guardians'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Linked Guardians ({selectedStudent.guardians.length})
              </button>
              <button
                onClick={() => setProfileTab('history')}
                className={`pb-2.5 transition-colors ${
                  profileTab === 'history'
                    ? 'border-b-2 border-emerald-600 text-emerald-700'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Non-Destructive Enrollment History ({selectedStudent.enrollmentHistory.length})
              </button>
            </div>

            {/* Tab 1: Biodata & Medical */}
            {profileTab === 'biodata' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Gender</p>
                    <p className="font-bold text-navy-950 mt-0.5">{selectedStudent.gender}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Date of Birth</p>
                    <p className="font-bold text-navy-950 mt-0.5">{selectedStudent.dateOfBirth}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Nationality</p>
                    <p className="font-bold text-navy-950 mt-0.5">{selectedStudent.nationality}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">State of Origin</p>
                    <p className="font-bold text-navy-950 mt-0.5">
                      {selectedStudent.stateOfOrigin || 'Not Specified'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">LGA</p>
                    <p className="font-bold text-navy-950 mt-0.5">{selectedStudent.lga || 'Not Specified'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Blood Group</p>
                    <p className="font-bold text-navy-950 mt-0.5">
                      {selectedStudent.bloodGroup || 'UNKNOWN'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Genotype</p>
                    <p className="font-bold text-navy-950 mt-0.5">
                      {selectedStudent.genotype || 'UNKNOWN'}
                    </p>
                  </div>
                  <div className="col-span-2 rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Allergies & Medical Flags</p>
                    <p className="font-bold text-navy-950 mt-0.5">
                      {selectedStudent.allergies || 'None Recorded'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Guardians */}
            {profileTab === 'guardians' && (
              <div className="space-y-3">
                {selectedStudent.guardians.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 text-sm">
                          {link.guardian.firstName} {link.guardian.lastName}
                        </span>
                        <Badge variant="neutral" className="font-bold text-[10px]">
                          {link.relationship}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        {link.isPrimaryContact && (
                          <Badge variant="approved">Primary Contact</Badge>
                        )}
                        {link.isBillingRecipient && (
                          <Badge variant="paid">Billing Recipient</Badge>
                        )}
                        {link.hasCustody && (
                          <Badge variant="neutral">Legal Custody</Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                      <p className="flex items-center gap-1.5 font-mono">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {link.guardian.phonePrimary}
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {link.guardian.email}
                      </p>
                      {link.guardian.occupation && (
                        <p className="text-[11px]">Occupation: {link.guardian.occupation}</p>
                      )}
                      {link.guardian.residentialAddress && (
                        <p className="text-[11px]">Address: {link.guardian.residentialAddress}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: History Timeline */}
            {profileTab === 'history' && (
              <div className="space-y-4">
                <p className="text-[11px] text-slate-500 italic">
                  Non-destructive audit trail of term enrollments and arm transfers.
                </p>
                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                  {selectedStudent.enrollmentHistory.map((rec, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div
                        className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          rec.enrollmentStatus === 'ACTIVE'
                            ? 'bg-emerald-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-950 text-xs">
                          {rec.classLevelName} — {rec.classArmName}
                        </span>
                        <Badge
                          variant={rec.enrollmentStatus === 'ACTIVE' ? 'approved' : 'draft'}
                          className="text-[10px]"
                        >
                          {rec.enrollmentStatus}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {rec.sessionName} • {rec.termName}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Assigned on: {new Date(rec.assignedAt).toLocaleString()}
                      </p>
                      {rec.transferReason && (
                        <p className="text-[11px] bg-amber-50 text-amber-800 p-2 rounded-md border border-amber-200 mt-1">
                          <strong>Transfer Justification:</strong> {rec.transferReason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenTransfer(selectedStudent)}
                leftIcon={<ArrowRightLeft className="h-3.5 w-3.5 text-emerald-600" />}
              >
                Transfer to Another Arm
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedStudent(null)}
              >
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Class Arm Modal */}
      {transferModalOpen && targetStudentForTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-navy-950">
                <ArrowRightLeft className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-base">Transfer Student Arm</h3>
              </div>
              <button
                onClick={() => setTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-bold text-navy-950">
                  {targetStudentForTransfer.firstName} {targetStudentForTransfer.lastName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Current Arm: {targetStudentForTransfer.currentClassLevelName}{' '}
                  <strong>{targetStudentForTransfer.currentClassArmName}</strong>
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Target Class Arm</label>
                <select
                  value={transferArmId}
                  onChange={(e) => setTransferArmId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Select Target Class Arm</option>
                  {academicConfig?.classLevels
                    .find((l) => l.id === targetStudentForTransfer.currentClassLevelId)
                    ?.arms.map((arm) => (
                      <option key={arm.id} value={arm.id}>
                        {arm.name} Arm ({arm.capacity} cap)
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  Transfer Justification (Mandatory Audit Trail)
                </label>
                <textarea
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="e.g. Parental transfer request, class size rebalancing, academic streaming..."
                  rows={3}
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTransferModalOpen(false)}
                disabled={transferring}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-navy-950 text-white hover:bg-navy-900"
                onClick={handleExecuteTransfer}
                disabled={transferring || !transferArmId || !transferReason.trim()}
              >
                {transferring ? 'Executing Transfer...' : 'Confirm Arm Transfer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
