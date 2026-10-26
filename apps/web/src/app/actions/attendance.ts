'use server';

import { getSession } from '../../lib/auth/session';
import {
  recordClassAttendance,
  getClassAttendanceSheet,
  getStudentAttendanceSummary,
  getSchoolAttendanceMetrics,
  getClassTimetable,
  saveClassTimetable,
  getTeacherTimetable,
  listParentAbsenceAlerts,
} from '../../lib/attendance/attendance-store';
import {
  ClassAttendanceSheet,
  ParentAbsenceAlertEvent,
  StudentAttendanceStats,
  TimetableSlot,
  TimetableClash,
  SchoolAttendanceMetrics,
} from '../../lib/attendance/attendance-types';

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getAuthenticatedActor() {
  const session = await getSession();
  if (!session) {
    throw new Error('401 Unauthorized: Please log in to perform this operation.');
  }
  return session;
}

// ------------------------------------------------------------------------------
// Attendance Server Actions
// ------------------------------------------------------------------------------

export async function recordClassAttendanceAction(
  data: unknown
): Promise<
  ActionResponse<{
    sheet: ClassAttendanceSheet;
    alertsGenerated: ParentAbsenceAlertEvent[];
  }>
> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await recordClassAttendance(actor.schoolId, data, actor);
    return { success: true, data: result };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Attendance validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to record attendance.' };
  }
}

export async function getClassAttendanceSheetAction(
  classArmId: string,
  date: string
): Promise<ActionResponse<ClassAttendanceSheet>> {
  try {
    const actor = await getAuthenticatedActor();
    const sheet = await getClassAttendanceSheet(actor.schoolId, classArmId, date, actor);
    return { success: true, data: sheet };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load class attendance sheet.' };
  }
}

export async function getStudentAttendanceSummaryAction(
  studentId: string
): Promise<ActionResponse<StudentAttendanceStats>> {
  try {
    const actor = await getAuthenticatedActor();
    const stats = await getStudentAttendanceSummary(actor.schoolId, studentId, actor);
    return { success: true, data: stats };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to calculate student attendance.' };
  }
}

export async function getSchoolAttendanceMetricsAction(
  date: string
): Promise<ActionResponse<SchoolAttendanceMetrics>> {
  try {
    const actor = await getAuthenticatedActor();
    const metrics = await getSchoolAttendanceMetrics(actor.schoolId, date, actor);
    return { success: true, data: metrics };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to calculate school attendance metrics.' };
  }
}

// ------------------------------------------------------------------------------
// Timetable Server Actions
// ------------------------------------------------------------------------------

export async function getClassTimetableAction(
  classArmId: string
): Promise<ActionResponse<{ slots: TimetableSlot[]; clashes: TimetableClash[] }>> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await getClassTimetable(actor.schoolId, classArmId, actor);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load class timetable.' };
  }
}

export async function saveClassTimetableAction(
  classArmId: string,
  slots: unknown
): Promise<ActionResponse<{ savedSlots: TimetableSlot[]; clashes: TimetableClash[] }>> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await saveClassTimetable(
      actor.schoolId,
      { classArmId, slots },
      actor
    );
    return { success: true, data: result };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Timetable validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to save timetable.' };
  }
}

export async function getTeacherTimetableAction(
  teacherId?: string
): Promise<ActionResponse<TimetableSlot[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const targetId = teacherId || actor.userId;
    const slots = await getTeacherTimetable(actor.schoolId, targetId, actor);
    return { success: true, data: slots };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load teacher schedule.' };
  }
}

export async function listParentAbsenceAlertsAction(): Promise<
  ActionResponse<ParentAbsenceAlertEvent[]>
> {
  try {
    const actor = await getAuthenticatedActor();
    const alerts = await listParentAbsenceAlerts(actor.schoolId, actor);
    return { success: true, data: alerts };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load absence alerts.' };
  }
}
