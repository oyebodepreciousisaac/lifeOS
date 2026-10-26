import * as React from 'react';
import { requireAuth } from '@/lib/auth/session';
import { DEMO_USERS } from '@/lib/auth/demo-users';
import AdminShell from '@/components/navigation/AdminShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();
  const userConfig = DEMO_USERS[session.email] || {
    schoolName: 'Apex Model College, Lagos',
  };

  return (
    <AdminShell
      session={{
        firstName: session.firstName,
        lastName: session.lastName,
        userType: session.userType,
        email: session.email,
        schoolId: session.schoolId,
      }}
      schoolName={userConfig.schoolName}
    >
      {children}
    </AdminShell>
  );
}
