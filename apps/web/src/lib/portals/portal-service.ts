import { AuthSession } from '../auth/rbac';

/**
 * SchoolOS Role Portals Aggregation Service
 * Powers dedicated Parent, Teacher, and Student Portals (Playbook pp. 12-13, 19-20)
 */

export interface ParentChildSummary {
  studentId: string;
  admissionNumber: string;
  fullName: string;
  classLevel: string;
  classArm: string;
  campusName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  genotype: string;
  allergies: string;
  attendanceRate: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalSchoolDays: number;
  outstandingBalance: number;
  totalBilled: number;
  totalPaid: number;
  invoicesCount: number;
}

export interface ParentPortalData {
  isPreview?: boolean;
  previewActorName?: string;
  previewActorRole?: string;
  guardian: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  children: ParentChildSummary[];
  activeChild: ParentChildSummary;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    title: string;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
    dueDate: string;
    lineItems: Array<{ description: string; amount: number }>;
  }>;
  recentReceipts: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    date: string;
    paystackRef?: string;
  }>;
  reportCard: {
    term: string;
    session: string;
    cognitiveScores: Array<{
      subjectName: string;
      ca1: number;
      ca2: number;
      exam: number;
      total: number;
      grade: string;
      remark: string;
    }>;
    affectiveRatings: Record<string, number>;
    psychomotorRatings: Record<string, number>;
    classTeacherRemarks: string;
    principalRemarks: string;
    verificationHash: string;
  } | null;
}

export interface TeacherPortalData {
  isPreview?: boolean;
  previewActorName?: string;
  previewActorRole?: string;
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
    schoolName: string;
  };
  todaySummary: {
    dateFormatted: string;
    dayOfWeek: string;
    currentWeek: number;
    totalPeriodsToday: number;
    registersTakenCount: number;
    registersPendingCount: number;
  };
  scheduleToday: Array<{
    periodNumber: number;
    timeSlot: string;
    subjectName: string;
    classArm: string;
    room: string;
    status: 'COMPLETED' | 'UPCOMING' | 'CURRENT';
  }>;
  assignedClasses: Array<{
    armId: string;
    classArmName: string;
    subjectName: string;
    studentCount: number;
    registerTakenToday: boolean;
    scorebookStatus: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'LOCKED';
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    type: 'ATTENDANCE' | 'ASSESSMENT' | 'GOVERNANCE';
    urgency: 'HIGH' | 'MEDIUM' | 'LOW';
    dueTime: string;
  }>;
}

export interface StudentPortalData {
  isPreview?: boolean;
  previewActorName?: string;
  previewActorRole?: string;
  student: {
    id: string;
    admissionNumber: string;
    fullName: string;
    classArm: string;
    schoolName: string;
    campusName: string;
  };
  attendanceSummary: {
    rate: number;
    daysPresent: number;
    daysAbsent: number;
    daysLate: number;
  };
  timetableToday: Array<{
    period: number;
    time: string;
    subject: string;
    teacher: string;
    room: string;
  }>;
  termGrades: Array<{
    subjectName: string;
    caScore: number;
    examScore: number;
    totalScore: number;
    grade: string;
  }>;
  notices: Array<{
    id: string;
    title: string;
    content: string;
    date: string;
    author: string;
  }>;
}

/**
 * Retrieves multi-child aggregated data for the Parent Portal.
 */
export async function getParentPortalData(
  schoolId: string,
  actor: AuthSession,
  selectedStudentId?: string
): Promise<ParentPortalData> {
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant portal query rejected.');
  }

  // Pre-configured multi-child portfolio for demo guardian (Mrs. Ngozi Adeleke)
  const child1: ParentChildSummary = {
    studentId: 'stu_kcl_001',
    admissionNumber: 'KCL/2026/001',
    fullName: 'Chidubem Emmanuel Adeleke',
    classLevel: 'JSS 1',
    classArm: 'JSS 1 Gold',
    campusName: 'Main Campus, Victoria Island',
    gender: 'MALE',
    dateOfBirth: '2014-05-12',
    bloodGroup: 'O+',
    genotype: 'AA',
    allergies: 'None',
    attendanceRate: 96.4,
    totalPresent: 54,
    totalAbsent: 2,
    totalLate: 1,
    totalSchoolDays: 56,
    outstandingBalance: 50000,
    totalBilled: 350000,
    totalPaid: 300000,
    invoicesCount: 1,
  };

  const child2: ParentChildSummary = {
    studentId: 'stu_kcl_003',
    admissionNumber: 'KCL/2026/003',
    fullName: 'Folake Joy Adeleke',
    classLevel: 'SSS 2',
    classArm: 'SSS 2 Diamond',
    campusName: 'Main Campus, Victoria Island',
    gender: 'FEMALE',
    dateOfBirth: '2010-09-18',
    bloodGroup: 'A+',
    genotype: 'AA',
    allergies: 'Penicillin',
    attendanceRate: 98.2,
    totalPresent: 55,
    totalAbsent: 1,
    totalLate: 0,
    totalSchoolDays: 56,
    outstandingBalance: 0,
    totalBilled: 380000,
    totalPaid: 380000,
    invoicesCount: 1,
  };

  const children = [child1, child2];
  const activeChild = children.find((c) => c.studentId === selectedStudentId) || child1;

  const isChild1 = activeChild.studentId === child1.studentId;
  const isParentActor = actor.userType === 'PARENT';
  const guardianName = isParentActor ? `${actor.firstName} ${actor.lastName}` : 'Mrs. Ngozi Adeleke';
  const guardianEmail = isParentActor ? actor.email : 'parent@apexcollege.ng';

  return {
    isPreview: !isParentActor,
    previewActorName: `${actor.firstName} ${actor.lastName}`,
    previewActorRole: actor.userType,
    guardian: {
      name: guardianName,
      email: guardianEmail,
      phone: '+234 803 456 7890',
      address: 'Plot 14 Admiralty Way, Lekki Phase 1, Lagos',
    },
    children,
    activeChild,
    invoices: [
      {
        id: isChild1 ? 'inv_kcl_2026_01' : 'inv_kcl_2026_02',
        invoiceNumber: isChild1 ? 'INV/2026/T1/001' : 'INV/2026/T1/002',
        title: '2026/2027 Academic Session — 1st Term Tuition & Levies',
        totalAmount: isChild1 ? 350000 : 380000,
        amountPaid: isChild1 ? 300000 : 380000,
        balanceDue: isChild1 ? 50000 : 0,
        status: isChild1 ? 'PARTIAL' : 'PAID',
        dueDate: '2026-11-30',
        lineItems: [
          { description: 'Term 1 Tuition Fee', amount: 200000 },
          { description: 'Institutional Development Levy', amount: 50000 },
          { description: 'ICT / STEM Laboratory Practical Fee', amount: 35000 },
          { description: 'Standard Educational Books & Stationery', amount: 45000 },
          { description: 'School Bus Transportation (Zone A: Lekki)', amount: isChild1 ? 20000 : 50000 },
        ],
      },
    ],
    recentReceipts: [
      {
        id: 'rec_pay_001',
        receiptNumber: 'REC-2026-9812',
        amount: 300000,
        paymentMethod: 'PAYSTACK_GATEWAY',
        date: '2026-09-18 10:14 AM',
        paystackRef: 'pstk_tx_live_8829104',
      },
      ...(isChild1
        ? []
        : [
            {
              id: 'rec_pay_002',
              receiptNumber: 'REC-2026-9813',
              amount: 380000,
              paymentMethod: 'BANK_TRANSFER',
              date: '2026-09-20 02:45 PM',
            },
          ]),
    ],
    reportCard: {
      term: '1st Term',
      session: '2026/2027',
      cognitiveScores: [
        { subjectName: 'Mathematics', ca1: 18, ca2: 17, exam: 52, total: 87, grade: 'A', remark: 'Excellent' },
        { subjectName: 'English Language', ca1: 16, ca2: 18, exam: 48, total: 82, grade: 'A', remark: 'Very Good' },
        { subjectName: 'Basic Science & Tech', ca1: 19, ca2: 18, exam: 54, total: 91, grade: 'A', remark: 'Outstanding' },
        { subjectName: 'Civic Education', ca1: 15, ca2: 16, exam: 45, total: 76, grade: 'B', remark: 'Good' },
        { subjectName: 'Agricultural Science', ca1: 17, ca2: 18, exam: 49, total: 84, grade: 'A', remark: 'Commendable' },
      ],
      affectiveRatings: {
        Punctuality: 5,
        Politeness: 5,
        Honesty: 5,
        Leadership: 4,
        Neatness: 5,
      },
      psychomotorRatings: {
        Handwriting: 4,
        Sports: 4,
        Crafts: 4,
        MusicalSkills: 3,
      },
      classTeacherRemarks: `${activeChild.fullName.split(' ')[0]} is a disciplined, attentive scholar with outstanding analytical proficiency.`,
      principalRemarks: 'Promising academic performance. Encouraged to maintain this standard throughout the academic year.',
      verificationHash: `VERIFY-SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`,
    },
  };
}

/**
 * Retrieves teacher assigned schedule, roll call statuses, and scorebook alerts.
 */
export async function getTeacherPortalData(
  schoolId: string,
  actor: AuthSession
): Promise<TeacherPortalData> {
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant portal query rejected.');
  }

  const isTeacherActor = actor.userType === 'TEACHER';
  const teacherName = isTeacherActor ? `${actor.firstName} ${actor.lastName}` : 'Mr. Joseph Okafor';
  const teacherEmail = isTeacherActor ? actor.email : 'teacher@apexcollege.ng';
  const teacherRole = isTeacherActor ? 'Subject Teacher' : 'Senior Mathematics Teacher';

  return {
    isPreview: !isTeacherActor,
    previewActorName: `${actor.firstName} ${actor.lastName}`,
    previewActorRole: actor.userType,
    teacher: {
      id: isTeacherActor ? actor.userId : 'usr_teacher_kcl',
      name: teacherName,
      email: teacherEmail,
      role: teacherRole,
      schoolName: 'Apex Model College, Lagos',
    },
    todaySummary: {
      dateFormatted: 'Monday, 19 October 2026',
      dayOfWeek: 'Monday',
      currentWeek: 6,
      totalPeriodsToday: 4,
      registersTakenCount: 1,
      registersPendingCount: 1,
    },
    scheduleToday: [
      {
        periodNumber: 1,
        timeSlot: '08:30 - 09:15 AM',
        subjectName: 'Mathematics',
        classArm: 'JSS 1 Gold',
        room: 'Block A, Room 102',
        status: 'COMPLETED',
      },
      {
        periodNumber: 3,
        timeSlot: '10:00 - 10:45 AM',
        subjectName: 'Mathematics',
        classArm: 'JSS 1 Diamond',
        room: 'Block A, Room 104',
        status: 'CURRENT',
      },
      {
        periodNumber: 5,
        timeSlot: '11:45 - 12:30 PM',
        subjectName: 'Further Mathematics',
        classArm: 'SSS 2 Gold',
        room: 'Science Lab 2',
        status: 'UPCOMING',
      },
      {
        periodNumber: 7,
        timeSlot: '01:45 - 02:30 PM',
        subjectName: 'Mathematics Clinic / Tutorial',
        classArm: 'JSS 1 Gold',
        room: 'Block A, Room 102',
        status: 'UPCOMING',
      },
    ],
    assignedClasses: [
      {
        armId: 'arm_jss1_gold',
        classArmName: 'JSS 1 Gold',
        subjectName: 'Mathematics',
        studentCount: 26,
        registerTakenToday: true,
        scorebookStatus: 'APPROVED',
      },
      {
        armId: 'arm_jss1_diamond',
        classArmName: 'JSS 1 Diamond',
        subjectName: 'Mathematics',
        studentCount: 24,
        registerTakenToday: false,
        scorebookStatus: 'DRAFT',
      },
      {
        armId: 'arm_sss2_gold',
        classArmName: 'SSS 2 Gold',
        subjectName: 'Further Mathematics',
        studentCount: 18,
        registerTakenToday: true,
        scorebookStatus: 'SUBMITTED',
      },
    ],
    pendingTasks: [
      {
        id: 'task_001',
        title: 'Submit JSS 1 Diamond CA2 Missing Marks (2 students pending)',
        type: 'ASSESSMENT',
        urgency: 'HIGH',
        dueTime: 'Today by 04:00 PM',
      },
      {
        id: 'task_002',
        title: 'Complete JSS 1 Diamond Afternoon Register Roll Call',
        type: 'ATTENDANCE',
        urgency: 'MEDIUM',
        dueTime: 'Today by 01:30 PM',
      },
    ],
  };
}

/**
 * Retrieves student personal schedule, results, and notifications.
 */
export async function getStudentPortalData(
  schoolId: string,
  actor: AuthSession
): Promise<StudentPortalData> {
  if (actor.schoolId !== schoolId) {
    throw new Error('Tenant Isolation Violation: Cross-tenant portal query rejected.');
  }

  const isStudentActor = actor.userType === 'STUDENT';
  const studentName = isStudentActor ? `${actor.firstName} ${actor.lastName}` : 'Chidubem Emmanuel Adeleke';

  return {
    isPreview: !isStudentActor,
    previewActorName: `${actor.firstName} ${actor.lastName}`,
    previewActorRole: actor.userType,
    student: {
      id: isStudentActor ? actor.userId : 'stu_kcl_001',
      admissionNumber: 'KCL/2026/001',
      fullName: studentName,
      classArm: 'JSS 1 Gold',
      schoolName: 'Apex Model College, Lagos',
      campusName: 'Main Campus, Victoria Island',
    },
    attendanceSummary: {
      rate: 96.4,
      daysPresent: 54,
      daysAbsent: 2,
      daysLate: 1,
    },
    timetableToday: [
      { period: 1, time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Mr. Joseph Okafor', room: 'Room 102' },
      { period: 2, time: '09:15 - 10:00', subject: 'English Language', teacher: 'Mrs. Funke Adeyemi', room: 'Room 102' },
      { period: 3, time: '10:00 - 10:45', subject: 'Basic Science', teacher: 'Dr. Chinedu Eze', room: 'Lab 1' },
      { period: 4, time: '11:00 - 11:45', subject: 'Social Studies', teacher: 'Mr. Usman Danjuma', room: 'Room 102' },
    ],
    termGrades: [
      { subjectName: 'Mathematics', caScore: 35, examScore: 52, totalScore: 87, grade: 'A' },
      { subjectName: 'English Language', caScore: 34, examScore: 48, totalScore: 82, grade: 'A' },
      { subjectName: 'Basic Science & Tech', caScore: 37, examScore: 54, totalScore: 91, grade: 'A' },
      { subjectName: 'Civic Education', caScore: 31, examScore: 45, totalScore: 76, grade: 'B' },
      { subjectName: 'Computer Science / Coding', caScore: 38, examScore: 56, totalScore: 94, grade: 'A' },
    ],
    notices: [
      {
        id: 'not_01',
        title: 'Inter-House Sports Heat Trials Scheduled for Wednesday',
        content: 'All house captains should report to the sports complex by 08:30 AM with their track rosters.',
        date: '2026-10-18',
        author: 'Sports Committee',
      },
      {
        id: 'not_02',
        title: 'Mid-Term Break Announcement',
        content: 'School will be on mid-term recess from Thursday 29th October through Monday 2nd November.',
        date: '2026-10-15',
        author: 'Principal Office',
      },
    ],
  };
}
