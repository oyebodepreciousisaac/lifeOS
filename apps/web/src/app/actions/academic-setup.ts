'use server';

import { getSession } from '../../lib/auth/session';
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
} from '../../lib/academic/academic-store';
import { AcademicConfiguration } from '../../lib/academic/academic-types';

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
}

async function getAuthenticatedActor() {
  const session = await getSession();
  if (!session) {
    throw new Error('401 Unauthorized: Please log in to configure school settings.');
  }
  return session;
}

export async function getAcademicConfigAction(): Promise<ActionResponse<AcademicConfiguration>> {
  try {
    const actor = await getAuthenticatedActor();
    const config = getSchoolConfiguration(actor.schoolId);
    return { success: true, data: config };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load school configuration.' };
  }
}

export async function getPublicSchoolConfigAction(
  schoolId: string = '11111111-1111-1111-1111-111111111111'
): Promise<ActionResponse<AcademicConfiguration>> {
  try {
    const config = getSchoolConfiguration(schoolId);
    return { success: true, data: config };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load school details.' };
  }
}

export async function saveSchoolProfileAction(data: unknown): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateSchoolProfile(actor.schoolId, data, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to update school profile.' };
  }
}

export async function saveCampusesAction(data: unknown): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateCampuses(actor.schoolId, data, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return { success: false, error: err.errors[0]?.message || 'Invalid campuses configuration.' };
    }
    return { success: false, error: err.message || 'Failed to update campuses.' };
  }
}

export async function saveAcademicSessionAction(data: unknown): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateAcademicSession(actor.schoolId, data, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return { success: false, error: err.errors[0]?.message || 'Invalid academic session.' };
    }
    return { success: false, error: err.message || 'Failed to update academic session.' };
  }
}

export async function saveClassStructureAction(data: unknown): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateClassStructure(actor.schoolId, data, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return { success: false, error: err.errors[0]?.message || 'Invalid class structure.' };
    }
    return { success: false, error: err.message || 'Failed to update class structure.' };
  }
}

export async function saveSubjectCatalogAction(data: unknown): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateSubjectCatalog(actor.schoolId, data, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return { success: false, error: err.errors[0]?.message || 'Invalid subject catalog.' };
    }
    return { success: false, error: err.message || 'Failed to update subject catalog.' };
  }
}

export async function saveOperationalRulesAction(data: unknown): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateOperationalRules(actor.schoolId, data, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return { success: false, error: err.errors[0]?.message || 'Invalid operational rules.' };
    }
    return { success: false, error: err.message || 'Failed to update operational rules.' };
  }
}

export async function applyNigerianPresetAction(): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await applyNigerianPreset(actor.schoolId, actor);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to apply curriculum preset.' };
  }
}

export async function completeOnboardingAction(): Promise<ActionResponse> {
  try {
    const actor = await getAuthenticatedActor();
    const config = await completeOnboarding(actor.schoolId, actor);
    return { success: true, data: config };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to complete onboarding.' };
  }
}
