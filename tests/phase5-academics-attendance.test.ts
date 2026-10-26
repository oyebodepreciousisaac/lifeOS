import test from 'node:test';
import assert from 'node:assert/strict';
import {
  recordClassAttendance,
  getClassAttendanceSheet,
  getStudentAttendanceSummary,
  getSchoolAttendanceMetrics,
  saveClassTimetable,
  getClassTimetable,
  detectTimetableClashes,
  resetAttendanceStore,
  listParentAbsenceAlerts,
} from '../apps/web/src/lib/attendance/attendance-store';
import {
  enqueueOfflineAttendance,
  getPendingOfflineQueue,
  clearOfflineQueue,
  flushOfflineQueue,
} from '../apps/web/src/lib/attendance/offline-queue';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';
import { getAuditLogsForSchool } from '../apps/web/src/lib/audit/logger';
import { TimetableSlot } from '../apps/web/src/lib/attendance/attendance-types';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

const mockTeacherA: AuthSession = {
  userId: 'usr_teacher_obi',
  schoolId: TENANT_A_ID,
  email: 'emeka.obi@kingscollegelagos.sch.ng',
  firstName: 'Emeka',
  lastName: 'Obi',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const mockPrincipalA: AuthSession = {
  userId: 'usr_principal_alabi',
  schoolId: TENANT_A_ID,
  email: 'principal@kingscollegelagos.sch.ng',
  firstName: 'Elizabeth',
  lastName: 'Alabi',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const mockTeacherB: AuthSession = {
  userId: 'usr_teacher_b',
  schoolId: TENANT_B_ID,
  email: 'teacher@premieracademy.sch.ng',
  firstName: 'Ibrahim',
  lastName: 'Musa',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const mockParent: AuthSession = {
  userId: 'usr_parent_01',
  schoolId: TENANT_A_ID,
  email: 'parent@gmail.com',
  firstName: 'Babatunde',
  lastName: 'Adeleke',
  userType: 'PARENT',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

test('--- Running Phase 5 Academics, Timetable & Attendance Engine Suite ---', async (t) => {
  resetAttendanceStore();
  clearOfflineQueue();

  await t.test('Phase 5.1: Daily Classroom Attendance & High-Speed Register Entry', async () => {
    const todayStr = '2026-10-17';

    // Fetch pre-populated draft sheet for JSS 1 Gold
    const draftSheet = await getClassAttendanceSheet(
      TENANT_A_ID,
      'arm_9_1',
      todayStr,
      mockTeacherA
    );

    assert.ok(draftSheet);
    assert.strictEqual(draftSheet.classArmName, 'Gold');
    assert.ok(draftSheet.records.length >= 3, 'Must have at least 3 students in class arm');

    // High-Speed Entry: Record attendance with mixed statuses (Present, Absent, Late)
    const startTime = performance.now();
    const result = await recordClassAttendance(
      TENANT_A_ID,
      {
        classArmId: 'arm_9_1',
        date: todayStr,
        periodType: 'DAILY_MORNING',
        records: [
          {
            studentId: 'stu_kcl_001',
            status: 'PRESENT',
            arrivalTime: '07:45',
          },
          {
            studentId: 'stu_kcl_002',
            status: 'ABSENT',
            reason: 'ILLNESS',
            remarks: 'Severe malaria; doctor visited.',
          },
          {
            studentId: 'stu_kcl_003',
            status: 'LATE',
            arrivalTime: '08:30', // after 08:15 cutoff
            remarks: 'Heavy traffic on Third Mainland Bridge.',
          },
        ],
      },
      mockTeacherA
    );
    const duration = performance.now() - startTime;

    assert.ok(duration < 250, `Attendance recording took ${duration.toFixed(2)}ms (must be < 250ms)`);
    assert.strictEqual(result.sheet.presentCount, 1);
    assert.strictEqual(result.sheet.absentCount, 1);
    assert.strictEqual(result.sheet.lateCount, 1);
    assert.strictEqual(result.sheet.totalEnrolled, 3);
    assert.strictEqual(result.sheet.attendanceRate, 66.7); // (1 present + 1 late) / 3 = 66.7%

    const lateRecord = result.sheet.records.find((r) => r.studentId === 'stu_kcl_003');
    assert.ok(lateRecord?.isLate, 'Student arriving at 08:30 must be flagged isLate');
  });

  await t.test('Phase 5.2: Automatic Parent Absence Alert Dispatch', async () => {
    const alerts = await listParentAbsenceAlerts(TENANT_A_ID, mockPrincipalA);
    const student2Alert = alerts.find((a) => a.studentId === 'stu_kcl_002');

    assert.ok(student2Alert, 'Parent alert must be automatically queued for absent student');
    assert.strictEqual(student2Alert.channel, 'SMS');
    assert.ok(student2Alert.message.includes('ABSENT'));
    assert.ok(student2Alert.message.includes('Amina Fatima Bello') || student2Alert.message.includes('stu_kcl_002'));
    assert.strictEqual(student2Alert.status, 'QUEUED');
  });

  await t.test('Phase 5.3: Consecutive Absence Tracking & Chronic Absenteeism Flag', async () => {
    // Record another day of absence for stu_kcl_002
    await recordClassAttendance(
      TENANT_A_ID,
      {
        classArmId: 'arm_9_1',
        date: '2026-10-18',
        periodType: 'DAILY_MORNING',
        records: [
          { studentId: 'stu_kcl_001', status: 'PRESENT' },
          { studentId: 'stu_kcl_002', status: 'ABSENT', reason: 'ILLNESS' },
          { studentId: 'stu_kcl_003', status: 'PRESENT' },
        ],
      },
      mockTeacherA
    );

    // Record third day of absence for stu_kcl_002
    await recordClassAttendance(
      TENANT_A_ID,
      {
        classArmId: 'arm_9_1',
        date: '2026-10-19',
        periodType: 'DAILY_MORNING',
        records: [
          { studentId: 'stu_kcl_001', status: 'PRESENT' },
          { studentId: 'stu_kcl_002', status: 'ABSENT', reason: 'UNEXPLAINED' },
          { studentId: 'stu_kcl_003', status: 'PRESENT' },
        ],
      },
      mockTeacherA
    );

    // Verify consecutive absences for stu_kcl_002
    const stats = await getStudentAttendanceSummary(
      TENANT_A_ID,
      'stu_kcl_002',
      mockTeacherA
    );

    assert.ok(stats.consecutiveAbsences >= 3, `Expected >= 3 consecutive absences, got ${stats.consecutiveAbsences}`);
    assert.strictEqual(stats.isFlaggedChronic, true, 'Student with 3+ consecutive absences must be flagged chronic');

    // Stu 001 has full attendance
    const stats1 = await getStudentAttendanceSummary(
      TENANT_A_ID,
      'stu_kcl_001',
      mockTeacherA
    );
    assert.strictEqual(stats1.consecutiveAbsences, 0);
    assert.strictEqual(stats1.isFlaggedChronic, false);
  });

  await t.test('Phase 5.4: Offline Attendance Local Queue & Background Sync Engine', async () => {
    clearOfflineQueue();

    // Enqueue attendance while offline
    const queuedItem = enqueueOfflineAttendance({
      classArmId: 'arm_9_1',
      date: '2026-10-20',
      periodType: 'DAILY_MORNING',
      records: [
        { studentId: 'stu_kcl_001', status: 'PRESENT' },
        { studentId: 'stu_kcl_002', status: 'PRESENT' },
        { studentId: 'stu_kcl_003', status: 'PRESENT' },
      ],
    });

    assert.ok(queuedItem.id);
    assert.strictEqual(getPendingOfflineQueue().length, 1);

    // Replay queue using flushOfflineQueue
    const flushResult = await flushOfflineQueue(async (payload) => {
      const res = await recordClassAttendance(TENANT_A_ID, payload, mockTeacherA);
      return { success: true };
    });

    assert.strictEqual(flushResult.totalFlushed, 1);
    assert.strictEqual(flushResult.successCount, 1);
    assert.strictEqual(getPendingOfflineQueue().length, 0, 'Queue must be empty after successful sync');

    // Verify attendance recorded on server with isOfflineSync: true
    const sheet = await getClassAttendanceSheet(
      TENANT_A_ID,
      'arm_9_1',
      '2026-10-20',
      mockTeacherA
    );
    assert.strictEqual(sheet.records[0].isOfflineSync, true);
  });

  await t.test('Phase 5.5: Timetable Management & Clash Detection Engine', async () => {
    // 1. Valid timetable schedule for JSS 1 Diamond (arm_9_2)
    const validDiamondSlots: TimetableSlot[] = [
      {
        id: 'slot_dmd_mon_p1',
        classArmId: 'arm_9_2',
        classArmName: 'Diamond',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        subjectId: 'sub_eng',
        subjectName: 'English Language',
        subjectCode: 'ENG',
        teacherId: 'usr_teacher_adeleke',
        teacherName: 'Mrs. Ngozi Adeleke',
        roomId: 'room_102',
        roomName: 'Classroom 102',
        dayOfWeek: 'MONDAY',
        periodNumber: 1,
        startTime: '08:15',
        endTime: '08:55',
        periodType: 'LESSON',
      },
    ];

    const saveRes = await saveClassTimetable(
      TENANT_A_ID,
      { classArmId: 'arm_9_2', slots: validDiamondSlots },
      mockPrincipalA
    );

    assert.strictEqual(saveRes.savedSlots.length, 1);

    // 2. Teacher Clash Detection:
    // Mr. Emeka Obi is already scheduled for JSS 1 Gold on Monday Period 1 (in room 101).
    // Attempting to schedule him simultaneously for JSS 1 Diamond on Monday Period 1 should generate a clash!
    const clashingSlots: TimetableSlot[] = [
      {
        id: 'slot_clash_teacher',
        classArmId: 'arm_9_2',
        classArmName: 'Diamond',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        subjectId: 'sub_mth',
        subjectName: 'Mathematics',
        subjectCode: 'MTH',
        teacherId: 'usr_teacher_obi', // Already teaching JSS 1 Gold on Monday P1!
        teacherName: 'Mr. Emeka Obi',
        roomId: 'room_102',
        roomName: 'Classroom 102',
        dayOfWeek: 'MONDAY',
        periodNumber: 1,
        startTime: '08:15',
        endTime: '08:55',
        periodType: 'LESSON',
      },
    ];

    const goldSlots = (await getClassTimetable(TENANT_A_ID, 'arm_9_1', mockPrincipalA)).slots;
    const detectedClashes = detectTimetableClashes(TENANT_A_ID, clashingSlots, goldSlots);

    assert.ok(detectedClashes.length > 0, 'Must detect clash when teacher is double booked');
    const teacherClash = detectedClashes.find((c) => c.clashType === 'TEACHER_DOUBLE_BOOKED');
    assert.ok(teacherClash, 'Must generate TEACHER_DOUBLE_BOOKED clash type');
    assert.ok(teacherClash.description.includes('Emeka Obi'));

    // 3. Room Clash Detection:
    // Room 101 is already booked on Monday Period 1.
    const roomClashSlots: TimetableSlot[] = [
      {
        id: 'slot_clash_room',
        classArmId: 'arm_9_2',
        classArmName: 'Diamond',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        subjectId: 'sub_agr',
        subjectName: 'Agricultural Science',
        subjectCode: 'AGR',
        teacherId: 'usr_teacher_new',
        teacherName: 'Mr. Paul Danjuma',
        roomId: 'room_101', // Already in use by JSS 1 Gold!
        roomName: 'Classroom 101',
        dayOfWeek: 'MONDAY',
        periodNumber: 1,
        startTime: '08:15',
        endTime: '08:55',
        periodType: 'LESSON',
      },
    ];

    const roomClashes = detectTimetableClashes(TENANT_A_ID, roomClashSlots, goldSlots);
    const roomClash = roomClashes.find((c) => c.clashType === 'ROOM_DOUBLE_BOOKED');
    assert.ok(roomClash, 'Must detect ROOM_DOUBLE_BOOKED clash type');
    assert.ok(roomClash.description.includes('Classroom 101'));

    // 4. Class Arm Overlapping Clashes must reject save:
    const armOverlappingSlots: TimetableSlot[] = [
      {
        id: 'slot_arm_1',
        classArmId: 'arm_9_2',
        classArmName: 'Diamond',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        subjectId: 'sub_mth',
        subjectName: 'Mathematics',
        subjectCode: 'MTH',
        teacherId: 'usr_teacher_obi',
        teacherName: 'Mr. Emeka Obi',
        roomId: 'room_102',
        roomName: 'Classroom 102',
        dayOfWeek: 'WEDNESDAY',
        periodNumber: 1,
        startTime: '08:15',
        endTime: '08:55',
        periodType: 'LESSON',
      },
      {
        id: 'slot_arm_2',
        classArmId: 'arm_9_2',
        classArmName: 'Diamond',
        classLevelId: 'lvl_9',
        classLevelName: 'JSS 1',
        subjectId: 'sub_eng',
        subjectName: 'English Language',
        subjectCode: 'ENG',
        teacherId: 'usr_teacher_adeleke',
        teacherName: 'Mrs. Ngozi Adeleke',
        roomId: 'room_103',
        roomName: 'Classroom 103',
        dayOfWeek: 'WEDNESDAY',
        periodNumber: 1, // Same class arm Diamond has two subjects at Wednesday P1!
        startTime: '08:15',
        endTime: '08:55',
        periodType: 'LESSON',
      },
    ];

    await assert.rejects(
      async () => {
        await saveClassTimetable(
          TENANT_A_ID,
          { classArmId: 'arm_9_2', slots: armOverlappingSlots },
          mockPrincipalA
        );
      },
      /Timetable Clash Error/,
      'Must reject saving timetable with overlapping periods for same class arm'
    );
  });

  await t.test('Phase 5.6: Security — Tenant Isolation, RBAC & Audit Trails', async () => {
    // 1. Cross-Tenant Attendance Recording: Tenant B cannot record Tenant A attendance
    await assert.rejects(
      async () => {
        await recordClassAttendance(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            date: '2026-10-21',
            periodType: 'DAILY_MORNING',
            records: [{ studentId: 'stu_kcl_001', status: 'PRESENT' }],
          },
          mockTeacherB // Belongs to Tenant B
        );
      },
      /403 Forbidden: Cross-tenant attendance recording is prohibited/,
      'Must reject cross-tenant attendance write'
    );

    // 2. Unauthorized Role (Parent): cannot record attendance
    await assert.rejects(
      async () => {
        await recordClassAttendance(
          TENANT_A_ID,
          {
            classArmId: 'arm_9_1',
            date: '2026-10-21',
            periodType: 'DAILY_MORNING',
            records: [{ studentId: 'stu_kcl_001', status: 'PRESENT' }],
          },
          mockParent // PARENT role
        );
      },
      /403 Forbidden: User role \[PARENT\] lacks authorization/,
      'Parent role must be forbidden from recording class attendance'
    );

    // 3. Unauthorized Role (Parent): cannot manage timetables
    await assert.rejects(
      async () => {
        await saveClassTimetable(
          TENANT_A_ID,
          { classArmId: 'arm_9_1', slots: [] },
          mockParent
        );
      },
      /403 Forbidden: User lacks permission to manage school timetables/,
      'Parent role must be forbidden from managing timetables'
    );

    // 4. Audit Log Verification
    const auditLogs = await getAuditLogsForSchool(TENANT_A_ID);
    const attendanceLogs = auditLogs.filter((l) => l.action === 'ATTENDANCE_RECORDED');
    const timetableLogs = auditLogs.filter((l) => l.action === 'TIMETABLE_SAVED');

    assert.ok(attendanceLogs.length > 0, 'Audit log must record attendance entry events');
    assert.ok(timetableLogs.length > 0, 'Audit log must record timetable mutations');
  });

  await t.test('Phase 5.7: Aggregate Attendance Metrics Calculation', async () => {
    const metrics = await getSchoolAttendanceMetrics(
      TENANT_A_ID,
      '2026-10-17',
      mockPrincipalA
    );

    assert.strictEqual(metrics.date, '2026-10-17');
    assert.strictEqual(metrics.totalEnrolled, 3);
    assert.strictEqual(metrics.totalPresent, 1);
    assert.strictEqual(metrics.totalAbsent, 1);
    assert.strictEqual(metrics.totalLate, 1);
    assert.strictEqual(metrics.overallAttendanceRate, 66.7);
  });
});
