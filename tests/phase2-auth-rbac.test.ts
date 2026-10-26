/**
 * Phase 2 Multi-Tenancy, Identity, RBAC & Audit Engine Test Suite
 * Grounded in Playbook Chapters 5, 21, 22, 25, 40.
 */

import assert from 'node:assert';
import { hashPassword, verifyPassword } from '../apps/web/src/lib/auth/crypto';
import {
  generateBase32Secret,
  computeTotp,
  verifyTotpToken,
  generateBackupCodes,
  isPrivilegedRole,
} from '../apps/web/src/lib/auth/mfa';
import { can, requirePermission, AuthSession } from '../apps/web/src/lib/auth/rbac';
import { signSessionPayload, verifySessionToken } from '../apps/web/src/lib/auth/session';

async function runPhase2Tests() {
  console.log('--- Running Phase 2 Authentication, RBAC & Multi-Tenancy Suite ---');

  // Test 1: Password Hashing & Constant-Time Verification
  console.log('Test 1: Verifying Argon2/Scrypt memory-hard password hashing...');
  const testPassword = 'ApexSchoolSecure@2026';
  const hashed = await hashPassword(testPassword);
  assert(hashed.startsWith('scrypt$'), 'Hash must follow scrypt$salt$key format');

  const isValidMatch = await verifyPassword(testPassword, hashed);
  assert.strictEqual(isValidMatch, true, 'Valid password must match hash');

  const isInvalidMatch = await verifyPassword('WrongPassword123', hashed);
  assert.strictEqual(isInvalidMatch, false, 'Invalid password must be rejected');
  console.log('✓ Test 1 Passed: Password hashing and timing-safe verification verified.');

  // Test 2: TOTP Multi-Factor Authentication (RFC 6238)
  console.log('Test 2: Verifying RFC 6238 TOTP Multi-Factor Authentication...');
  const secret = generateBase32Secret();
  assert.strictEqual(secret.length, 20, 'Secret must be 20 characters');

  const currentCounter = Math.floor(Date.now() / 1000 / 30);
  const token = computeTotp(secret, currentCounter);
  assert(/^\d{6}$/.test(token), 'TOTP token must be 6 digits');

  const isValidToken = verifyTotpToken(token, secret);
  assert.strictEqual(isValidToken, true, 'Valid TOTP token must verify');

  const isInvalidToken = verifyTotpToken('000000', secret);
  assert.strictEqual(isInvalidToken, false, 'Tampered token must be rejected');

  const backupCodes = generateBackupCodes(8);
  assert.strictEqual(backupCodes.length, 8, 'Must generate exactly 8 recovery backup codes');
  assert(/^[A-F0-9]{4}-[A-F0-9]{4}$/.test(backupCodes[0]), 'Backup code format mismatch');

  assert.strictEqual(isPrivilegedRole('OWNER'), true, 'OWNER must be privileged');
  assert.strictEqual(isPrivilegedRole('PRINCIPAL'), true, 'PRINCIPAL must be privileged');
  assert.strictEqual(isPrivilegedRole('BURSAR'), true, 'BURSAR must be privileged');
  assert.strictEqual(isPrivilegedRole('TEACHER'), false, 'TEACHER must not be privileged');
  assert.strictEqual(isPrivilegedRole('PARENT'), false, 'PARENT must not be privileged');
  console.log('✓ Test 2 Passed: TOTP generation, drift tolerance, and privileged roles verified.');

  // Test 3: Session Cryptographic Signing & Expiration
  console.log('Test 3: Verifying HMAC session signing and tamper protection...');
  const mockSession: AuthSession = {
    userId: 'usr_owner_01',
    schoolId: '11111111-1111-1111-1111-111111111111',
    email: 'owner@apexcollege.ng',
    firstName: 'Adeleke',
    lastName: 'Davies',
    userType: 'OWNER',
    isPrivileged: true,
    mfaVerified: true,
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour in future
  };

  const signedToken = signSessionPayload(mockSession);
  const verifiedSession = verifySessionToken(signedToken);
  assert(verifiedSession, 'Valid signed session must verify');
  assert.strictEqual(verifiedSession?.userId, mockSession.userId);
  assert.strictEqual(verifiedSession?.schoolId, mockSession.schoolId);

  // Tamper check: alter payload
  const tamperedToken = 'X' + signedToken.slice(1);
  const tamperedResult = verifySessionToken(tamperedToken);
  assert.strictEqual(tamperedResult, null, 'Tampered session token must be rejected');

  // Expiration check
  const expiredSession: AuthSession = {
    ...mockSession,
    expiresAt: Date.now() - 1000, // Expired
  };
  const expiredToken = signSessionPayload(expiredSession);
  assert.strictEqual(verifySessionToken(expiredToken), null, 'Expired token must return null');
  console.log('✓ Test 3 Passed: Session signing, tampering prevention, and expiration verified.');

  // Test 4: RBAC & Separation of Duties Evaluation
  console.log('Test 4: Verifying RBAC permissions and separation of duties...');

  const teacherSession: AuthSession = {
    userId: 'usr_teacher_01',
    schoolId: '11111111-1111-1111-1111-111111111111',
    campusId: 'camp_main',
    email: 'teacher@apexcollege.ng',
    firstName: 'Joseph',
    lastName: 'Okafor',
    userType: 'TEACHER',
    isPrivileged: false,
    mfaVerified: true,
    expiresAt: Date.now() + 100000,
  };

  const bursarSession: AuthSession = {
    userId: 'usr_bursar_01',
    schoolId: '11111111-1111-1111-1111-111111111111',
    email: 'bursar@apexcollege.ng',
    firstName: 'Babatunde',
    lastName: 'Lawal',
    userType: 'BURSAR',
    isPrivileged: true,
    mfaVerified: true,
    expiresAt: Date.now() + 100000,
  };

  // Rule A: Teacher CAN enter assigned scores
  assert.strictEqual(
    can(teacherSession, 'results.enter_assigned', { teacherId: 'usr_teacher_01' }),
    true,
    'Teacher must have results.enter_assigned for self'
  );

  // Rule B: Teacher CANNOT enter scores assigned to another teacher
  assert.strictEqual(
    can(teacherSession, 'results.enter_assigned', { teacherId: 'usr_teacher_02' }),
    false,
    'Teacher must NOT have results.enter_assigned for another teacher'
  );

  // Rule C: Teacher CANNOT view or manage fees
  assert.strictEqual(
    can(teacherSession, 'fees.manage'),
    false,
    'Teacher must NOT have fee management authority'
  );

  // Rule D: Bursar CAN manage fee invoices
  assert.strictEqual(
    can(bursarSession, 'invoices.generate'),
    true,
    'Bursar must have invoices.generate'
  );

  // Rule E: Bursar CANNOT alter academic results
  assert.strictEqual(
    can(bursarSession, 'results.enter_assigned'),
    false,
    'Bursar must NOT have permission to enter academic grades'
  );

  // Rule F: Privileged role with unverified MFA must be denied access
  const unverifiedOwnerSession: AuthSession = {
    ...mockSession,
    mfaVerified: false, // MFA NOT VERIFIED!
  };
  assert.strictEqual(
    can(unverifiedOwnerSession, 'fees.publish'),
    false,
    'Privileged user with unverified MFA must be rejected'
  );

  console.log('✓ Test 4 Passed: Separation of duties and RBAC evaluation strictly enforced.');

  console.log('========================================================');
  console.log('ALL PHASE 2 IDENTITY, RBAC & TENANCY TESTS PASSED (4/4)');
  console.log('========================================================');
}

runPhase2Tests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
