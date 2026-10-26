'use server';

import { redirect } from 'next/navigation';
import { createSession } from '@/lib/auth/session';
import { logAuditEvent, logSecurityEvent } from '@/lib/audit/logger';

export interface SignUpState {
  error?: string;
  success?: boolean;
  message?: string;
}

/**
 * Server Action: Institutional Multi-Role Sign Up & Activation
 */
export async function signupAction(
  _prevState: SignUpState | null,
  formData: FormData
): Promise<SignUpState> {
  const roleType = formData.get('roleType') as string;
  const fullName = (formData.get('fullName') as string)?.trim();
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    return { error: 'Full name, email address, and secure password are required.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long for institutional security.' };
  }

  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || 'Account';

  // 1. SCHOOL OWNER / INSTITUTION REGISTRATION
  if (roleType === 'OWNER') {
    const schoolName = (formData.get('schoolName') as string)?.trim();
    const stateLocation = (formData.get('stateLocation') as string)?.trim();

    if (!schoolName) {
      return { error: 'Institution / School name is required.' };
    }

    const newSchoolId = `sch_${schoolName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}_${Date.now().toString().slice(-4)}`;

    await createSession({
      userId: `usr_owner_${Date.now()}`,
      schoolId: newSchoolId,
      campusId: `cmp_main_${newSchoolId}`,
      email,
      firstName,
      lastName,
      userType: 'OWNER',
      mfaVerified: true,
    });

    await logAuditEvent({
      schoolId: newSchoolId,
      actorId: `usr_owner_${email}`,
      action: 'ORGANIZATION_REGISTERED',
      resourceType: 'School',
      resourceId: newSchoolId,
    });

    redirect('/dashboard');
  }

  // 2. TEACHER INVITATION ACTIVATION
  if (roleType === 'TEACHER') {
    const staffCode = (formData.get('staffCode') as string)?.trim();
    if (!staffCode) {
      return { error: 'Institutional Staff Identification Code is required.' };
    }

    // Default to active institutional tenant
    const schoolId = 'sch_kcl_001';

    await createSession({
      userId: `usr_teacher_${Date.now()}`,
      schoolId,
      campusId: 'cmp_vi_001',
      email,
      firstName,
      lastName,
      userType: 'TEACHER',
      mfaVerified: true,
    });

    await logAuditEvent({
      schoolId,
      actorId: `usr_teacher_${email}`,
      action: 'TEACHER_ACCOUNT_ACTIVATED',
      resourceType: 'User',
      resourceId: email,
    });

    redirect('/portal/teacher');
  }

  // 3. PARENT WARD LINKING
  if (roleType === 'PARENT') {
    const studentAdmissionNumber = (formData.get('admissionNumber') as string)?.trim();
    const phone = (formData.get('phone') as string)?.trim();

    if (!studentAdmissionNumber || !phone) {
      return { error: "Ward's Student Admission Number and primary phone number are required." };
    }

    const schoolId = 'sch_kcl_001';

    await createSession({
      userId: `usr_parent_${Date.now()}`,
      schoolId,
      campusId: 'cmp_vi_001',
      email,
      firstName,
      lastName,
      userType: 'PARENT',
      mfaVerified: true,
    });

    await logAuditEvent({
      schoolId,
      actorId: `usr_parent_${email}`,
      action: 'PARENT_PORTAL_REGISTERED',
      resourceType: 'Guardian',
      resourceId: email,
    });

    redirect('/portal/parent');
  }

  // 4. STUDENT PORTAL ACTIVATION
  if (roleType === 'STUDENT') {
    const admissionNumber = (formData.get('admissionNumber') as string)?.trim();
    if (!admissionNumber) {
      return { error: 'Your official Student Admission Number is required.' };
    }

    const schoolId = 'sch_kcl_001';

    await createSession({
      userId: `usr_student_${Date.now()}`,
      schoolId,
      campusId: 'cmp_vi_001',
      email,
      firstName,
      lastName,
      userType: 'STUDENT',
      mfaVerified: true,
    });

    await logAuditEvent({
      schoolId,
      actorId: `usr_student_${email}`,
      action: 'STUDENT_PORTAL_ACTIVATED',
      resourceType: 'Student',
      resourceId: admissionNumber,
    });

    redirect('/portal/student');
  }

  return { error: 'Please select a valid institutional registration profile.' };
}
