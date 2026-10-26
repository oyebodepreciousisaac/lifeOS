'use server';

import { getSession } from '../../lib/auth/session';
import {
  submitApplication,
  listApplications,
  getApplication,
  scoreApplication,
  issueOfferLetter,
  acceptOffer,
  convertApplicantToStudent,
  listStudents,
  getStudent,
  updateStudentProfile,
  transferStudentClassArm,
  importStudentsFromCsv,
  getSisDashboardMetrics,
} from '../../lib/sis/sis-store';
import {
  AdmissionApplication,
  StudentRecord,
  BatchImportResult,
  SisDashboardMetrics,
} from '../../lib/sis/sis-types';

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
// Admissions Funnel Actions
// ------------------------------------------------------------------------------

export async function submitPublicApplicationAction(
  schoolId: string,
  data: any
): Promise<ActionResponse<AdmissionApplication>> {
  try {
    const app = await submitApplication(schoolId, data);
    return { success: true, data: app };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Application form validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to submit application.' };
  }
}

export async function listApplicationsAction(
  filters: { status?: string; classLevelId?: string; search?: string } = {}
): Promise<ActionResponse<AdmissionApplication[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const apps = await listApplications(actor.schoolId, filters, actor);
    return { success: true, data: apps };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load applications.' };
  }
}

export async function getApplicationDetailAction(
  applicationId: string
): Promise<ActionResponse<AdmissionApplication>> {
  try {
    const actor = await getAuthenticatedActor();
    const app = await getApplication(actor.schoolId, applicationId, actor);
    if (!app) {
      return { success: false, error: 'Application not found.' };
    }
    return { success: true, data: app };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to retrieve application.' };
  }
}

export async function scoreApplicationAction(
  applicationId: string,
  scoringData: any
): Promise<ActionResponse<AdmissionApplication>> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await scoreApplication(actor.schoolId, applicationId, scoringData, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Scoring validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to record candidate scores.' };
  }
}

export async function issueOfferLetterAction(
  applicationId: string,
  offerData: any
): Promise<ActionResponse<AdmissionApplication>> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await issueOfferLetter(actor.schoolId, applicationId, offerData, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Offer letter validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to generate admission offer.' };
  }
}

export async function acceptOfferAction(
  applicationId: string
): Promise<ActionResponse<AdmissionApplication>> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await acceptOffer(actor.schoolId, applicationId, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to accept admission offer.' };
  }
}

export async function convertApplicantToStudentAction(
  applicationId: string,
  conversionData: any
): Promise<ActionResponse<StudentRecord>> {
  try {
    const actor = await getAuthenticatedActor();
    const student = await convertApplicantToStudent(
      actor.schoolId,
      applicationId,
      conversionData,
      actor
    );
    return { success: true, data: student };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Enrollment validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to enroll student.' };
  }
}

// ------------------------------------------------------------------------------
// Student Information System (SIS) Actions
// ------------------------------------------------------------------------------

export async function listStudentsAction(
  filters: {
    search?: string;
    classLevelId?: string;
    classArmId?: string;
    status?: string;
    gender?: string;
  } = {}
): Promise<ActionResponse<StudentRecord[]>> {
  try {
    const actor = await getAuthenticatedActor();
    const students = await listStudents(actor.schoolId, filters, actor);
    return { success: true, data: students };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load students.' };
  }
}

export async function getStudentDetailAction(
  studentId: string
): Promise<ActionResponse<StudentRecord>> {
  try {
    const actor = await getAuthenticatedActor();
    const student = await getStudent(actor.schoolId, studentId, actor);
    if (!student) {
      return { success: false, error: 'Student not found.' };
    }
    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to load student profile.' };
  }
}

export async function updateStudentProfileAction(
  studentId: string,
  updateData: any
): Promise<ActionResponse<StudentRecord>> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await updateStudentProfile(actor.schoolId, studentId, updateData, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Profile validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to update student profile.' };
  }
}

export async function transferStudentClassArmAction(
  studentId: string,
  transferData: any
): Promise<ActionResponse<StudentRecord>> {
  try {
    const actor = await getAuthenticatedActor();
    const updated = await transferStudentClassArm(actor.schoolId, studentId, transferData, actor);
    return { success: true, data: updated };
  } catch (err: any) {
    if (err.name === 'ZodError') {
      const fieldErrors: Record<string, string> = {};
      err.errors.forEach((e: any) => {
        fieldErrors[e.path.join('.')] = e.message;
      });
      return { success: false, error: 'Arm transfer validation failed.', fieldErrors };
    }
    return { success: false, error: err.message || 'Failed to transfer class arm.' };
  }
}

export async function importStudentsFromCsvAction(
  csvText: string,
  options: { dryRun?: boolean; currentTermId?: string } = {}
): Promise<ActionResponse<BatchImportResult>> {
  try {
    const actor = await getAuthenticatedActor();
    const result = await importStudentsFromCsv(actor.schoolId, csvText, options, actor);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message || 'Batch import failed.' };
  }
}

export async function getSisDashboardMetricsAction(): Promise<
  ActionResponse<SisDashboardMetrics>
> {
  try {
    const actor = await getAuthenticatedActor();
    const metrics = await getSisDashboardMetrics(actor.schoolId, actor);
    return { success: true, data: metrics };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to calculate SIS metrics.' };
  }
}
