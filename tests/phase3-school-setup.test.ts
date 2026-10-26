import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getSchoolConfiguration,
  updateSchoolProfile,
  updateCampuses,
  updateAcademicSession,
  updateClassStructure,
  updateSubjectCatalog,
  updateOperationalRules,
  applyNigerianPreset,
  completeOnboarding,
} from '../apps/web/src/lib/academic/academic-store';
import { AuthSession } from '../apps/web/src/lib/auth/rbac';
import { inMemoryAuditStore } from '../apps/web/src/lib/audit/logger';

const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

// Actor Sessions
const ownerSessionA: AuthSession = {
  userId: 'usr_001',
  schoolId: TENANT_A_ID,
  email: 'owner@kingscollege.sch.ng',
  firstName: 'Otunba',
  lastName: 'Adeleke',
  userType: 'OWNER',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const principalSessionA: AuthSession = {
  userId: 'usr_002',
  schoolId: TENANT_A_ID,
  email: 'principal@kingscollege.sch.ng',
  firstName: 'Dr. Elizabeth',
  lastName: 'Alabi',
  userType: 'PRINCIPAL',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

const teacherSessionA: AuthSession = {
  userId: 'usr_004',
  schoolId: TENANT_A_ID,
  email: 'teacher@kingscollege.sch.ng',
  firstName: 'Joseph',
  lastName: 'Okafor',
  userType: 'TEACHER',
  isPrivileged: false,
  mfaVerified: false,
  expiresAt: Date.now() + 3600000,
};

const ownerSessionB: AuthSession = {
  userId: 'usr_b_001',
  schoolId: TENANT_B_ID,
  email: 'owner@premierabuja.ng',
  firstName: 'Alhaji',
  lastName: 'Mustapha',
  userType: 'OWNER',
  isPrivileged: true,
  mfaVerified: true,
  expiresAt: Date.now() + 3600000,
};

test('Phase 3.1: School Profile & Multi-Campus Management', async (t) => {
  await t.test('updates institutional profile with valid Nigerian credentials', async () => {
    const updated = await updateSchoolProfile(
      TENANT_A_ID,
      {
        name: "King's College Lagos (Federal)",
        slug: 'kings-college-lagos',
        officialCode: 'KCL-FED-1909',
        motto: 'Floreat Collegium',
        contactEmail: 'info@kingscollege.sch.ng',
        contactPhone: '+234 802 345 6789',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
        address: '3 Catholic Mission Street, Lagos Island',
        city: 'Lagos Island',
        state: 'Lagos',
      },
      ownerSessionA
    );

    assert.equal(updated.name, "King's College Lagos (Federal)");
    assert.equal(updated.currency, 'NGN');
    assert.equal(updated.timezone, 'Africa/Lagos');
  });

  await t.test('enforces exactly one Main Campus constraint', async () => {
    // Attempting to configure campuses without a main campus must fail
    await assert.rejects(
      async () => {
        await updateCampuses(
          TENANT_A_ID,
          [
            {
              name: 'Branch A',
              address: 'Address 1',
              city: 'Lagos',
              state: 'Lagos',
              country: 'Nigeria',
              isMain: false,
            },
            {
              name: 'Branch B',
              address: 'Address 2',
              city: 'Lagos',
              state: 'Lagos',
              country: 'Nigeria',
              isMain: false,
            },
          ],
          ownerSessionA
        );
      },
      /Exactly one campus must be designated as the Main Campus/
    );

    // Attempting to configure campuses with two main campuses must fail
    await assert.rejects(
      async () => {
        await updateCampuses(
          TENANT_A_ID,
          [
            {
              name: 'Branch A',
              address: 'Address 1',
              city: 'Lagos',
              state: 'Lagos',
              country: 'Nigeria',
              isMain: true,
            },
            {
              name: 'Branch B',
              address: 'Address 2',
              city: 'Lagos',
              state: 'Lagos',
              country: 'Nigeria',
              isMain: true,
            },
          ],
          ownerSessionA
        );
      },
      /Exactly one campus must be designated as the Main Campus/
    );
  });
});

test('Phase 3.2: Academic Session & Term Boundaries', async (t) => {
  await t.test('accepts valid 3-term academic session', async () => {
    const session = await updateAcademicSession(
      TENANT_A_ID,
      {
        name: '2026/2027',
        startDate: '2026-09-14',
        endDate: '2027-07-23',
        isCurrent: true,
        terms: [
          {
            name: '1st Term',
            startDate: '2026-09-14',
            endDate: '2026-12-18',
            isCurrent: true,
            isLocked: false,
          },
          {
            name: '2nd Term',
            startDate: '2027-01-11',
            endDate: '2027-04-09',
            isCurrent: false,
            isLocked: false,
          },
          {
            name: '3rd Term',
            startDate: '2027-04-26',
            endDate: '2027-07-23',
            isCurrent: false,
            isLocked: false,
          },
        ],
      },
      principalSessionA
    );

    assert.equal(session.name, '2026/2027');
    assert.equal(session.terms.length, 3);
    assert.equal(session.terms[0].isCurrent, true);
  });

  await t.test('rejects academic session with invalid date chronology', async () => {
    await assert.rejects(
      async () => {
        await updateAcademicSession(
          TENANT_A_ID,
          {
            name: '2026/2027',
            startDate: '2027-09-14', // Start date AFTER end date
            endDate: '2026-07-23',
            isCurrent: true,
            terms: [
              {
                name: '1st Term',
                startDate: '2027-09-14',
                endDate: '2027-12-18',
                isCurrent: true,
                isLocked: false,
              },
            ],
          },
          principalSessionA
        );
      },
      /Academic session start date must precede end date/
    );
  });
});

test('Phase 3.3: Class Hierarchy & Arms Configuration', async (t) => {
  await t.test('configures class levels across sections with arm capacities', async () => {
    const levels = await updateClassStructure(
      TENANT_A_ID,
      [
        {
          name: 'Primary 1',
          levelOrder: 1,
          section: 'PRIMARY',
          arms: [
            { name: 'Gold', capacity: 35 },
            { name: 'Diamond', capacity: 35 },
          ],
        },
        {
          name: 'JSS 1',
          levelOrder: 2,
          section: 'JUNIOR_SECONDARY',
          arms: [
            { name: 'Emerald', capacity: 40 },
            { name: 'Ruby', capacity: 40 },
          ],
        },
        {
          name: 'SSS 1',
          levelOrder: 3,
          section: 'SENIOR_SECONDARY',
          arms: [
            { name: 'Science', capacity: 35 },
            { name: 'Arts', capacity: 35 },
          ],
        },
      ],
      principalSessionA
    );

    assert.equal(levels.length, 3);
    assert.equal(levels[0].section, 'PRIMARY');
    assert.equal(levels[1].arms.length, 2);
    assert.equal(levels[1].arms[0].capacity, 40);
  });

  await t.test('rejects class level without arms', async () => {
    await assert.rejects(
      async () => {
        await updateClassStructure(
          TENANT_A_ID,
          [
            {
              name: 'JSS 2',
              levelOrder: 4,
              section: 'JUNIOR_SECONDARY',
              arms: [], // Empty arms
            },
          ],
          principalSessionA
        );
      },
      /Each class level must have at least one arm/
    );
  });
});

test('Phase 3.4: Subject Catalog & Departmental Mapping', async (t) => {
  await t.test('saves subject catalog and enforces unique subject codes', async () => {
    const subjects = await updateSubjectCatalog(
      TENANT_A_ID,
      [
        {
          name: 'Mathematics',
          code: 'MTH',
          department: 'Sciences',
          isElective: false,
          applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
        },
        {
          name: 'English Language',
          code: 'ENG',
          department: 'Languages',
          isElective: false,
          applicableSections: ['PRIMARY', 'JUNIOR_SECONDARY', 'SENIOR_SECONDARY'],
        },
        {
          name: 'French Language',
          code: 'FRN',
          department: 'Languages',
          isElective: true,
          applicableSections: ['SENIOR_SECONDARY'],
        },
      ],
      principalSessionA
    );

    assert.equal(subjects.length, 3);
    assert.equal(subjects[2].isElective, true);

    // Duplicate code test must fail
    await assert.rejects(
      async () => {
        await updateSubjectCatalog(
          TENANT_A_ID,
          [
            {
              name: 'Mathematics 1',
              code: 'MTH',
              department: 'Sciences',
              isElective: false,
              applicableSections: ['PRIMARY'],
            },
            {
              name: 'Mathematics 2',
              code: 'MTH', // Duplicate code!
              department: 'Sciences',
              isElective: false,
              applicableSections: ['JUNIOR_SECONDARY'],
            },
          ],
          principalSessionA
        );
      },
      /Subject codes must be unique across the school curriculum/
    );
  });
});

test('Phase 3.5: Operational Bell Schedule & Rules', async (t) => {
  await t.test('updates operational hours and lateness cutoff thresholds', async () => {
    const rules = await updateOperationalRules(
      TENANT_A_ID,
      {
        workingHoursStart: '07:45',
        workingHoursEnd: '15:30',
        periodDurationMinutes: 40,
        assemblyDurationMinutes: 20,
        breakDurationMinutes: 30,
        latenessCutoff: '08:15',
        daysPerWeek: 5,
      },
      principalSessionA
    );

    assert.equal(rules.workingHoursStart, '07:45');
    assert.equal(rules.latenessCutoff, '08:15');
    assert.equal(rules.periodDurationMinutes, 40);
  });
});

test('Phase 3.6: 1-Click Nigerian National Curriculum Preset Loader', async (t) => {
  await t.test('loads 14 class levels and 20 core subjects into Tenant B', async () => {
    const result = await applyNigerianPreset(TENANT_B_ID, ownerSessionB);

    assert.equal(result.classLevels.length, 14);
    assert.equal(result.subjects.length, 20);

    const config = getSchoolConfiguration(TENANT_B_ID);
    assert.equal(config.classLevels.length, 14);
    assert.equal(config.subjects.length, 20);

    // Complete onboarding for Tenant B
    const completed = await completeOnboarding(TENANT_B_ID, ownerSessionB);
    assert.equal(completed.school.isOnboardingCompleted, true);
  });
});

test('Phase 3.7: Security — Tenant Isolation & RBAC Protection', async (t) => {
  await t.test('rejects cross-tenant configuration tampering', async () => {
    // Tenant B owner attempts to tamper with Tenant A configuration
    await assert.rejects(
      async () => {
        await updateSchoolProfile(
          TENANT_A_ID,
          {
            name: 'Hacked School Name',
            slug: 'hacked-slug',
            contactEmail: 'hacker@tenantb.ng',
            contactPhone: '+234 800 000 0000',
            currency: 'NGN',
            timezone: 'Africa/Lagos',
            address: 'Hacker Address',
            city: 'Abuja',
            state: 'FCT',
          },
          ownerSessionB // Belongs to Tenant B!
        );
      },
      /403 Forbidden: Cross-tenant configuration update rejected/
    );
  });

  await t.test('rejects unauthorized roles (Teacher / Parent) from mutating configuration', async () => {
    // Teacher attempts to update school operational rules
    await assert.rejects(
      async () => {
        await updateOperationalRules(
          TENANT_A_ID,
          {
            workingHoursStart: '09:00',
            workingHoursEnd: '14:00',
            periodDurationMinutes: 30,
            assemblyDurationMinutes: 15,
            breakDurationMinutes: 45,
            latenessCutoff: '09:30',
            daysPerWeek: 4,
          },
          teacherSessionA // Teacher role lacks settings.manage
        );
      },
      /403 Forbidden: Role \[TEACHER\] lacks permissions/
    );
  });

  await t.test('verifies immutable audit logs created on configuration mutations', () => {
    const recentAuditEvents = inMemoryAuditStore.filter(
      (evt) =>
        evt.action === 'SCHOOL_PROFILE_UPDATED' ||
        evt.action === 'NIGERIAN_CURRICULUM_PRESET_APPLIED' ||
        evt.action === 'ONBOARDING_WIZARD_COMPLETED'
    );

    assert.ok(recentAuditEvents.length >= 3, 'Audit events must be recorded for academic setup actions');
    const presetEvent = recentAuditEvents.find((e) => e.action === 'NIGERIAN_CURRICULUM_PRESET_APPLIED');
    assert.ok(presetEvent, 'NIGERIAN_CURRICULUM_PRESET_APPLIED audit event must exist');
    assert.equal(presetEvent.schoolId, TENANT_B_ID);
  });
});
