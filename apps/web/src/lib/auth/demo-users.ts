import { UserRoleType } from './rbac';

export interface DemoUser {
  email: string;
  name: string;
  role: UserRoleType;
  schoolId: string;
  schoolName: string;
  campusId?: string;
  mfaSecret?: string;
}

export const DEMO_USERS: Record<string, DemoUser> = {
  'owner@apexcollege.ng': {
    email: 'owner@apexcollege.ng',
    name: 'Chief Adeleke Davies',
    role: 'OWNER',
    schoolId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Apex Model College, Lagos',
    mfaSecret: 'JBSWY3DPEHPK3PXP', // Standard base32 demo secret
  },
  'principal@apexcollege.ng': {
    email: 'principal@apexcollege.ng',
    name: 'Dr. Elizabeth Alabi',
    role: 'PRINCIPAL',
    schoolId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Apex Model College, Lagos',
    mfaSecret: 'JBSWY3DPEHPK3PXP',
  },
  'bursar@apexcollege.ng': {
    email: 'bursar@apexcollege.ng',
    name: 'Mr. Babatunde Lawal',
    role: 'BURSAR',
    schoolId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Apex Model College, Lagos',
    mfaSecret: 'JBSWY3DPEHPK3PXP',
  },
  'teacher@apexcollege.ng': {
    email: 'teacher@apexcollege.ng',
    name: 'Mr. Joseph Okafor',
    role: 'TEACHER',
    schoolId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Apex Model College, Lagos',
    campusId: 'camp_vi_main',
  },
  'parent@apexcollege.ng': {
    email: 'parent@apexcollege.ng',
    name: 'Mrs. Ngozi Adeleke',
    role: 'PARENT',
    schoolId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Apex Model College, Lagos',
  },
  'student@apexcollege.ng': {
    email: 'student@apexcollege.ng',
    name: 'Chidubem Emmanuel Adeleke',
    role: 'STUDENT',
    schoolId: '11111111-1111-1111-1111-111111111111',
    schoolName: 'Apex Model College, Lagos',
    campusId: 'camp_vi_main',
  },
  'owner@premierabuja.ng': {
    email: 'owner@premierabuja.ng',
    name: 'Alhaji Ibrahim Danjuma',
    role: 'OWNER',
    schoolId: '22222222-2222-2222-2222-222222222222', // Distinct tenant!
    schoolName: 'Premier Academy Abuja',
    mfaSecret: 'JBSWY3DPEHPK3PXP',
  },
  'superadmin@squareos.com': {
    email: 'superadmin@squareos.com',
    name: 'Oyebode Precious',
    role: 'SUPERADMIN',
    schoolId: 'global',
    schoolName: 'SquareOS Multi-School Platform',
    mfaSecret: 'JBSWY3DPEHPK3PXP',
  },
};
