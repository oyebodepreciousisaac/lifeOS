import { z } from 'zod';

/**
 * SchoolOS Attendance & Timetable Types
 * Grounded in Playbook Chapters 7, 13, 21 and docs/PRODUCT-REQUIREMENTS.md
 */

// ------------------------------------------------------------------------------
// Enums & Domain Constants
// ------------------------------------------------------------------------------

export const ATTENDANCE_STATUS_VALUES = [
  'PRESENT',
  'ABSENT',
  'LATE',
  'EXCUSED',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS_VALUES)[number];

export const ATTENDANCE_PERIOD_TYPE_VALUES = [
  'DAILY_MORNING',
  'DAILY_AFTERNOON',
  'SUBJECT_PERIOD',
] as const;
export type AttendancePeriodType =
  (typeof ATTENDANCE_PERIOD_TYPE_VALUES)[number];

export const ABSENCE_REASON_VALUES = [
  'ILLNESS',
  'FAMILY_EMERGENCY',
  'FEES_EXCLUSION',
  'OFFICIAL_DUTY',
  'UNEXPLAINED',
] as const;
export type AbsenceReason = (typeof ABSENCE_REASON_VALUES)[number];

export const DAY_OF_WEEK_VALUES = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;
export type DayOfWeek = (typeof DAY_OF_WEEK_VALUES)[number];

export const PERIOD_SLOT_TYPE_VALUES = [
  'ASSEMBLY',
  'LESSON',
  'BREAK',
  'LUNCH',
  'SPORTS',
  'STUDY_HALL',
] as const;
export type PeriodSlotType = (typeof PERIOD_SLOT_TYPE_VALUES)[number];

export const CLASH_TYPE_VALUES = [
  'TEACHER_DOUBLE_BOOKED',
  'ROOM_DOUBLE_BOOKED',
  'CLASS_ARM_OVERLAPPING',
  'MAX_HOURS_EXCEEDED',
] as const;
export type ClashType = (typeof CLASH_TYPE_VALUES)[number];

// ------------------------------------------------------------------------------
// Zod Validation Schemas
// ------------------------------------------------------------------------------

export const DailyAttendanceEntrySchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(ATTENDANCE_STATUS_VALUES),
  arrivalTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Arrival time must be HH:mm')
    .optional(),
  reason: z.enum(ABSENCE_REASON_VALUES).optional(),
  remarks: z.string().optional(),
});

export type DailyAttendanceEntry = z.infer<typeof DailyAttendanceEntrySchema>;

export const SubmitClassAttendanceSchema = z.object({
  classArmId: z.string().min(1, 'Class arm ID is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  periodType: z.enum(ATTENDANCE_PERIOD_TYPE_VALUES).default('DAILY_MORNING'),
  records: z
    .array(DailyAttendanceEntrySchema)
    .min(1, 'At least one student attendance record must be provided'),
  isOfflineSync: z.boolean().default(false),
  clientTimestamp: z.string().optional(),
});

export type SubmitClassAttendanceInput = z.infer<
  typeof SubmitClassAttendanceSchema
>;

export const TimetableSlotSchema = z.object({
  id: z.string().min(1),
  classArmId: z.string().min(1),
  classArmName: z.string().min(1),
  classLevelId: z.string().min(1),
  classLevelName: z.string().min(1),
  subjectId: z.string().min(1),
  subjectName: z.string().min(1),
  subjectCode: z.string().min(1),
  teacherId: z.string().min(1),
  teacherName: z.string().min(1),
  roomId: z.string().min(1),
  roomName: z.string().min(1),
  dayOfWeek: z.enum(DAY_OF_WEEK_VALUES),
  periodNumber: z.number().int().min(1).max(10),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:mm'),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be HH:mm'),
  periodType: z.enum(PERIOD_SLOT_TYPE_VALUES).default('LESSON'),
});

export type TimetableSlot = z.infer<typeof TimetableSlotSchema>;

export const SaveTimetableSchema = z.object({
  classArmId: z.string().min(1, 'Class arm ID is required'),
  slots: z.array(TimetableSlotSchema),
});

export type SaveTimetableInput = z.infer<typeof SaveTimetableSchema>;

// ------------------------------------------------------------------------------
// Domain Interfaces
// ------------------------------------------------------------------------------

export interface AttendanceRecord {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  gender: 'MALE' | 'FEMALE';
  classArmId: string;
  classArmName: string;
  classLevelId: string;
  classLevelName: string;
  date: string; // YYYY-MM-DD
  periodType: AttendancePeriodType;
  status: AttendanceStatus;
  arrivalTime?: string; // HH:mm
  isLate: boolean;
  reason?: AbsenceReason;
  remarks?: string;
  recordedById: string;
  recordedByName: string;
  recordedAt: string;
  clientTimestamp?: string;
  isOfflineSync: boolean;
}

export interface ClassAttendanceSheet {
  id: string;
  schoolId: string;
  classArmId: string;
  classArmName: string;
  classLevelId: string;
  classLevelName: string;
  date: string; // YYYY-MM-DD
  periodType: AttendancePeriodType;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number; // percentage, e.g. 96.5
  records: AttendanceRecord[];
  isFinalized: boolean;
  submittedAt: string;
  submittedBy: string;
}

export interface ParentAbsenceAlertEvent {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  admissionNumber: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  date: string;
  reason?: string;
  channel: 'SMS' | 'EMAIL' | 'WHATSAPP';
  message: string;
  queuedAt: string;
  status: 'QUEUED' | 'SENT' | 'DELIVERED';
}

export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  attendanceRate: number;
  consecutiveAbsences: number;
  isFlaggedChronic: boolean; // >= 3 consecutive or < 80% termly rate
}

export interface TimetableClash {
  id: string;
  clashType: ClashType;
  description: string;
  conflictingSlotIds: string[];
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  affectedEntity: string;
  suggestedResolution: string;
}

export interface SchoolAttendanceMetrics {
  date: string;
  totalEnrolled: number;
  overallAttendanceRate: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  bySection: {
    earlyYears: number;
    primary: number;
    juniorSecondary: number;
    seniorSecondary: number;
  };
  chronicAbsentCount: number;
  pendingAlertsCount: number;
}
