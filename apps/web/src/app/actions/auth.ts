'use server';

import { redirect } from 'next/navigation';
import { createSession, destroySession, getSession } from '@/lib/auth/session';
import { verifyTotpToken } from '@/lib/auth/mfa';
import { isPrivilegedRole } from '@/lib/auth/rbac';
import { logAuditEvent, logSecurityEvent } from '@/lib/audit/logger';
import { DEMO_USERS } from '@/lib/auth/demo-users';

function getRoleDestination(role: string): string {
  switch (role) {
    case 'PARENT':
      return '/portal/parent';
    case 'TEACHER':
      return '/portal/teacher';
    case 'STUDENT':
      return '/portal/student';
    case 'BURSAR':
      return '/admin/finance';
    default:
      return '/dashboard';
  }
}

export interface AuthState {
  error?: string;
  success?: boolean;
  requiresMfa?: boolean;
}

/**
 * Server Action: Validates credentials and creates session
 */
export async function loginAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get('email') as string)?.toLowerCase().trim();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Both email and password are required.' };
  }

  const user = DEMO_USERS[email];
  if (!user || password !== 'SchoolOS@2026') {
    await logSecurityEvent({
      schoolId: user?.schoolId || 'global',
      eventType: 'AUTH_FAILED_LOGIN',
      severity: 'MEDIUM',
      details: { email, timestamp: new Date().toISOString() },
    });
    return { error: 'Invalid institutional credentials. Please re-check email and password.' };
  }

  const isPrivileged = isPrivilegedRole(user.role);

  // If role is privileged (Owner, Principal, Bursar), MFA is mandatory
  if (isPrivileged) {
    await createSession({
      userId: `usr_${user.role.toLowerCase()}`,
      schoolId: user.schoolId,
      campusId: user.campusId,
      email: user.email,
      firstName: user.name.split(' ')[0],
      lastName: user.name.split(' ').slice(1).join(' '),
      userType: user.role,
      mfaVerified: false, // Flagged pending MFA verification!
    });

    await logAuditEvent({
      schoolId: user.schoolId,
      actorId: `usr_${user.role.toLowerCase()}`,
      action: 'AUTH_LOGIN_CHALLENGE_ISSUED',
      resourceType: 'User',
      resourceId: user.email,
    });

    redirect('/mfa-challenge');
  }

  // Non-privileged roles (Teacher, Parent, Student) gain direct verified session
  await createSession({
    userId: `usr_${user.role.toLowerCase()}`,
    schoolId: user.schoolId,
    campusId: user.campusId,
    email: user.email,
    firstName: user.name.split(' ')[0],
    lastName: user.name.split(' ').slice(1).join(' '),
    userType: user.role,
    mfaVerified: true,
  });

  await logAuditEvent({
    schoolId: user.schoolId,
    actorId: `usr_${user.role.toLowerCase()}`,
    action: 'AUTH_LOGIN_SUCCESS',
    resourceType: 'User',
    resourceId: user.email,
  });

  redirect(getRoleDestination(user.role));
}

/**
 * Server Action: Verifies 6-digit TOTP code for privileged accounts
 */
export async function verifyMfaAction(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const code = (formData.get('code') as string)?.trim();
  const session = await getSession();

  if (!session) {
    return { error: 'Session expired. Please log in again.' };
  }

  if (!code || code.length !== 6) {
    return { error: 'Please enter a valid 6-digit authentication code.' };
  }

  const user = DEMO_USERS[session.email];
  const secret = user?.mfaSecret || 'JBSWY3DPEHPK3PXP';

  // Test code '123456' allowed for seamless testing, alongside real RFC 6238 TOTP verification
  const isValidTotp = code === '123456' || verifyTotpToken(code, secret);

  if (!isValidTotp) {
    await logSecurityEvent({
      schoolId: session.schoolId,
      eventType: 'AUTH_MFA_FAILED',
      severity: 'HIGH',
      details: { email: session.email, attemptedCode: '******' },
    });
    return { error: 'Invalid or expired authentication code. Please check your authenticator app.' };
  }

  // Upgrade session to mfaVerified: true
  await createSession({
    userId: session.userId,
    schoolId: session.schoolId,
    campusId: session.campusId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    userType: session.userType,
    mfaVerified: true, // Verification granted!
  });

  await logAuditEvent({
    schoolId: session.schoolId,
    actorId: session.userId,
    action: 'AUTH_MFA_VERIFIED',
    resourceType: 'Session',
    resourceId: session.email,
  });

  redirect(getRoleDestination(session.userType));
}

/**
 * Server Action: Logs user out and purges session cookie
 */
export async function logoutAction(): Promise<void> {
  const session = await getSession();
  if (session) {
    await logAuditEvent({
      schoolId: session.schoolId,
      actorId: session.userId,
      action: 'AUTH_LOGOUT',
      resourceType: 'Session',
      resourceId: session.email,
    });
  }
  await destroySession();
  redirect('/login');
}
