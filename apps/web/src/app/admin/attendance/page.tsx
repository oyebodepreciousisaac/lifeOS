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
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Bell,
  ArrowLeft,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserX,
  FileSpreadsheet,
  AlertCircle,
  X,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import {
  getClassAttendanceSheetAction,
  recordClassAttendanceAction,
  getSchoolAttendanceMetricsAction,
  getStudentAttendanceSummaryAction,
  listParentAbsenceAlertsAction,
} from '../../actions/attendance';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import {
  AttendanceStatus,
  AttendanceRecord,
  ClassAttendanceSheet,
  ParentAbsenceAlertEvent,
  StudentAttendanceStats,
  SchoolAttendanceMetrics,
  SubmitClassAttendanceInput,
} from '../../../lib/attendance/attendance-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';
import {
  isOfflineSimulationEnabled,
  setOfflineSimulationEnabled,
  getPendingOfflineQueue,
  enqueueOfflineAttendance,
  removeOfflineItem,
  clearOfflineQueue,
} from '../../../lib/attendance/offline-queue';

export default function InstitutionalAttendancePage() {
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [selectedArmId, setSelectedArmId] = React.useState<string>('arm_9_1');
  const [selectedDate, setSelectedDate] = React.useState<string>('2026-10-17');
  const [selectedPeriodType, setSelectedPeriodType] = React.useState<'DAILY_MORNING' | 'DAILY_AFTERNOON'>('DAILY_MORNING');
  
  const [sheet, setSheet] = React.useState<ClassAttendanceSheet | null>(null);
  const [metrics, setMetrics] = React.useState<SchoolAttendanceMetrics | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  
  // Offline sync state
  const [offlineSimActive, setOfflineSimActive] = React.useState<boolean>(false);
  const [pendingQueueCount, setPendingQueueCount] = React.useState<number>(0);
  const [syncingOffline, setSyncingOffline] = React.useState<boolean>(false);

  // Modals & Drawers
  const [alertsModalOpen, setAlertsModalOpen] = React.useState<boolean>(false);
  const [recentAlerts, setRecentAlerts] = React.useState<ParentAbsenceAlertEvent[]>([]);
  const [statsModalOpen, setStatsModalOpen] = React.useState<boolean>(false);
  const [activeStudentStats, setActiveStudentStats] = React.useState<StudentAttendanceStats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState<boolean>(false);

  const [notification, setNotification] = React.useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // High-Speed Marking Local State: map studentId -> entry
  const [attendanceEntries, setAttendanceEntries] = React.useState<
    Map<
      string,
      {
        status: AttendanceStatus;
        arrivalTime?: string;
        reason?: string;
        remarks?: string;
      }
    >
  >(new Map());

  // Initialize offline simulation status
  React.useEffect(() => {
    setOfflineSimActive(isOfflineSimulationEnabled());
    setPendingQueueCount(getPendingOfflineQueue().length);
  }, []);

  // Load school configuration and class arms
  const loadConfig = React.useCallback(async () => {
    try {
      const res = await getAcademicConfigAction();
      if (res.success && res.data) {
        setAcademicConfig(res.data);
        // Find default arm if needed
        if (res.data.classLevels?.length > 0 && res.data.classLevels[0].arms?.length > 0) {
          // Keep arm_9_1 or fallback to first arm
          const hasGold = res.data.classLevels.some((l) => l.arms.some((a) => a.id === 'arm_9_1'));
          if (!hasGold) {
            setSelectedArmId(res.data.classLevels[0].arms[0].id);
          }
        }
      }
    } catch {
      // Handled gracefully
    }
  }, []);

  // Load class attendance sheet and school metrics
  const loadSheetData = React.useCallback(async () => {
    if (!selectedArmId) return;
    setLoading(true);
    try {
      const [sheetRes, metricsRes] = await Promise.all([
        getClassAttendanceSheetAction(selectedArmId, selectedDate),
        getSchoolAttendanceMetricsAction(selectedDate),
      ]);

      if (sheetRes.success && sheetRes.data) {
        setSheet(sheetRes.data);
        // Initialize entries map from records
        const entries = new Map<string, {
          status: AttendanceStatus;
          arrivalTime?: string;
          reason?: string;
          remarks?: string;
        }>();
        sheetRes.data.records.forEach((r) => {
          entries.set(r.studentId, {
            status: r.status,
            arrivalTime: r.arrivalTime || (r.status === 'PRESENT' ? '07:45' : undefined),
            reason: r.reason,
            remarks: r.remarks,
          });
        });
        setAttendanceEntries(entries);
      }

      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load class attendance data.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedArmId, selectedDate]);

  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  React.useEffect(() => {
    loadSheetData();
  }, [loadSheetData]);

  // High-Speed Action: Mark All Present (< 60s benchmark)
  const handleMarkAllPresent = () => {
    if (!sheet) return;
    const updated = new Map(attendanceEntries);
    sheet.records.forEach((r) => {
      updated.set(r.studentId, {
        status: 'PRESENT',
        arrivalTime: '07:45',
        reason: undefined,
        remarks: undefined,
      });
    });
    setAttendanceEntries(updated);
    setNotification({
      type: 'info',
      message: `Marked all ${sheet.records.length} students as PRESENT (Arrival: 07:45). Remember to finalize.`,
    });
  };

  // Update single student status
  const updateStudentEntry = (
    studentId: string,
    updates: Partial<{
      status: AttendanceStatus;
      arrivalTime: string;
      reason: string;
      remarks: string;
    }>
  ) => {
    setAttendanceEntries((prev) => {
      const next = new Map(prev);
      const current = next.get(studentId) || { status: 'PRESENT' };
      const merged = { ...current, ...updates };

      // Set default arrival times if switching to present or late
      if (updates.status === 'PRESENT' && !merged.arrivalTime) {
        merged.arrivalTime = '07:45';
      } else if (updates.status === 'LATE' && (!merged.arrivalTime || merged.arrivalTime <= '08:15')) {
        merged.arrivalTime = '08:25';
      } else if (updates.status === 'ABSENT' || updates.status === 'EXCUSED') {
        merged.arrivalTime = undefined;
      }

      next.set(studentId, merged);
      return next;
    });
  };

  // Submit and Finalize Attendance Sheet
  const handleSaveAttendance = async () => {
    if (!sheet) return;
    setSaving(true);
    setNotification(null);

    const recordsPayload = sheet.records.map((r) => {
      const entry = attendanceEntries.get(r.studentId) || { status: 'PRESENT' };
      return {
        studentId: r.studentId,
        status: entry.status,
        arrivalTime: entry.arrivalTime,
        reason: entry.reason as any,
        remarks: entry.remarks,
      };
    });

    const payload: SubmitClassAttendanceInput = {
      classArmId: selectedArmId,
      date: selectedDate,
      periodType: selectedPeriodType,
      records: recordsPayload,
      isOfflineSync: offlineSimActive,
      clientTimestamp: new Date().toISOString(),
    };

    if (offlineSimActive) {
      // Offline mode active: enqueue to local storage
      enqueueOfflineAttendance(payload);
      setPendingQueueCount(getPendingOfflineQueue().length);
      setSaving(false);
      setNotification({
        type: 'warning',
        message: 'Campus Network Offline: Attendance record enqueued locally. Will automatically sync when reconnected.',
      });
      return;
    }

    try {
      const res = await recordClassAttendanceAction(payload);
      if (res.success && res.data) {
        setSheet(res.data.sheet);
        setNotification({
          type: 'success',
          message: `Attendance finalized! ${res.data.sheet.presentCount} Present, ${res.data.sheet.lateCount} Late, ${res.data.sheet.absentCount} Absent (${res.data.alertsGenerated.length} parent alerts queued).`,
        });
        // Reload metrics
        const metricsRes = await getSchoolAttendanceMetricsAction(selectedDate);
        if (metricsRes.success && metricsRes.data) {
          setMetrics(metricsRes.data);
        }
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to finalize attendance sheet.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An unexpected error occurred while saving.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Flush and Sync Pending Offline Queue
  const handleFlushOfflineQueue = async () => {
    const queue = getPendingOfflineQueue();
    if (queue.length === 0) return;

    setSyncingOffline(true);
    let synced = 0;
    try {
      for (const item of queue) {
        const res = await recordClassAttendanceAction(item.payload);
        if (res.success) {
          removeOfflineItem(item.id);
          synced++;
        }
      }
      setPendingQueueCount(getPendingOfflineQueue().length);
      setNotification({
        type: 'success',
        message: `Offline synchronization completed! Successfully posted ${synced} attendance sheets.`,
      });
      loadSheetData();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Offline sync failed: ${err.message}`,
      });
    } finally {
      setSyncingOffline(false);
    }
  };

  // Open Parent Absence Alert Log
  const handleOpenAlerts = async () => {
    try {
      const res = await listParentAbsenceAlertsAction();
      if (res.success && res.data) {
        setRecentAlerts(res.data);
      }
      setAlertsModalOpen(true);
    } catch {
      setAlertsModalOpen(true);
    }
  };

  // Open Individual Student Attendance Stats Modal
  const handleViewStudentStats = async (studentId: string) => {
    setLoadingStats(true);
    setStatsModalOpen(true);
    try {
      const res = await getStudentAttendanceSummaryAction(studentId);
      if (res.success && res.data) {
        setActiveStudentStats(res.data);
      }
    } catch {
      // Handled
    } finally {
      setLoadingStats(false);
    }
  };

  // Compute live roll call summary from active entries
  const liveSummary = React.useMemo(() => {
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;
    const total = sheet?.records.length || 0;

    attendanceEntries.forEach((val) => {
      if (val.status === 'PRESENT') present++;
      else if (val.status === 'LATE') late++;
      else if (val.status === 'ABSENT') absent++;
      else if (val.status === 'EXCUSED') excused++;
    });

    const rate = total > 0 ? Number((((present + late) / total) * 100).toFixed(1)) : 0;
    return { total, present, late, absent, excused, rate };
  }, [attendanceEntries, sheet]);

  // Filter students by search term
  const filteredRecords = React.useMemo(() => {
    if (!sheet) return [];
    if (!searchQuery.trim()) return sheet.records;
    const q = searchQuery.toLowerCase().trim();
    return sheet.records.filter(
      (r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.admissionNumber.toLowerCase().includes(q)
    );
  }, [sheet, searchQuery]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Executive Dashboard
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Daily Attendance Register
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Institutional Attendance & Absence Pipeline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sub-60s classroom register entry, automated parent SMS absence alerts, lateness threshold detection, and offline resilient queue.
          </p>
        </div>

        {/* Global Action Badges & Toggles */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Parent Alerts Drawer Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenAlerts}
            className="flex items-center gap-2 shadow-xs border-primary/20 hover:border-primary/50"
          >
            <Bell className="h-4 w-4 text-primary" />
            <span>Parent Alerts</span>
            {recentAlerts.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {recentAlerts.length}
              </span>
            )}
          </Button>

          {/* Timetable Link */}
          <Link href="/admin/timetable">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Timetable Grid</span>
            </Button>
          </Link>

          {/* PWA Offline Mode Sync Toggle */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <button
              onClick={() => {
                const nextState = !offlineSimActive;
                setOfflineSimActive(nextState);
                setOfflineSimulationEnabled(nextState);
                setNotification({
                  type: 'info',
                  message: nextState
                    ? 'PWA Offline Cache Active: Register entries are queued locally in browser storage for low-bandwidth resilience.'
                    : 'Cloud Sync Restored: Direct live server synchronization active.',
                });
              }}
              className="flex items-center gap-1.5 font-medium hover:text-navy-950 transition-colors"
            >
              {offlineSimActive ? (
                <>
                  <WifiOff className="h-4 w-4 text-amber-500 animate-pulse" />
                  <span className="text-amber-700 font-semibold">Offline Cache Active</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-emerald-500" />
                  <span className="text-slate-600 font-medium">Cloud Synced</span>
                </>
              )}
            </button>

            {pendingQueueCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleFlushOfflineQueue}
                disabled={syncingOffline}
                className="h-6 text-[10px] px-2 bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1 ml-1"
              >
                <RefreshCw className={`h-3 w-3 ${syncingOffline ? 'animate-spin' : ''}`} />
                <span>Sync ({pendingQueueCount})</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <Alert
          type={notification.type}
          onClose={() => setNotification(null)}
          title={notification.type === 'error' ? 'Notice' : undefined}
        >
          {notification.message}
        </Alert>
      )}

      {/* Primary KPI & Roll Call Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Overall Attendance Rate */}
        <Card className="col-span-2 md:col-span-1 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Attendance Rate</span>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </CardDescription>
            <CardTitle className="text-3xl font-black text-foreground">
              {liveSummary.rate}%
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <div className="w-full bg-muted rounded-full h-2 mt-1 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  liveSummary.rate >= 80 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, liveSummary.rate)}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {liveSummary.present + liveSummary.late} of {liveSummary.total} Students Active
            </p>
          </CardContent>
        </Card>

        {/* Present Count */}
        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-emerald-700 flex items-center justify-between">
              <span>Present</span>
              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-800">
              {liveSummary.present}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <p className="text-[11px] text-emerald-600">On time before 08:15</p>
          </CardContent>
        </Card>

        {/* Late Count */}
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center justify-between">
              <span>Late</span>
              <Clock className="h-3.5 w-3.5 text-amber-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-800">
              {liveSummary.late}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <p className="text-[11px] text-amber-600">Cutoff: 08:15 bell</p>
          </CardContent>
        </Card>

        {/* Absent Count */}
        <Card className="border-rose-500/20 bg-rose-500/5 shadow-xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-rose-700 flex items-center justify-between">
              <span>Absent</span>
              <UserX className="h-3.5 w-3.5 text-rose-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-rose-800">
              {liveSummary.absent}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <p className="text-[11px] text-rose-600">Auto-notifies guardian</p>
          </CardContent>
        </Card>

        {/* Excused Count */}
        <Card className="border-blue-500/20 bg-blue-500/5 shadow-xs">
          <CardHeader className="pb-1 pt-4 px-4">
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center justify-between">
              <span>Excused</span>
              <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-blue-800">
              {liveSummary.excused}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-1">
            <p className="text-[11px] text-blue-600">Medical or school exeat</p>
          </CardContent>
        </Card>
      </div>

      {/* Register Controls & High-Speed Entry Bar */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Roster Selectors */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Class Arm Selector */}
              <div className="w-48">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Class Arm
                </label>
                <select
                  value={selectedArmId}
                  onChange={(e) => setSelectedArmId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  {academicConfig?.classLevels.flatMap((lvl) =>
                    lvl.arms.map((arm) => (
                      <option key={arm.id} value={arm.id}>
                        {lvl.name} — {arm.name}
                      </option>
                    ))
                  )}
                  {/* Fallback default options */}
                  {(!academicConfig || academicConfig.classLevels.length === 0) && (
                    <>
                      <option value="arm_9_1">JSS 1 — Gold</option>
                      <option value="arm_9_2">JSS 1 — Diamond</option>
                      <option value="arm_10_1">JSS 2 — Gold</option>
                    </>
                  )}
                </select>
              </div>

              {/* Date Selector */}
              <div className="w-40">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Attendance Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Period Type */}
              <div className="w-44">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Session Type
                </label>
                <select
                  value={selectedPeriodType}
                  onChange={(e) => setSelectedPeriodType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-medium"
                >
                  <option value="DAILY_MORNING">Morning Assembly / Roll Call</option>
                  <option value="DAILY_AFTERNOON">Afternoon Roll Call</option>
                </select>
              </div>

              <div className="pt-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSheetData}
                  disabled={loading}
                  className="h-9 px-3 gap-1.5"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Reload</span>
                </Button>
              </div>
            </div>

            {/* Sub-60s Rapid Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllPresent}
                className="h-9 gap-1.5 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30"
              >
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold">Mark All Present (&lt; 60s)</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAttendance}
                disabled={saving || loading}
                className="h-9 gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
              >
                <CheckCircle2 className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Finalizing...' : 'Finalize Register'}</span>
              </Button>
            </div>
          </div>

          {/* Table Search & Filter Bar */}
          <div className="flex items-center gap-3 pt-2 border-t border-border/60">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search student name or admission no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-xs"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-bold text-foreground">{filteredRecords.length}</span> students in {sheet?.classLevelName} {sheet?.classArmName}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classroom Attendance Register Table */}
      <Card className="shadow-xs border-border/80">
        <CardHeader className="py-4 px-6 border-b border-border/60 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              <span>Official Classroom Register — {sheet?.classLevelName} {sheet?.classArmName}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Bell Cutoff: <span className="font-semibold text-foreground">08:15 AM</span>. Arrival after 08:15 automatically flags lateness.
            </CardDescription>
          </div>
          {sheet?.isFinalized && (
            <Badge variant="approved">Finalized for {sheet.date}</Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Student Name &amp; Reg No</TableHead>
                  <TableHead className="w-72">Roll Call Status (1-Click)</TableHead>
                  <TableHead className="w-32">Arrival Time</TableHead>
                  <TableHead className="w-48">Absence / Late Reason</TableHead>
                  <TableHead>Teacher Remarks</TableHead>
                  <TableHead className="w-24 text-center">History</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                      Loading class register roster...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No student records found matching filter criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((record, index) => {
                    const currentEntry = attendanceEntries.get(record.studentId) || {
                      status: record.status,
                      arrivalTime: record.arrivalTime,
                      reason: record.reason,
                      remarks: record.remarks,
                    };

                    const isAbsent = currentEntry.status === 'ABSENT';
                    const isLate = currentEntry.status === 'LATE' || (currentEntry.arrivalTime && currentEntry.arrivalTime > '08:15' && currentEntry.status === 'PRESENT');

                    return (
                      <TableRow
                        key={record.studentId}
                        className={`transition-colors hover:bg-muted/30 ${
                          isAbsent ? 'bg-rose-500/5' : isLate ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        {/* Row Index */}
                        <TableCell className="text-center text-xs font-mono text-muted-foreground">
                          {index + 1}
                        </TableCell>

                        {/* Student Details */}
                        <TableCell>
                          <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                            <span>{record.studentName}</span>
                            {isAbsent && (
                              <Badge variant="debt" showIcon={false} className="text-[10px] px-1.5 py-0 h-4">
                                SMS Queued
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span className="font-mono">{record.admissionNumber}</span>
                            <span>•</span>
                            <span className="uppercase text-[10px] tracking-wider">{record.gender}</span>
                          </div>
                        </TableCell>

                        {/* Roll Call Segmented Button (Sub-60s Marking) */}
                        <TableCell>
                          <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs shadow-xs">
                            {/* PRESENT */}
                            <button
                              type="button"
                              onClick={() => updateStudentEntry(record.studentId, { status: 'PRESENT' })}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                currentEntry.status === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Present
                            </button>

                            {/* LATE */}
                            <button
                              type="button"
                              onClick={() => updateStudentEntry(record.studentId, { status: 'LATE' })}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                currentEntry.status === 'LATE'
                                  ? 'bg-amber-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Late
                            </button>

                            {/* ABSENT */}
                            <button
                              type="button"
                              onClick={() => updateStudentEntry(record.studentId, { status: 'ABSENT' })}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                currentEntry.status === 'ABSENT'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Absent
                            </button>

                            {/* EXCUSED */}
                            <button
                              type="button"
                              onClick={() => updateStudentEntry(record.studentId, { status: 'EXCUSED' })}
                              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                                currentEntry.status === 'EXCUSED'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              Excused
                            </button>
                          </div>
                        </TableCell>

                        {/* Arrival Time */}
                        <TableCell>
                          {currentEntry.status === 'ABSENT' ? (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          ) : (
                            <Input
                              type="time"
                              value={currentEntry.arrivalTime || ''}
                              onChange={(e) =>
                                updateStudentEntry(record.studentId, { arrivalTime: e.target.value })
                              }
                              className={`h-8 text-xs font-mono w-28 ${
                                currentEntry.arrivalTime && currentEntry.arrivalTime > '08:15'
                                  ? 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20'
                                  : ''
                              }`}
                            />
                          )}
                        </TableCell>

                        {/* Absence / Late Reason */}
                        <TableCell>
                          {currentEntry.status === 'PRESENT' ? (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          ) : (
                            <select
                              value={currentEntry.reason || ''}
                              onChange={(e) =>
                                updateStudentEntry(record.studentId, { reason: e.target.value })
                              }
                              className="h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="">Select Reason...</option>
                              <option value="ILLNESS">Illness / Malaria / Medical</option>
                              <option value="TRANSPORT">Traffic / School Bus Delay</option>
                              <option value="FAMILY_EMERGENCY">Family Emergency</option>
                              <option value="FEES_FINANCIAL">School Fee / Financial</option>
                              <option value="TRUANCY">Unsanctioned Truancy</option>
                              <option value="UNEXPLAINED">Unexplained</option>
                              <option value="OTHER">Other Reason</option>
                            </select>
                          )}
                        </TableCell>

                        {/* Remarks */}
                        <TableCell>
                          <Input
                            type="text"
                            placeholder="Optional notes or guardian comment..."
                            value={currentEntry.remarks || ''}
                            onChange={(e) =>
                              updateStudentEntry(record.studentId, { remarks: e.target.value })
                            }
                            className="h-8 text-xs"
                          />
                        </TableCell>

                        {/* History & Risk Profile */}
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStudentStats(record.studentId)}
                            className="h-7 px-2 text-[11px]"
                          >
                            Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Parent Absence Notifications Drawer / Modal */}
      {alertsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  Parent Absence SMS Notification Log
                </h3>
              </div>
              <button
                onClick={() => setAlertsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              <div className="text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/20">
                SchoolOS automatically dispatches SMS notifications to primary guardians when a student is recorded ABSENT. All events are cryptographically recorded in the audit log.
              </div>

              {recentAlerts.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No parent absence alerts currently dispatched today.
                </div>
              ) : (
                recentAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3.5 rounded-lg border border-border bg-card/60 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="font-bold text-foreground flex items-center gap-2">
                        <span>{alert.studentName}</span>
                        <span className="font-mono text-muted-foreground text-[11px]">
                          ({alert.admissionNumber})
                        </span>
                      </div>
                      <Badge variant="pending">{alert.status}</Badge>
                    </div>

                    <p className="text-xs font-mono bg-muted/50 p-2.5 rounded-md border border-border/80 text-foreground">
                      "{alert.message}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                      <span>Recipient: <strong className="text-foreground">{alert.guardianName}</strong> ({alert.guardianPhone})</span>
                      <span>Channel: <strong className="text-foreground">{alert.channel}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setAlertsModalOpen(false)}>
                Close Log
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Attendance Stats Modal */}
      {statsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  Student Longitudinal Attendance Record
                </h3>
              </div>
              <button
                onClick={() => setStatsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {loadingStats || !activeStudentStats ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                  Calculating longitudinal metrics...
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="font-bold text-lg text-foreground">
                        {activeStudentStats.studentName}
                      </h4>
                      <p className="text-xs text-muted-foreground font-mono">
                        {activeStudentStats.admissionNumber}
                      </p>
                    </div>

                    {activeStudentStats.isFlaggedChronic ? (
                      <Badge variant="debt" className="gap-1 px-2.5 py-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        <span>Chronic Absentee</span>
                      </Badge>
                    ) : (
                      <Badge variant="paid" className="gap-1 px-2.5 py-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Satisfactory</span>
                      </Badge>
                    )}
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Attendance Rate</div>
                      <div className={`text-2xl font-black mt-1 ${
                        activeStudentStats.attendanceRate >= 80 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {activeStudentStats.attendanceRate}%
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Consecutive Absences</div>
                      <div className="text-2xl font-black text-foreground mt-1">
                        {activeStudentStats.consecutiveAbsences} Days
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Total Present</div>
                      <div className="text-lg font-bold text-emerald-600 mt-1">
                        {activeStudentStats.presentDays} Sessions
                      </div>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg border border-border/60">
                      <div className="text-xs text-muted-foreground uppercase font-semibold">Total Lateness</div>
                      <div className="text-lg font-bold text-amber-600 mt-1">
                        {activeStudentStats.lateDays} Sessions
                      </div>
                    </div>
                  </div>

                  {activeStudentStats.isFlaggedChronic && (
                    <Alert type="error" title="Action Required: Chronic Absenteeism Flag">
                      This student has exceeded the institutional cutoff with {activeStudentStats.consecutiveAbsences} consecutive absences or an attendance rate below 80%. A formal inquiry and guardian conference is mandated.
                    </Alert>
                  )}
                </>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setStatsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
