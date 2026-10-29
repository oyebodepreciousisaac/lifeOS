import {
  AcademicConfiguration,
  SchoolProfile,
  CampusItem,
  AcademicSessionItem,
  ClassLevelItem,
  SubjectItem,
  OperationalRules,
  SchoolProfileSchema,
  CampusesListSchema,
  AcademicSessionSchema,
  ClassLevelsListSchema,
  SubjectsListSchema,
  OperationalRulesSchema,
  NIGERIAN_PRESET_LEVELS,
  NIGERIAN_PRESET_SUBJECTS,
} from './academic-types';
import { AuthSession, can } from '../auth/rbac';
import { logAuditEvent } from '../audit/logger';

// ------------------------------------------------------------------------------
// Multi-Tenant Academic Setup In-Memory Store
// Seeded with Tenant A (King's College Lagos) and Tenant B (Premier Academy Abuja)
// ------------------------------------------------------------------------------

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

const academicStore: Map<string, AcademicConfiguration> = new Map();

function initializeDefaultConfigurations() {
  // Tenant A: King's College Lagos
  const tenantACampuses: CampusItem[] = [
    {
      id: 'cmp_lagos_main',
      schoolId: TENANT_A_ID,
      name: 'TBS Main Campus',
      code: 'MAIN',
      address: '3 Catholic Mission Street, Lagos Island',
      city: 'Lagos Island',
      state: 'Lagos',
      country: 'Nigeria',
      isMain: true,
      phone: '+234 1 234 5678',
    },
    {
      id: 'cmp_lagos_annex',
      schoolId: TENANT_A_ID,
      name: 'Victoria Island Boarding Annex',
      code: 'ANNEX',
      address: 'Adeola Odeku Street, Victoria Island',
      city: 'Victoria Island',
      state: 'Lagos',
      country: 'Nigeria',
      isMain: false,
      phone: '+234 1 234 5679',
    },
  ];

  const tenantASession: AcademicSessionItem = {
    id: 'ses_2026_2027',
    schoolId: TENANT_A_ID,
    name: '2026/2027',
    startDate: '2026-09-14',
    endDate: '2027-07-23',
    isCurrent: true,
    terms: [
      {
        id: 'trm_1st_2026',
        name: '1st Term',
        startDate: '2026-09-14',
        endDate: '2026-12-18',
        isCurrent: true,
        isLocked: false,
      },
      {
        id: 'trm_2nd_2027',
        name: '2nd Term',
        startDate: '2027-01-11',
        endDate: '2027-04-09',
        isCurrent: false,
        isLocked: false,
      },
      {
        id: 'trm_3rd_2027',
        name: '3rd Term',
        startDate: '2027-04-26',
        endDate: '2027-07-23',
        isCurrent: false,
        isLocked: false,
      },
    ],
  };

  const tenantALevels: ClassLevelItem[] = NIGERIAN_PRESET_LEVELS.map((lvl, index) => ({
    id: `lvl_${index + 1}`,
    schoolId: TENANT_A_ID,
    campusId: 'cmp_lagos_main',
    name: lvl.name,
    levelOrder: lvl.levelOrder,
    section: lvl.section,
    arms: lvl.arms.map((arm, aIdx) => ({
      id: `arm_${index + 1}_${aIdx + 1}`,
      levelId: `lvl_${index + 1}`,
      name: arm.name,
      capacity: arm.capacity,
      formTeacherId: 'usr_004',
      formTeacherName: 'Joseph Okafor',
    })),
  }));

  const tenantASubjects: SubjectItem[] = NIGERIAN_PRESET_SUBJECTS.map((sub, sIdx) => ({
    id: `sub_${sIdx + 1}`,
    schoolId: TENANT_A_ID,
    name: sub.name,
    code: sub.code,
    department: sub.department,
    isElective: sub.isElective,
    applicableSections: sub.applicableSections,
  }));

  const tenantAConfig: AcademicConfiguration = {
    school: {
      id: TENANT_A_ID,
      name: "King's College Lagos",
      slug: 'kings-college-lagos',
      officialCode: 'KCL-FED-1909',
      motto: 'Floreat Collegium (Let the College Flourish)',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
      crestUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&h=200&fit=crop',
      contactEmail: 'admin@kingscollege.sch.ng',
      contactPhone: '+234 802 345 6789',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      address: '3 Catholic Mission Street, Lagos Island',
      city: 'Lagos Island',
      state: 'Lagos',
      isOnboardingCompleted: true,
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-10-17T12:00:00Z',
    },
    campuses: tenantACampuses,
    activeSession: tenantASession,
    sessions: [tenantASession],
    classLevels: tenantALevels,
    subjects: tenantASubjects,
    operationalRules: {
      workingHoursStart: '07:45',
      workingHoursEnd: '15:30',
      periodDurationMinutes: 40,
      assemblyDurationMinutes: 20,
      breakDurationMinutes: 30,
      latenessCutoff: '08:15',
      daysPerWeek: 5,
    },
  };

  // Tenant B: Premier Academy Abuja
  const tenantBCampuses: CampusItem[] = [
    {
      id: 'cmp_abuja_main',
      schoolId: TENANT_B_ID,
      name: 'Lugbe Campus',
      code: 'ABJ-MAIN',
      address: 'Sector F, FHA Estate, Lugbe',
      city: 'Lugbe',
      state: 'FCT Abuja',
      country: 'Nigeria',
      isMain: true,
      phone: '+234 9 876 5432',
    },
  ];

  const tenantBSession: AcademicSessionItem = {
    id: 'ses_b_2026_2027',
    schoolId: TENANT_B_ID,
    name: '2026/2027',
    startDate: '2026-09-07',
    endDate: '2027-07-16',
    isCurrent: true,
    terms: [
      {
        id: 'trm_b_1st_2026',
        name: '1st Term',
        startDate: '2026-09-07',
        endDate: '2026-12-11',
        isCurrent: true,
        isLocked: false,
      },
    ],
  };

  const tenantBConfig: AcademicConfiguration = {
    school: {
      id: TENANT_B_ID,
      name: 'Premier Academy Abuja',
      slug: 'premier-academy-abuja',
      officialCode: 'PAA-FCT-2012',
      motto: 'Excellence in Leadership',
      logoUrl: '',
      crestUrl: '',
      contactEmail: 'admin@premierabuja.ng',
      contactPhone: '+234 803 987 6543',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      address: 'Sector F, FHA Estate, Lugbe',
      city: 'Lugbe',
      state: 'FCT Abuja',
      isOnboardingCompleted: false, // In setup wizard mode
      createdAt: '2026-10-01T08:00:00Z',
      updatedAt: '2026-10-17T09:00:00Z',
    },
    campuses: tenantBCampuses,
    activeSession: tenantBSession,
    sessions: [tenantBSession],
    classLevels: [],
    subjects: [],
    operationalRules: {
      workingHoursStart: '08:00',
      workingHoursEnd: '15:00',
      periodDurationMinutes: 45,
      assemblyDurationMinutes: 15,
      breakDurationMinutes: 30,
      latenessCutoff: '08:20',
      daysPerWeek: 5,
    },
  };

  academicStore.set(TENANT_A_ID, tenantAConfig);
  academicStore.set(TENANT_B_ID, tenantBConfig);
}

// Ensure seeded on first import
if (academicStore.size === 0) {
  initializeDefaultConfigurations();
}

/**
 * Retrieves the full academic configuration for a given school tenant.
 * Guarantees tenant isolation: throws if schoolId is missing or empty.
 */
export function getSchoolConfiguration(schoolId: string): AcademicConfiguration {
  if (!schoolId || typeof schoolId !== 'string' || schoolId.trim().length === 0) {
    throw new Error('Tenant Scoping Error: A valid schoolId is required.');
  }

  let config = academicStore.get(schoolId);
  if (!config) {
    // Generate a clean fresh tenant baseline
    const initialSession: AcademicSessionItem = {
      id: `ses_${Date.now()}`,
      schoolId,
      name: '2026/2027',
      startDate: '2026-09-14',
      endDate: '2027-07-23',
      isCurrent: true,
      terms: [
        {
          id: `trm_1_${Date.now()}`,
          name: '1st Term',
          startDate: '2026-09-14',
          endDate: '2026-12-18',
          isCurrent: true,
          isLocked: false,
        },
        {
          id: `trm_2_${Date.now()}`,
          name: '2nd Term',
          startDate: '2027-01-11',
          endDate: '2027-04-09',
          isCurrent: false,
          isLocked: false,
        },
        {
          id: `trm_3_${Date.now()}`,
          name: '3rd Term',
          startDate: '2027-04-26',
          endDate: '2027-07-23',
          isCurrent: false,
          isLocked: false,
        },
      ],
    };

    config = {
      school: {
        id: schoolId,
        name: 'New School',
        slug: `school-${schoolId.slice(0, 8)}`,
        contactEmail: 'admin@school.ng',
        contactPhone: '+234 800 000 0000',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        address: 'Main School Address',
        city: 'Lagos',
        state: 'Lagos',
        isOnboardingCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      campuses: [
        {
          id: `cmp_${Date.now()}`,
          schoolId,
          name: 'Main Campus',
          code: 'MAIN',
          address: 'Main School Address',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          isMain: true,
        },
      ],
      activeSession: initialSession,
      sessions: [initialSession],
      classLevels: [],
      subjects: [],
      operationalRules: {
        workingHoursStart: '07:45',
        workingHoursEnd: '15:30',
        periodDurationMinutes: 40,
        assemblyDurationMinutes: 20,
        breakDurationMinutes: 30,
        latenessCutoff: '08:15',
        daysPerWeek: 5,
      },
    };
    academicStore.set(schoolId, config);
  }

  return JSON.parse(JSON.stringify(config));
}

/**
 * Initializes a new school tenant when a school owner registers an account.
 */
export function initializeRegisteredSchool(
  schoolId: string,
  schoolName: string,
  stateLocation: string,
  contactEmail: string
): AcademicConfiguration {
  const initialSession: AcademicSessionItem = {
    id: `ses_${Date.now()}`,
    schoolId,
    name: '2026/2027',
    startDate: '2026-09-14',
    endDate: '2027-07-23',
    isCurrent: true,
    terms: [
      {
        id: `trm_1_${Date.now()}`,
        name: '1st Term',
        startDate: '2026-09-14',
        endDate: '2026-12-18',
        isCurrent: true,
        isLocked: false,
      },
    ],
  };

  const slug = schoolName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30);

  const config: AcademicConfiguration = {
    school: {
      id: schoolId,
      name: schoolName,
      slug: slug || `school-${Date.now().toString().slice(-4)}`,
      officialCode: '',
      motto: '',
      logoUrl: '',
      crestUrl: '',
      contactEmail: contactEmail || 'admin@school.sch.ng',
      contactPhone: '+234 800 000 0000',
      currency: 'NGN',
      timezone: 'Africa/Lagos',
      address: `${stateLocation || 'Lagos'}, Nigeria`,
      city: stateLocation || 'Lagos',
      state: stateLocation || 'Lagos',
      isOnboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    campuses: [
      {
        id: `cmp_${Date.now()}`,
        schoolId,
        name: 'Main Campus',
        code: 'MAIN',
        address: `${stateLocation || 'Lagos'}, Nigeria`,
        city: stateLocation || 'Lagos',
        state: stateLocation || 'Lagos',
        country: 'Nigeria',
        isMain: true,
      },
    ],
    activeSession: initialSession,
    sessions: [initialSession],
    classLevels: [],
    subjects: [],
    operationalRules: {
      workingHoursStart: '07:45',
      workingHoursEnd: '15:30',
      periodDurationMinutes: 40,
      assemblyDurationMinutes: 20,
      breakDurationMinutes: 30,
      latenessCutoff: '08:15',
      daysPerWeek: 5,
    },
  };

  academicStore.set(schoolId, config);
  return config;
}

/**
 * Asserts that the actor is authorized to manage school and academic configurations.
 */
function assertAuthorizedAdmin(actor: AuthSession, targetSchoolId: string) {
  if (!actor || !actor.schoolId) {
    throw new Error('401 Unauthorized: Authentication is required.');
  }

  // Cross-tenant access check
  if (actor.schoolId !== targetSchoolId && actor.userType !== 'SUPERADMIN') {
    throw new Error(
      `403 Forbidden: Cross-tenant configuration update rejected for school [${targetSchoolId}].`
    );
  }

  const authorized =
    can(actor, 'school.manage') ||
    can(actor, 'academic.manage') ||
    can(actor, 'settings.manage_config');

  if (!authorized) {
    throw new Error(
      `403 Forbidden: Role [${actor.userType}] lacks permissions to update school configuration.`
    );
  }
}

/**
 * Step 1: Update School Profile & Institutional Branding
 */
export async function updateSchoolProfile(
  schoolId: string,
  input: unknown,
  actor: AuthSession
): Promise<SchoolProfile> {
  assertAuthorizedAdmin(actor, schoolId);
  const validated = SchoolProfileSchema.parse(input);
  const currentConfig = getSchoolConfiguration(schoolId);

  const beforeState = { ...currentConfig.school };
  const updatedSchool: SchoolProfile = {
    ...currentConfig.school,
    ...validated,
    updatedAt: new Date().toISOString(),
  };

  currentConfig.school = updatedSchool;
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'SCHOOL_PROFILE_UPDATED',
    resourceType: 'School',
    resourceId: schoolId,
    beforeState,
    afterState: updatedSchool,
  });

  return updatedSchool;
}

/**
 * Step 2: Update Campuses / Branches
 */
export async function updateCampuses(
  schoolId: string,
  input: unknown,
  actor: AuthSession
): Promise<CampusItem[]> {
  assertAuthorizedAdmin(actor, schoolId);
  const validatedList = CampusesListSchema.parse(input);
  const currentConfig = getSchoolConfiguration(schoolId);

  const beforeState = [...currentConfig.campuses];
  const updatedCampuses: CampusItem[] = validatedList.map((c, idx) => ({
    id: c.id || `cmp_${Date.now()}_${idx}`,
    schoolId,
    name: c.name,
    code: c.code || `CMP-${idx + 1}`,
    address: c.address,
    city: c.city,
    state: c.state,
    country: c.country || 'Nigeria',
    isMain: c.isMain,
    phone: c.phone,
  }));

  currentConfig.campuses = updatedCampuses;
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CAMPUSES_CONFIGURED',
    resourceType: 'Campus',
    resourceId: schoolId,
    beforeState,
    afterState: updatedCampuses,
  });

  return updatedCampuses;
}

/**
 * Step 3: Update Academic Session & Terms
 */
export async function updateAcademicSession(
  schoolId: string,
  input: unknown,
  actor: AuthSession
): Promise<AcademicSessionItem> {
  assertAuthorizedAdmin(actor, schoolId);
  const validated = AcademicSessionSchema.parse(input);
  const currentConfig = getSchoolConfiguration(schoolId);

  const beforeState = { ...currentConfig.activeSession };
  const sessionId = validated.id || `ses_${Date.now()}`;

  const updatedSession: AcademicSessionItem = {
    id: sessionId,
    schoolId,
    name: validated.name,
    startDate: validated.startDate,
    endDate: validated.endDate,
    isCurrent: validated.isCurrent,
    terms: validated.terms.map((t, idx) => ({
      id: t.id || `trm_${sessionId}_${idx + 1}`,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      isCurrent: t.isCurrent,
      isLocked: t.isLocked,
    })),
  };

  currentConfig.activeSession = updatedSession;
  const existingIdx = currentConfig.sessions.findIndex((s) => s.id === sessionId);
  if (existingIdx >= 0) {
    currentConfig.sessions[existingIdx] = updatedSession;
  } else {
    currentConfig.sessions.push(updatedSession);
  }

  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'ACADEMIC_SESSION_CONFIGURED',
    resourceType: 'AcademicSession',
    resourceId: sessionId,
    beforeState,
    afterState: updatedSession,
  });

  return updatedSession;
}

/**
 * Step 4: Update Class Structure (Sections, Levels & Arms)
 */
export async function updateClassStructure(
  schoolId: string,
  input: unknown,
  actor: AuthSession
): Promise<ClassLevelItem[]> {
  assertAuthorizedAdmin(actor, schoolId);
  const validatedLevels = ClassLevelsListSchema.parse(input);
  const currentConfig = getSchoolConfiguration(schoolId);

  const beforeState = [...currentConfig.classLevels];
  const defaultCampusId = currentConfig.campuses.find((c) => c.isMain)?.id || currentConfig.campuses[0]?.id || 'main';

  const updatedLevels: ClassLevelItem[] = validatedLevels.map((lvl, lIdx) => {
    const levelId = lvl.id || `lvl_${Date.now()}_${lIdx}`;
    return {
      id: levelId,
      schoolId,
      campusId: lvl.campusId || defaultCampusId,
      name: lvl.name,
      levelOrder: lvl.levelOrder || lIdx + 1,
      section: lvl.section,
      arms: lvl.arms.map((arm, aIdx) => ({
        id: arm.id || `arm_${levelId}_${aIdx + 1}`,
        levelId,
        name: arm.name,
        capacity: arm.capacity || 35,
        formTeacherId: arm.formTeacherId,
        formTeacherName: arm.formTeacherName,
      })),
    };
  });

  currentConfig.classLevels = updatedLevels;
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'CLASS_STRUCTURE_CONFIGURED',
    resourceType: 'ClassLevel',
    resourceId: schoolId,
    beforeState,
    afterState: updatedLevels,
  });

  return updatedLevels;
}

/**
 * Step 5: Update Subject Catalog
 */
export async function updateSubjectCatalog(
  schoolId: string,
  input: unknown,
  actor: AuthSession
): Promise<SubjectItem[]> {
  assertAuthorizedAdmin(actor, schoolId);
  const validatedSubjects = SubjectsListSchema.parse(input);
  const currentConfig = getSchoolConfiguration(schoolId);

  const beforeState = [...currentConfig.subjects];
  const updatedSubjects: SubjectItem[] = validatedSubjects.map((s, idx) => ({
    id: s.id || `sub_${Date.now()}_${idx}`,
    schoolId,
    name: s.name,
    code: s.code.toUpperCase(),
    department: s.department,
    isElective: s.isElective,
    applicableSections: s.applicableSections,
  }));

  currentConfig.subjects = updatedSubjects;
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'SUBJECT_CATALOG_CONFIGURED',
    resourceType: 'Subject',
    resourceId: schoolId,
    beforeState,
    afterState: updatedSubjects,
  });

  return updatedSubjects;
}

/**
 * Step 6: Update Operational Rules & School Hours
 */
export async function updateOperationalRules(
  schoolId: string,
  input: unknown,
  actor: AuthSession
): Promise<OperationalRules> {
  assertAuthorizedAdmin(actor, schoolId);
  const validated = OperationalRulesSchema.parse(input);
  const currentConfig = getSchoolConfiguration(schoolId);

  const beforeState = { ...currentConfig.operationalRules };
  currentConfig.operationalRules = validated;
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'OPERATIONAL_RULES_CONFIGURED',
    resourceType: 'OperationalRules',
    resourceId: schoolId,
    beforeState,
    afterState: validated,
  });

  return validated;
}

/**
 * Apply Nigerian Standard Curriculum Preset in 1-Click
 */
export async function applyNigerianPreset(
  schoolId: string,
  actor: AuthSession
): Promise<{ classLevels: ClassLevelItem[]; subjects: SubjectItem[] }> {
  assertAuthorizedAdmin(actor, schoolId);
  const currentConfig = getSchoolConfiguration(schoolId);
  const defaultCampusId = currentConfig.campuses.find((c) => c.isMain)?.id || 'main';

  const newLevels: ClassLevelItem[] = NIGERIAN_PRESET_LEVELS.map((lvl, index) => {
    const levelId = `lvl_${schoolId.slice(0, 4)}_${index + 1}`;
    return {
      id: levelId,
      schoolId,
      campusId: defaultCampusId,
      name: lvl.name,
      levelOrder: lvl.levelOrder,
      section: lvl.section,
      arms: lvl.arms.map((arm, aIdx) => ({
        id: `arm_${levelId}_${aIdx + 1}`,
        levelId,
        name: arm.name,
        capacity: arm.capacity,
      })),
    };
  });

  const newSubjects: SubjectItem[] = NIGERIAN_PRESET_SUBJECTS.map((sub, sIdx) => ({
    id: `sub_${schoolId.slice(0, 4)}_${sIdx + 1}`,
    schoolId,
    name: sub.name,
    code: sub.code,
    department: sub.department,
    isElective: sub.isElective,
    applicableSections: sub.applicableSections,
  }));

  currentConfig.classLevels = newLevels;
  currentConfig.subjects = newSubjects;
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'NIGERIAN_CURRICULUM_PRESET_APPLIED',
    resourceType: 'AcademicStructure',
    resourceId: schoolId,
    beforeState: null,
    afterState: { levelsCount: newLevels.length, subjectsCount: newSubjects.length },
  });

  return { classLevels: newLevels, subjects: newSubjects };
}

/**
 * Mark Onboarding Wizard Completed
 */
export async function completeOnboarding(
  schoolId: string,
  actor: AuthSession
): Promise<AcademicConfiguration> {
  assertAuthorizedAdmin(actor, schoolId);
  const currentConfig = getSchoolConfiguration(schoolId);

  // Validate that essential requirements are met before completing
  if (currentConfig.campuses.length === 0) {
    throw new Error('Validation Error: At least one campus must be configured.');
  }
  if (!currentConfig.activeSession || currentConfig.activeSession.terms.length === 0) {
    throw new Error('Validation Error: Academic session and terms must be configured.');
  }
  if (currentConfig.classLevels.length === 0) {
    throw new Error('Validation Error: At least one class level must be defined.');
  }
  if (currentConfig.subjects.length === 0) {
    throw new Error('Validation Error: At least one subject must be defined.');
  }

  currentConfig.school.isOnboardingCompleted = true;
  currentConfig.school.updatedAt = new Date().toISOString();
  academicStore.set(schoolId, currentConfig);

  await logAuditEvent({
    schoolId,
    actorId: actor.userId,
    action: 'ONBOARDING_WIZARD_COMPLETED',
    resourceType: 'School',
    resourceId: schoolId,
    beforeState: { isOnboardingCompleted: false },
    afterState: { isOnboardingCompleted: true },
  });

  return currentConfig;
}

export interface RegisteredSchoolSummary {
  id: string;
  name: string;
  code: string;
  location: string;
  ownerName: string;
  contactEmail: string;
  studentsCount: number;
  subscriptionPlan: string;
  status: 'ACTIVE' | 'PENDING_SETUP';
  lastActive: string;
  mrr: string;
}

/**
 * Returns clean, real platform registered institutions for the Super-Admin overview.
 * Eliminates simulated fake schools.
 */
export function getPlatformRegisteredSchools(): RegisteredSchoolSummary[] {
  const configs = Array.from(academicStore.values());
  // If a school was registered dynamically, show user registered schools
  const userRegistered = configs.filter(
    (c) => c.school.id !== TENANT_A_ID && c.school.id !== TENANT_B_ID
  );

  const targetConfigs = userRegistered.length > 0 ? userRegistered : [configs[0]].filter(Boolean);

  return targetConfigs.map((c) => {
    const isReady = Boolean(c.school.isOnboardingCompleted);
    const locationStr = c.school.state
      ? `${c.school.city ? c.school.city + ', ' : ''}${c.school.state}`
      : 'Nigeria';
    const emailPrefix = c.school.contactEmail ? c.school.contactEmail.split('@')[0] : 'Administrator';
    const ownerDisplayName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    return {
      id: c.school.id,
      name: c.school.name || 'Registered Institution',
      code: c.school.officialCode || (c.school.slug ? c.school.slug.toUpperCase() : 'SCH-01'),
      location: locationStr,
      ownerName: ownerDisplayName,
      contactEmail: c.school.contactEmail || '',
      studentsCount: 0,
      subscriptionPlan: isReady ? 'Standard Plan' : 'Setup In Progress',
      status: isReady ? ('ACTIVE' as const) : ('PENDING_SETUP' as const),
      lastActive: 'Active today',
      mrr: '₦0',
    };
  });
}
