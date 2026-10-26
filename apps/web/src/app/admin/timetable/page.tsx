'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Input,
  Alert,
} from '@school-os/ui';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  MapPin,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Layers,
  X,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';
import {
  getClassTimetableAction,
  saveClassTimetableAction,
  getTeacherTimetableAction,
} from '../../actions/attendance';
import { getAcademicConfigAction } from '../../actions/academic-setup';
import {
  TimetableSlot,
  TimetableClash,
  DayOfWeek,
  PeriodSlotType,
} from '../../../lib/attendance/attendance-types';
import { AcademicConfiguration } from '../../../lib/academic/academic-types';

const DAYS_OF_WEEK: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const PERIOD_SCHEDULE = [
  { period: 1, start: '08:15', end: '08:55', label: 'Period 1' },
  { period: 2, start: '08:55', end: '09:35', label: 'Period 2' },
  { period: 3, start: '09:55', end: '10:35', label: 'Period 3' },
  { period: 4, start: '10:35', end: '11:15', label: 'Period 4' },
  { period: 5, start: '12:00', end: '12:40', label: 'Period 5' },
  { period: 6, start: '12:40', end: '13:20', label: 'Period 6' },
  { period: 7, start: '13:20', end: '14:00', label: 'Period 7' },
  { period: 8, start: '14:00', end: '14:40', label: 'Period 8' },
];

export default function TimetableManagementPage() {
  const [academicConfig, setAcademicConfig] = React.useState<AcademicConfiguration | null>(null);
  const [selectedArmId, setSelectedArmId] = React.useState<string>('arm_9_1');
  const [slots, setSlots] = React.useState<TimetableSlot[]>([]);
  const [clashes, setClashes] = React.useState<TimetableClash[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [saving, setSaving] = React.useState<boolean>(false);

  // Slot editor modal state
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [editingSlotId, setEditingSlotId] = React.useState<string | null>(null);
  const [slotDay, setSlotDay] = React.useState<DayOfWeek>('MONDAY');
  const [slotPeriod, setSlotPeriod] = React.useState<number>(1);
  const [slotSubjectId, setSlotSubjectId] = React.useState<string>('sub_mth');
  const [slotTeacherId, setSlotTeacherId] = React.useState<string>('usr_teacher_obi');
  const [slotRoomId, setSlotRoomId] = React.useState<string>('room_101');
  const [slotRoomName, setSlotRoomName] = React.useState<string>('Classroom 101');
  const [slotPeriodType, setSlotPeriodType] = React.useState<PeriodSlotType>('LESSON');

  const [notification, setNotification] = React.useState<{
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Load School Configuration
  const loadConfig = React.useCallback(async () => {
    try {
      const res = await getAcademicConfigAction();
      if (res.success && res.data) {
        setAcademicConfig(res.data);
      }
    } catch {
      // Graceful error
    }
  }, []);

  // Load Timetable Slots and Clashes for Selected Arm
  const loadTimetable = React.useCallback(async () => {
    if (!selectedArmId) return;
    setLoading(true);
    try {
      const res = await getClassTimetableAction(selectedArmId);
      if (res.success && res.data) {
        setSlots(res.data.slots);
        setClashes(res.data.clashes);
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to load class timetable.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while loading timetable.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedArmId]);

  React.useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  React.useEffect(() => {
    loadTimetable();
  }, [loadTimetable]);

  // Open Modal for adding a new slot at a specific day/period
  const handleAddSlotAt = (day: DayOfWeek, period: number) => {
    setEditingSlotId(null);
    setSlotDay(day);
    setSlotPeriod(period);
    setSlotSubjectId(academicConfig?.subjects[0]?.id || 'sub_mth');
    setSlotTeacherId('usr_teacher_obi');
    setSlotRoomId('room_101');
    setSlotRoomName('Classroom 101');
    setSlotPeriodType('LESSON');
    setModalOpen(true);
  };

  // Open Modal for editing an existing slot
  const handleEditSlot = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setSlotDay(slot.dayOfWeek);
    setSlotPeriod(slot.periodNumber);
    setSlotSubjectId(slot.subjectId);
    setSlotTeacherId(slot.teacherId);
    setSlotRoomId(slot.roomId);
    setSlotRoomName(slot.roomName);
    setSlotPeriodType(slot.periodType);
    setModalOpen(true);
  };

  // Delete a slot locally
  const handleDeleteSlot = (slotId: string) => {
    const updated = slots.filter((s) => s.id !== slotId);
    setSlots(updated);
    setNotification({
      type: 'info',
      message: 'Slot removed from active grid. Click "Save Schedule" to commit changes.',
    });
  };

  // Save Modal Slot
  const handleSaveModalSlot = () => {
    const periodTime = PERIOD_SCHEDULE.find((p) => p.period === slotPeriod) || PERIOD_SCHEDULE[0];
    const subject = academicConfig?.subjects.find((s) => s.id === slotSubjectId) || {
      name: 'Mathematics',
      code: 'MTH',
    };

    const teacherName =
      slotTeacherId === 'usr_teacher_obi'
        ? 'Mr. Emeka Obi'
        : slotTeacherId === 'usr_teacher_adeleke'
        ? 'Mrs. Ngozi Adeleke'
        : 'Mr. Tunde Bakare';

    const newSlot: TimetableSlot = {
      id: editingSlotId || `slot_${selectedArmId}_${slotDay.toLowerCase()}_p${slotPeriod}_${Date.now()}`,
      classArmId: selectedArmId,
      classArmName: 'Gold',
      classLevelId: 'lvl_9',
      classLevelName: 'JSS 1',
      subjectId: slotSubjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
      teacherId: slotTeacherId,
      teacherName,
      roomId: slotRoomId,
      roomName: slotRoomName,
      dayOfWeek: slotDay,
      periodNumber: slotPeriod,
      startTime: periodTime.start,
      endTime: periodTime.end,
      periodType: slotPeriodType,
    };

    let updatedSlots = [...slots];
    if (editingSlotId) {
      updatedSlots = updatedSlots.map((s) => (s.id === editingSlotId ? newSlot : s));
    } else {
      // Remove any slot already at this day & period to prevent arm collision
      updatedSlots = updatedSlots.filter(
        (s) => !(s.dayOfWeek === slotDay && s.periodNumber === slotPeriod)
      );
      updatedSlots.push(newSlot);
    }

    setSlots(updatedSlots);
    setModalOpen(false);
    setNotification({
      type: 'info',
      message: `Assigned ${subject.name} to ${slotDay} Period ${slotPeriod}. Click "Save Schedule" to check for clashes.`,
    });
  };

  // Save Whole Timetable to Server & Re-run Clash Detection
  const handleSaveTimetable = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const res = await saveClassTimetableAction(selectedArmId, slots);
      if (res.success && res.data) {
        setSlots(res.data.savedSlots);
        setClashes(res.data.clashes);
        if (res.data.clashes.length > 0) {
          setNotification({
            type: 'warning',
            message: `Timetable saved with ${res.data.clashes.length} collision warnings! Please resolve highlighted conflicts.`,
          });
        } else {
          setNotification({
            type: 'success',
            message: 'Timetable published successfully! Zero teacher or room collisions detected.',
          });
        }
      } else {
        setNotification({
          type: 'error',
          message: res.error || 'Failed to save timetable.',
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'An error occurred while saving timetable.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Check if a specific slot has a detected clash
  const getSlotClashes = (slot: TimetableSlot) => {
    return clashes.filter(
      (c) =>
        c.conflictingSlotIds.includes(slot.id) ||
        (c.dayOfWeek === slot.dayOfWeek && c.periodNumber === slot.periodNumber)
    );
  };

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/attendance"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Attendance Register
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Master Schedule & Clash Prevention
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Institutional Timetable &amp; Clash Detection
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Multi-dimensional collision engine enforcing zero teacher double-booking, room overlap, and class arm scheduling conflicts.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTimetable}
            disabled={loading}
            className="h-9 gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTimetable}
            disabled={saving || loading}
            className="h-9 gap-1.5 bg-primary font-semibold shadow-xs"
          >
            <Save className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Validating...' : 'Save Schedule'}</span>
          </Button>
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

      {/* Live Clash Detection Banner */}
      {clashes.length > 0 && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>Multi-Dimensional Collision Detected ({clashes.length} Active Clashes)</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300/90 leading-relaxed">
            The timetable engine detected simultaneous resource bookings across school class arms. Conflicting slots are outlined in red below.
          </p>
          <ul className="text-xs font-mono space-y-1 mt-2 text-rose-900 dark:text-rose-200">
            {clashes.map((c, idx) => (
              <li key={idx} className="bg-rose-500/10 px-2.5 py-1 rounded-md border border-rose-500/20">
                • [{c.clashType}] {c.description} (Resolution: {c.suggestedResolution})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Controls Bar: Class Arm Selection */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-56">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Select Class Arm
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
                {(!academicConfig || academicConfig.classLevels.length === 0) && (
                  <>
                    <option value="arm_9_1">JSS 1 — Gold</option>
                    <option value="arm_9_2">JSS 1 — Diamond</option>
                    <option value="arm_10_1">JSS 2 — Gold</option>
                  </>
                )}
              </select>
            </div>

            <div className="pt-5 flex items-center gap-2">
              <Badge variant={clashes.length > 0 ? 'debt' : 'paid'} className="h-7 px-3">
                {clashes.length > 0 ? `${clashes.length} Clashes` : '0 Clashes Detected'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Total Assigned Slots: <strong className="text-foreground">{slots.length}</strong>
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAddSlotAt('MONDAY', 1)}
            className="h-9 gap-1.5"
          >
            <Plus className="h-4 w-4 text-primary" />
            <span>Add Period Slot</span>
          </Button>
        </CardContent>
      </Card>

      {/* Timetable Grid View */}
      <Card className="shadow-xs border-border/80 overflow-hidden">
        <CardHeader className="py-4 px-6 border-b border-border/60 bg-muted/20 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Weekly Master Timetable Grid</span>
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary" />
              Lesson
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/20 border border-rose-500" />
              Clash Alert
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="p-3 text-center font-bold text-muted-foreground w-28 border-r border-border/60">
                    Period / Time
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th key={day} className="p-3 font-bold text-foreground text-center border-r border-border/60 last:border-r-0">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {PERIOD_SCHEDULE.map((period) => (
                  <tr key={period.period} className="hover:bg-muted/10 transition-colors">
                    {/* Time Column */}
                    <td className="p-3 text-center bg-muted/30 border-r border-border/60">
                      <div className="font-bold text-xs text-foreground">{period.label}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {period.start} - {period.end}
                      </div>
                    </td>

                    {/* Day Cells */}
                    {DAYS_OF_WEEK.map((day) => {
                      const slot = slots.find(
                        (s) => s.dayOfWeek === day && s.periodNumber === period.period
                      );
                      const slotClashes = slot ? getSlotClashes(slot) : [];
                      const hasClash = slotClashes.length > 0;

                      return (
                        <td
                          key={day}
                          className={`p-2.5 border-r border-border/60 last:border-r-0 align-top h-24 ${
                            hasClash ? 'bg-rose-500/10' : ''
                          }`}
                        >
                          {slot ? (
                            <div
                              className={`group relative p-2.5 rounded-lg border transition-all h-full flex flex-col justify-between shadow-2xs ${
                                hasClash
                                  ? 'border-rose-500 bg-rose-500/5 text-rose-950 dark:text-rose-100'
                                  : 'border-border bg-card hover:border-primary/50 hover:shadow-xs'
                              }`}
                            >
                              <div>
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <Badge
                                    variant={hasClash ? 'debt' : 'neutral'}
                                    showIcon={false}
                                    className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold"
                                  >
                                    {slot.subjectCode}
                                  </Badge>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEditSlot(slot)}
                                      className="p-1 hover:text-primary rounded-xs"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlot(slot.id)}
                                      className="p-1 hover:text-rose-600 rounded-xs"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="font-bold text-xs text-foreground truncate">
                                  {slot.subjectName}
                                </div>

                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1 truncate">
                                  <User className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{slot.teacherName}</span>
                                </div>
                              </div>

                              <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1.5 pt-1 border-t border-border/40 font-mono">
                                <MapPin className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">{slot.roomName}</span>
                              </div>

                              {hasClash && (
                                <div className="mt-1 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3 shrink-0" />
                                  <span>Clash detected!</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddSlotAt(day, period.period)}
                              className="w-full h-full min-h-[70px] rounded-lg border border-dashed border-border/80 hover:border-primary hover:bg-primary/5 text-muted-foreground/60 hover:text-primary transition-all flex flex-col items-center justify-center gap-1 text-[11px]"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-medium">Assign</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Period Slot Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base text-foreground">
                  {editingSlotId ? 'Edit Timetable Slot' : 'Assign Period Slot'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Day of Week
                  </label>
                  <select
                    value={slotDay}
                    onChange={(e) => setSlotDay(e.target.value as DayOfWeek)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs font-medium"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Period Number
                  </label>
                  <select
                    value={slotPeriod}
                    onChange={(e) => setSlotPeriod(Number(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs font-medium"
                  >
                    {PERIOD_SCHEDULE.map((p) => (
                      <option key={p.period} value={p.period}>
                        {p.label} ({p.start} - {p.end})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Academic Subject
                </label>
                <select
                  value={slotSubjectId}
                  onChange={(e) => setSlotSubjectId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs font-medium"
                >
                  {academicConfig?.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                  {(!academicConfig || academicConfig.subjects.length === 0) && (
                    <>
                      <option value="sub_mth">Mathematics (MTH)</option>
                      <option value="sub_eng">English Language (ENG)</option>
                      <option value="sub_bsc">Basic Science (BSC)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Assigned Teacher
                </label>
                <select
                  value={slotTeacherId}
                  onChange={(e) => setSlotTeacherId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs font-medium"
                >
                  <option value="usr_teacher_obi">Mr. Emeka Obi (Mathematics / Sciences)</option>
                  <option value="usr_teacher_adeleke">Mrs. Ngozi Adeleke (English / Humanities)</option>
                  <option value="usr_teacher_bakare">Mr. Tunde Bakare (Vocational / ICT)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Room / Lab Venue
                  </label>
                  <Input
                    type="text"
                    value={slotRoomName}
                    onChange={(e) => {
                      setSlotRoomName(e.target.value);
                      setSlotRoomId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                    }}
                    placeholder="e.g. Room 101"
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Period Type
                  </label>
                  <select
                    value={slotPeriodType}
                    onChange={(e) => setSlotPeriodType(e.target.value as PeriodSlotType)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs font-medium"
                  >
                    <option value="LESSON">Lesson / Lecture</option>
                    <option value="ASSEMBLY">General Assembly</option>
                    <option value="SPORTS">Sports &amp; P.E.</option>
                    <option value="STUDY_HALL">Study Hall / Prep</option>
                    <option value="BREAK">Short Break</option>
                    <option value="LUNCH">Long Break / Lunch</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveModalSlot} className="bg-primary">
                Confirm Slot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
