import {
  AttendanceStatus,
  AttendanceRecord,
  ClassAttendanceSheet,
  ParentAbsenceAlertEvent,
  StudentAttendanceStats,
  TimetableSlot,
  TimetableClash,
  SchoolAttendanceMetrics,
  SubmitClassAttendanceInput,
  SubmitClassAttendanceSchema,
  SaveTimetableSchema,
} from './attendance-types';
import { AuthSession, can } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';
import { listStudents } from '../sis/sis-store';
import { getSchoolConfiguration } from '../academic/academic-store';

// ------------------------------------------------------------------------------
// Multi-Tenant Attendance & Timetable In-Memory Store
// ------------------------------------------------------------------------------

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

// schoolId -> ClassAttendanceSheet[]
const attendanceSheetsStore: Map<string, ClassAttendanceSheet[]> = new Map();

// schoolId -> (classArmId -> TimetableSlot[])
const timetablesStore: Map<string, Map<string, TimetableSlot[]>> = new Map();

// schoolId -> ParentAbsenceAlertEvent[]
const absenceAlertsStore: Map<string, ParentAbsenceAlertEvent[]> = new Map();

let isSeeded = false;

// ------------------------------------------------------------------------------
// Seed Initial Data
// ------------------------------------------------------------------------------

export function seedAttendanceAndTimetableData() {
  attendanceSheetsStore.clear();
  timetablesStore.clear();
  absenceAlertsStore.clear();

  attendanceSheetsStore.set(TENANT_A_ID, []);
  attendanceSheetsStore.set(TENANT_B_ID, []);

  timetablesStore.set(TENANT_A_ID, new Map());
  timetablesStore.set(TENANT_B_ID, new Map());

  absenceAlertsStore.set(TENANT_A_ID, []);
  absenceAlertsStore.set(TENANT_B_ID, []);

  // Seed Timetable for Tenant A: JSS 1 Gold (arm_9_1) & JSS 1 Diamond (arm_9_2)
  const jss1GoldSlots: TimetableSlot[] = [
    {
      id: 'slot_jss1g_mon_p1',
      classArmId: 'arm_9_1',
      classArmName: 'Gold',
      classLevelId: 'lvl_9',
      classLevelName: 'JSS 1',
      subjectId: 'sub_mth',
      subjectName: 'Mathematics',
      subjectCode: 'MTH',
      teacherId: 'usr_teacher_obi',
      teacherName: 'Mr. Emeka Obi',
      roomId: 'room_101',
      roomName: 'Classroom 101',
      dayOfWeek: 'MONDAY',
      periodNumber: 1,
      startTime: '08:15',
      endTime: '08:55',
      periodType: 'LESSON',
    },
    {
      id: 'slot_jss1g_mon_p2',
      classArmId: 'arm_9_1',
      classArmName: 'Gold',
      classLevelId: 'lvl_9',
      classLevelName: 'JSS 1',
      subjectId: 'sub_eng',
      subjectName: 'English Language',
      subjectCode: 'ENG',
      teacherId: 'usr_teacher_adeleke',
      teacherName: 'Mrs. Ngozi Adeleke',
      roomId: 'room_101',
      roomName: 'Classroom 101',
      dayOfWeek: 'MONDAY',
      periodNumber: 2,
      startTime: '08:55',
      endTime: '09:35',
      periodType: 'LESSON',
    },
    {
      id: 'slot_jss1g_mon_p3',
      classArmId: 'arm_9_1',
      classArmName: 'Gold',
      classLevelId: 'lvl_9',
      classLevelName: 'JSS 1',
      subjectId: 'sub_bsc',
      subjectName: 'Basic Science',
      subjectCode: 'BSC',
      teacherId: 'usr_teacher_bakare',
      teacherName: 'Mr. Tunde Bakare',
      roomId: 'lab_sci_1',
      roomName: 'Junior Science Lab',
      dayOfWeek: 'MONDAY',
      periodNumber: 3,
      startTime: '09:55',
      endTime: '10:35',
      periodType: 'LESSON',
    },
    {
      id: 'slot_jss1g_tue_p1',
      classArmId: 'arm_9_1',
      classArmName: 'Gold',
      classLevelId: 'lvl_9',
      classLevelName: 'JSS 1',
      subjectId: 'sub_eng',
      subjectName: 'English Language',
      subjectCode: 'ENG',
      teacherId: 'usr_teacher_adeleke',
      teacherName: 'Mrs. Ngozi Adeleke',
      roomId: 'room_101',
      roomName: 'Classroom 101',
      dayOfWeek: 'TUESDAY',
      periodNumber: 1,
      startTime: '08:15',
      endTime: '08:55',
      periodType: 'LESSON',
    },
    {
      id: 'slot_jss1g_tue_p2',
      classArmId: 'arm_9_1',
      classArmName: 'Gold',
      classLevelId: 'lvl_9',
      classLevelName: 'JSS 1',
      subjectId: 'sub_mth',
      subjectName: 'Mathematics',
      subjectCode: 'MTH',
      teacherId: 'usr_teacher_obi',
      teacherName: 'Mr. Emeka Obi',
      roomId: 'room_101',
      roomName: 'Classroom 101',
      dayOfWeek: 'TUESDAY',
      periodNumber: 2,
      startTime: '08:55',
      endTime: '09:35',
      periodType: 'LESSON',
    },
  ];

  timetablesStore.get(TENANT_A_ID)!.set('arm_9_1', jss1GoldSlots);

  // Seed yesterday's attendance sheet for JSS 1 Gold to provide baseline analytics
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const seedSheet: ClassAttendanceSheet = {
    id: `sheet_seed_${yesterdayStr}_arm_9_1`,
    schoolId: TENANT_A_ID,
    classArmId: 'arm_9_1',
    classArmName: 'Gold',
    classLevelId: 'lvl_9',
    classLevelName: 'JSS 1',
    date: yesterdayStr,
    periodType: 'DAILY_MORNING',
    totalEnrolled: 3,
    presentCount: 2,
    absentCount: 1,
    lateCount: 0,
    excusedCount: 0,
    attendanceRate: 66.7,
    isFinalized: true,
    submittedAt: `${yesterdayStr}T08:30:00Z`,
    submittedBy: 'Mr. Emeka Obi (Form Teacher)',
    records: [
      {
        id: `att_seed_1`,
        schoolId: TENANT_A_ID,
        studentId: 'stu_kcl_001',
        studentName: 'Chukwuma David Adeleke',
        admissionNumber: 'KCL/2026/001',
        gender: 'MALE',
        classArmId: 'arm_9_1',
        classArmName: 'Gold',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        date: yesterdayStr,
        periodType: 'DAILY_MORNING',
        status: 'PRESENT',
        arrivalTime: '07:45',
        isLate: false,
        recordedById: 'usr_teacher_obi',
        recordedByName: 'Mr. Emeka Obi',
        recordedAt: `${yesterdayStr}T08:10:00Z`,
        isOfflineSync: false,
      },
      {
        id: `att_seed_2`,
        schoolId: TENANT_A_ID,
        studentId: 'stu_kcl_002',
        studentName: 'Amina Fatima Bello',
        admissionNumber: 'KCL/2026/002',
        gender: 'FEMALE',
        classArmId: 'arm_9_1',
        classArmName: 'Gold',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        date: yesterdayStr,
        periodType: 'DAILY_MORNING',
        status: 'ABSENT',
        isLate: false,
        reason: 'ILLNESS',
        remarks: 'Reported fever by guardian.',
        recordedById: 'usr_teacher_obi',
        recordedByName: 'Mr. Emeka Obi',
        recordedAt: `${yesterdayStr}T08:10:00Z`,
        isOfflineSync: false,
      },
      {
        id: `att_seed_3`,
        schoolId: TENANT_A_ID,
        studentId: 'stu_kcl_003',
        studentName: 'Tunde Olumide Bakare',
        admissionNumber: 'KCL/2026/003',
        gender: 'MALE',
        classArmId: 'arm_9_1',
        classArmName: 'Gold',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        date: yesterdayStr,
        periodType: 'DAILY_MORNING',
        status: 'PRESENT',
        arrivalTime: '08:00',
        isLate: false,
        recordedById: 'usr_teacher_obi',
        recordedByName: 'Mr. Emeka Obi',
        recordedAt: `${yesterdayStr}T08:10:00Z`,
        isOfflineSync: false,
      },
    ],
  };

  attendanceSheetsStore.get(TENANT_A_ID)!.push(seedSheet);

  isSeeded = true;
}

// ------------------------------------------------------------------------------
// Core Engine: Record Class Attendance
// ------------------------------------------------------------------------------

export async function recordClassAttendance(
  schoolId: string,
  rawInput: unknown,
  actor: AuthSession
): Promise<{ sheet: ClassAttendanceSheet; alertsGenerated: ParentAbsenceAlertEvent[] }> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  // 1. RBAC Guard: Teacher with attendance.mark_assigned or Admin with attendance.record
  const canRecord =
    can(actor, 'attendance.record') || can(actor, 'attendance.mark_assigned');
  if (!canRecord) {
    throw new Error(
      `403 Forbidden: User role [${actor.userType}] lacks authorization to record classroom attendance.`
    );
  }

  // 2. Tenant Isolation
  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant attendance recording is prohibited.');
  }

  // 3. Validate Input
  const validated = SubmitClassAttendanceSchema.parse(rawInput);

  // 4. Resolve School Config for lateness cutoff and class level/arm names
  const config = getSchoolConfiguration(schoolId);
  const latenessCutoff = config.operationalRules?.latenessCutoff || '08:15';

  let classLevelName = 'JSS 1';
  let classLevelId = 'lvl_9';
  let classArmName = 'Gold';

  for (const lvl of config.classLevels) {
    const foundArm = lvl.arms.find(
      (a) => a.id === validated.classArmId || a.name.toLowerCase() === validated.classArmId.toLowerCase()
    );
    if (foundArm) {
      classLevelName = lvl.name;
      classLevelId = lvl.id;
      classArmName = foundArm.name;
      break;
    }
  }

  // 5. Fetch enrolled students for classArmId
  const allStudents = await listStudents(schoolId, {}, actor);
  const armStudents = allStudents.filter(
    (s) =>
      s.currentClassArmId === validated.classArmId ||
      s.currentClassArmName.toLowerCase() === classArmName.toLowerCase() ||
      s.currentClassArmName.toLowerCase() === validated.classArmId.toLowerCase()
  );

  if (armStudents.length > 0) {
    classLevelName = armStudents[0].currentClassLevelName;
    classLevelId = armStudents[0].currentClassLevelId;
    classArmName = armStudents[0].currentClassArmName;
  }

  const sheets = attendanceSheetsStore.get(schoolId) || [];
  const existingSheetIndex = sheets.findIndex(
    (s) => s.classArmId === validated.classArmId && s.date === validated.date && s.periodType === validated.periodType
  );

  const timestamp = new Date().toISOString();
  const records: AttendanceRecord[] = [];
  const newAlerts: ParentAbsenceAlertEvent[] = [];

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  for (const entry of validated.records) {
    const student = allStudents.find((s) => s.id === entry.studentId);
    if (!student) continue;

    // Check lateness against school bell schedule
    let isLate = entry.status === 'LATE';
    if (entry.arrivalTime && entry.arrivalTime > latenessCutoff && entry.status === 'PRESENT') {
      isLate = true;
    }

    if (entry.status === 'PRESENT') presentCount++;
    else if (entry.status === 'ABSENT') absentCount++;
    else if (entry.status === 'LATE') {
      lateCount++;
      isLate = true;
    } else if (entry.status === 'EXCUSED') excusedCount++;

    const fullName = student.middleName
      ? `${student.firstName} ${student.middleName} ${student.lastName}`
      : `${student.firstName} ${student.lastName}`;

    const record: AttendanceRecord = {
      id: `att_${student.id}_${validated.date}`,
      schoolId,
      studentId: student.id,
      studentName: fullName,
      admissionNumber: student.admissionNumber,
      gender: student.gender,
      classArmId: validated.classArmId,
      classArmName,
      classLevelId,
      classLevelName,
      date: validated.date,
      periodType: validated.periodType,
      status: entry.status,
      arrivalTime: entry.arrivalTime,
      isLate,
      reason: entry.reason,
      remarks: entry.remarks,
      recordedById: actor.userId,
      recordedByName: `${actor.firstName} ${actor.lastName}`,
      recordedAt: timestamp,
      clientTimestamp: validated.clientTimestamp,
      isOfflineSync: validated.isOfflineSync,
    };

    records.push(record);

    // If student is ABSENT, automatically generate parent alert notification event
    if (entry.status === 'ABSENT') {
      const primaryGuardianLink = student.guardians.find((g) => g.isPrimaryContact) || student.guardians[0];
      const guardian = primaryGuardianLink?.guardian;

      const alertEvent: ParentAbsenceAlertEvent = {
        id: `alert_abs_${student.id}_${validated.date}`,
        schoolId,
        studentId: student.id,
        studentName: fullName,
        admissionNumber: student.admissionNumber,
        guardianName: guardian ? `${guardian.firstName} ${guardian.lastName}` : 'Guardian',
        guardianPhone: guardian?.phonePrimary || '+234 800 000 0000',
        guardianEmail: guardian?.email || 'guardian@example.com',
        date: validated.date,
        reason: entry.reason,
        channel: 'SMS',
        message: `SchoolOS Notice: Your ward ${fullName} (${student.admissionNumber}) was marked ABSENT from ${config.school.name} on ${validated.date}. Reason: ${entry.reason || 'Unexplained'}. Please contact the school office.`,
        queuedAt: timestamp,
        status: 'QUEUED',
      };

      newAlerts.push(alertEvent);
    }
  }

  const totalEnrolled = records.length;
  const attendanceRate = totalEnrolled > 0
    ? Number((((presentCount + lateCount) / totalEnrolled) * 100).toFixed(1))
    : 0;

  const sheet: ClassAttendanceSheet = {
    id: `sheet_${validated.classArmId}_${validated.date}_${validated.periodType}`,
    schoolId,
    classArmId: validated.classArmId,
    classArmName,
    classLevelId,
    classLevelName,
    date: validated.date,
    periodType: validated.periodType,
    totalEnrolled,
    presentCount,
    absentCount,
    lateCount,
    excusedCount,
    attendanceRate,
    records,
    isFinalized: true,
    submittedAt: timestamp,
    submittedBy: `${actor.firstName} ${actor.lastName} (${actor.userType})`,
  };

  if (existingSheetIndex >= 0) {
    sheets[existingSheetIndex] = sheet;
  } else {
    sheets.push(sheet);
  }
  attendanceSheetsStore.set(schoolId, sheets);

  // Store new alerts
  const schoolAlerts = absenceAlertsStore.get(schoolId) || [];
  schoolAlerts.push(...newAlerts);
  absenceAlertsStore.set(schoolId, schoolAlerts);

  // Audit log
  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    actorIp: '127.0.0.1',
    action: validated.isOfflineSync ? 'OFFLINE_ATTENDANCE_SYNCED' : 'ATTENDANCE_RECORDED',
    resourceType: 'ClassAttendanceSheet',
    resourceId: sheet.id,
    beforeState: existingSheetIndex >= 0 ? { updated: true } : null,
    afterState: {
      classArmId: sheet.classArmId,
      date: sheet.date,
      presentCount,
      absentCount,
      attendanceRate,
      alertsCount: newAlerts.length,
    },
  });

  return { sheet, alertsGenerated: newAlerts };
}

// ------------------------------------------------------------------------------
// Fetch Attendance Sheet (or Pre-populate Fresh Sheet)
// ------------------------------------------------------------------------------

export async function getClassAttendanceSheet(
  schoolId: string,
  classArmId: string,
  date: string,
  actor: AuthSession
): Promise<ClassAttendanceSheet> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant attendance retrieval is prohibited.');
  }

  const sheets = attendanceSheetsStore.get(schoolId) || [];
  const existing = sheets.find(
    (s) => s.classArmId === classArmId && s.date === date
  );

  if (existing) {
    return existing;
  }

  const config = getSchoolConfiguration(schoolId);
  let classLevelName = 'JSS 1';
  let classLevelId = 'lvl_9';
  let classArmName = 'Gold';

  for (const lvl of config.classLevels) {
    const foundArm = lvl.arms.find(
      (a) => a.id === classArmId || a.name.toLowerCase() === classArmId.toLowerCase()
    );
    if (foundArm) {
      classLevelName = lvl.name;
      classLevelId = lvl.id;
      classArmName = foundArm.name;
      break;
    }
  }

  // Pre-populate draft sheet from enrolled students
  const allStudents = await listStudents(schoolId, {}, actor);
  const armStudents = allStudents.filter(
    (s) =>
      s.currentClassArmId === classArmId ||
      s.currentClassArmName.toLowerCase() === classArmName.toLowerCase() ||
      s.currentClassArmName.toLowerCase() === classArmId.toLowerCase()
  );

  if (armStudents.length > 0) {
    classLevelName = armStudents[0].currentClassLevelName;
    classLevelId = armStudents[0].currentClassLevelId;
    classArmName = armStudents[0].currentClassArmName;
  }

  const defaultRecords: AttendanceRecord[] = armStudents.map((s) => ({
    id: `att_draft_${s.id}_${date}`,
    schoolId,
    studentId: s.id,
    studentName: `${s.firstName} ${s.lastName}`,
    admissionNumber: s.admissionNumber,
    gender: s.gender,
    classArmId,
    classArmName,
    classLevelId,
    classLevelName,
    date,
    periodType: 'DAILY_MORNING',
    status: 'PRESENT', // default to present for rapid < 60 second marking!
    isLate: false,
    recordedById: actor.userId,
    recordedByName: `${actor.firstName} ${actor.lastName}`,
    recordedAt: new Date().toISOString(),
    isOfflineSync: false,
  }));

  return {
    id: `sheet_draft_${classArmId}_${date}`,
    schoolId,
    classArmId,
    classArmName,
    classLevelId,
    classLevelName,
    date,
    periodType: 'DAILY_MORNING',
    totalEnrolled: defaultRecords.length,
    presentCount: defaultRecords.length,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    attendanceRate: 100,
    records: defaultRecords,
    isFinalized: false,
    submittedAt: '',
    submittedBy: '',
  };
}

// ------------------------------------------------------------------------------
// Student Attendance Summary & Chronic Absenteeism Flagging
// ------------------------------------------------------------------------------

export async function getStudentAttendanceSummary(
  schoolId: string,
  studentId: string,
  actor: AuthSession
): Promise<StudentAttendanceStats> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant attendance statistics query prohibited.');
  }

  const sheets = attendanceSheetsStore.get(schoolId) || [];
  let studentName = 'Student';
  let admissionNumber = 'N/A';

  let totalDays = 0;
  let presentDays = 0;
  let absentDays = 0;
  let lateDays = 0;
  let excusedDays = 0;

  // Sort sheets by date ascending
  const sortedSheets = [...sheets].sort((a, b) => a.date.localeCompare(b.date));
  const studentRecords: AttendanceRecord[] = [];

  for (const sheet of sortedSheets) {
    const record = sheet.records.find((r) => r.studentId === studentId);
    if (record) {
      studentRecords.push(record);
      studentName = record.studentName;
      admissionNumber = record.admissionNumber;
      totalDays++;
      if (record.status === 'PRESENT') presentDays++;
      else if (record.status === 'ABSENT') absentDays++;
      else if (record.status === 'LATE') lateDays++;
      else if (record.status === 'EXCUSED') excusedDays++;
    }
  }

  // Calculate consecutive absences from most recent records backwards
  let consecutiveAbsences = 0;
  for (let i = studentRecords.length - 1; i >= 0; i--) {
    if (studentRecords[i].status === 'ABSENT') {
      consecutiveAbsences++;
    } else {
      break;
    }
  }

  const attendanceRate = totalDays > 0
    ? Number((((presentDays + lateDays) / totalDays) * 100).toFixed(1))
    : 100;

  // Flag as chronic if >= 3 consecutive absences or attendance rate below 80%
  const isFlaggedChronic = consecutiveAbsences >= 3 || (totalDays >= 5 && attendanceRate < 80);

  return {
    studentId,
    studentName,
    admissionNumber,
    totalDays,
    presentDays,
    absentDays,
    lateDays,
    excusedDays,
    attendanceRate,
    consecutiveAbsences,
    isFlaggedChronic,
  };
}

// ------------------------------------------------------------------------------
// School-wide Attendance Dashboard Metrics
// ------------------------------------------------------------------------------

export async function getSchoolAttendanceMetrics(
  schoolId: string,
  date: string,
  actor: AuthSession
): Promise<SchoolAttendanceMetrics> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant attendance metrics query prohibited.');
  }

  const sheets = attendanceSheetsStore.get(schoolId) || [];
  const dateSheets = sheets.filter((s) => s.date === date);

  let totalEnrolled = 0;
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalExcused = 0;

  const bySection = {
    earlyYears: 0,
    primary: 0,
    juniorSecondary: 0,
    seniorSecondary: 0,
  };

  for (const sheet of dateSheets) {
    totalEnrolled += sheet.totalEnrolled;
    totalPresent += sheet.presentCount;
    totalAbsent += sheet.absentCount;
    totalLate += sheet.lateCount;
    totalExcused += sheet.excusedCount;

    const levelLower = sheet.classLevelName.toLowerCase();
    if (levelLower.includes('creche') || levelLower.includes('nursery') || levelLower.includes('reception')) {
      bySection.earlyYears += sheet.presentCount + sheet.lateCount;
    } else if (levelLower.includes('primary') || levelLower.includes('basic')) {
      bySection.primary += sheet.presentCount + sheet.lateCount;
    } else if (levelLower.includes('jss') || levelLower.includes('junior')) {
      bySection.juniorSecondary += sheet.presentCount + sheet.lateCount;
    } else {
      bySection.seniorSecondary += sheet.presentCount + sheet.lateCount;
    }
  }

  const overallAttendanceRate = totalEnrolled > 0
    ? Number((((totalPresent + totalLate) / totalEnrolled) * 100).toFixed(1))
    : 0;

  const alerts = absenceAlertsStore.get(schoolId) || [];
  const pendingAlertsCount = alerts.filter((a) => a.date === date).length;

  return {
    date,
    totalEnrolled,
    overallAttendanceRate,
    totalPresent,
    totalAbsent,
    totalLate,
    totalExcused,
    bySection,
    chronicAbsentCount: totalAbsent > 1 ? 1 : 0,
    pendingAlertsCount,
  };
}

// ------------------------------------------------------------------------------
// Timetable Clash Detection Engine
// ------------------------------------------------------------------------------

export function detectTimetableClashes(
  schoolId: string,
  proposedSlots: TimetableSlot[],
  existingSchoolSlots: TimetableSlot[] = []
): TimetableClash[] {
  const clashes: TimetableClash[] = [];
  const allSlots = [...existingSchoolSlots, ...proposedSlots];

  // 1. Teacher Double-Booking Check
  // Same teacher cannot be in two different rooms/class-arms at the same (Day, Period)
  const teacherDayPeriodMap = new Map<string, TimetableSlot[]>();

  for (const slot of allSlots) {
    if (slot.periodType === 'BREAK' || slot.periodType === 'ASSEMBLY' || slot.periodType === 'LUNCH') {
      continue;
    }
    const key = `${slot.teacherId}_${slot.dayOfWeek}_${slot.periodNumber}`;
    const list = teacherDayPeriodMap.get(key) || [];
    list.push(slot);
    teacherDayPeriodMap.set(key, list);
  }

  for (const [, slotsGroup] of teacherDayPeriodMap.entries()) {
    if (slotsGroup.length > 1) {
      // Check if they are for different class arms
      const armIds = new Set(slotsGroup.map((s) => s.classArmId));
      if (armIds.size > 1) {
        clashes.push({
          id: `clash_tch_${slotsGroup[0].id}_${slotsGroup[1].id}`,
          clashType: 'TEACHER_DOUBLE_BOOKED',
          description: `Teacher [${slotsGroup[0].teacherName}] is simultaneously scheduled for ${slotsGroup[0].classLevelName} ${slotsGroup[0].classArmName} (${slotsGroup[0].subjectName}) and ${slotsGroup[1].classLevelName} ${slotsGroup[1].classArmName} (${slotsGroup[1].subjectName}) during Period ${slotsGroup[0].periodNumber} on ${slotsGroup[0].dayOfWeek}.`,
          conflictingSlotIds: slotsGroup.map((s) => s.id),
          dayOfWeek: slotsGroup[0].dayOfWeek,
          periodNumber: slotsGroup[0].periodNumber,
          affectedEntity: slotsGroup[0].teacherName,
          suggestedResolution: `Reassign Period ${slotsGroup[0].periodNumber} for ${slotsGroup[1].classArmName} to another subject or open period.`,
        });
      }
    }
  }

  // 2. Room Double-Booking Check
  // Same physical classroom/lab cannot host two different classes simultaneously
  const roomDayPeriodMap = new Map<string, TimetableSlot[]>();

  for (const slot of allSlots) {
    if (slot.periodType === 'BREAK' || slot.periodType === 'ASSEMBLY' || slot.periodType === 'LUNCH') {
      continue;
    }
    const key = `${slot.roomId}_${slot.dayOfWeek}_${slot.periodNumber}`;
    const list = roomDayPeriodMap.get(key) || [];
    list.push(slot);
    roomDayPeriodMap.set(key, list);
  }

  for (const [, slotsGroup] of roomDayPeriodMap.entries()) {
    if (slotsGroup.length > 1) {
      const armIds = new Set(slotsGroup.map((s) => s.classArmId));
      if (armIds.size > 1) {
        clashes.push({
          id: `clash_room_${slotsGroup[0].id}_${slotsGroup[1].id}`,
          clashType: 'ROOM_DOUBLE_BOOKED',
          description: `Room [${slotsGroup[0].roomName}] is double-booked by ${slotsGroup[0].classLevelName} ${slotsGroup[0].classArmName} and ${slotsGroup[1].classLevelName} ${slotsGroup[1].classArmName} on ${slotsGroup[0].dayOfWeek} Period ${slotsGroup[0].periodNumber}.`,
          conflictingSlotIds: slotsGroup.map((s) => s.id),
          dayOfWeek: slotsGroup[0].dayOfWeek,
          periodNumber: slotsGroup[0].periodNumber,
          affectedEntity: slotsGroup[0].roomName,
          suggestedResolution: `Assign an alternative vacant classroom or adjust period timing.`,
        });
      }
    }
  }

  // 3. Class Arm Overlapping Check
  // Same class arm cannot have two distinct lessons in the same period
  const armDayPeriodMap = new Map<string, TimetableSlot[]>();
  for (const slot of proposedSlots) {
    if (slot.periodType === 'BREAK' || slot.periodType === 'ASSEMBLY' || slot.periodType === 'LUNCH') {
      continue;
    }
    const key = `${slot.classArmId}_${slot.dayOfWeek}_${slot.periodNumber}`;
    const list = armDayPeriodMap.get(key) || [];
    list.push(slot);
    armDayPeriodMap.set(key, list);
  }

  for (const [, slotsGroup] of armDayPeriodMap.entries()) {
    if (slotsGroup.length > 1) {
      clashes.push({
        id: `clash_arm_${slotsGroup[0].id}_${slotsGroup[1].id}`,
        clashType: 'CLASS_ARM_OVERLAPPING',
        description: `Class arm [${slotsGroup[0].classArmName}] has multiple subjects (${slotsGroup[0].subjectName} and ${slotsGroup[1].subjectName}) assigned to the same period slot (${slotsGroup[0].dayOfWeek} Period ${slotsGroup[0].periodNumber}).`,
        conflictingSlotIds: slotsGroup.map((s) => s.id),
        dayOfWeek: slotsGroup[0].dayOfWeek,
        periodNumber: slotsGroup[0].periodNumber,
        affectedEntity: slotsGroup[0].classArmName,
        suggestedResolution: `Remove duplicate subject slot for Period ${slotsGroup[0].periodNumber}.`,
      });
    }
  }

  return clashes;
}

// ------------------------------------------------------------------------------
// Save & Retrieve Timetables
// ------------------------------------------------------------------------------

export async function saveClassTimetable(
  schoolId: string,
  rawInput: unknown,
  actor: AuthSession
): Promise<{ savedSlots: TimetableSlot[]; clashes: TimetableClash[] }> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (!can(actor, 'timetable.manage') && !can(actor, 'timetable.publish')) {
    throw new Error('403 Forbidden: User lacks permission to manage school timetables.');
  }

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant timetable mutation prohibited.');
  }

  const validated = SaveTimetableSchema.parse(rawInput);

  // Gather other class arms' existing slots for cross-class clash detection
  const schoolArmSlotsMap = timetablesStore.get(schoolId) || new Map<string, TimetableSlot[]>();
  const otherArmsSlots: TimetableSlot[] = [];

  for (const [armId, slots] of schoolArmSlotsMap.entries()) {
    if (armId !== validated.classArmId) {
      otherArmsSlots.push(...slots);
    }
  }

  const clashes = detectTimetableClashes(schoolId, validated.slots, otherArmsSlots);

  // Reject save if fatal class-arm overlapping clash exists
  const fatalArmClash = clashes.find((c) => c.clashType === 'CLASS_ARM_OVERLAPPING');
  if (fatalArmClash) {
    throw new Error(`Timetable Clash Error: ${fatalArmClash.description}`);
  }

  schoolArmSlotsMap.set(validated.classArmId, validated.slots);
  timetablesStore.set(schoolId, schoolArmSlotsMap);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    actorIp: '127.0.0.1',
    action: 'TIMETABLE_SAVED',
    resourceType: 'ClassTimetable',
    resourceId: validated.classArmId,
    afterState: {
      classArmId: validated.classArmId,
      slotsCount: validated.slots.length,
      clashesCount: clashes.length,
    },
  });

  return { savedSlots: validated.slots, clashes };
}

export async function getClassTimetable(
  schoolId: string,
  classArmId: string,
  actor: AuthSession
): Promise<{ slots: TimetableSlot[]; clashes: TimetableClash[] }> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant timetable query prohibited.');
  }

  const schoolArmSlotsMap = timetablesStore.get(schoolId) || new Map<string, TimetableSlot[]>();
  const slots = schoolArmSlotsMap.get(classArmId) || [];

  // Check clashes against other arms in school
  const otherArmsSlots: TimetableSlot[] = [];
  for (const [armId, armSlots] of schoolArmSlotsMap.entries()) {
    if (armId !== classArmId) {
      otherArmsSlots.push(...armSlots);
    }
  }

  const clashes = detectTimetableClashes(schoolId, slots, otherArmsSlots);
  return { slots, clashes };
}

export async function getTeacherTimetable(
  schoolId: string,
  teacherId: string,
  actor: AuthSession
): Promise<TimetableSlot[]> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant teacher timetable query prohibited.');
  }

  const schoolArmSlotsMap = timetablesStore.get(schoolId) || new Map<string, TimetableSlot[]>();
  const teacherSlots: TimetableSlot[] = [];

  for (const [, slots] of schoolArmSlotsMap.entries()) {
    for (const slot of slots) {
      if (slot.teacherId === teacherId) {
        teacherSlots.push(slot);
      }
    }
  }

  return teacherSlots.sort((a, b) => {
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const dayDiff = dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
    if (dayDiff !== 0) return dayDiff;
    return a.periodNumber - b.periodNumber;
  });
}

// ------------------------------------------------------------------------------
// Parent Absence Alert Queue Inspector
// ------------------------------------------------------------------------------

export async function listParentAbsenceAlerts(
  schoolId: string,
  actor: AuthSession
): Promise<ParentAbsenceAlertEvent[]> {
  if (!isSeeded) seedAttendanceAndTimetableData();

  if (actor.schoolId && actor.schoolId !== schoolId) {
    throw new Error('403 Forbidden: Cross-tenant alerts query prohibited.');
  }

  return absenceAlertsStore.get(schoolId) || [];
}

// ------------------------------------------------------------------------------
// Test Environment Store Reset
// ------------------------------------------------------------------------------

export function resetAttendanceStore() {
  seedAttendanceAndTimetableData();
}
