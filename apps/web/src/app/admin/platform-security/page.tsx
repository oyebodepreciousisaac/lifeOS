import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  listSnapshots,
  listBackupDrillReports,
  listGuardianConsents,
  listPlatformTenants,
  getPlatformHealthMetrics,
} from '@/lib/platform-security/platform-security-store';
import PlatformSecurityClientPage from './PlatformSecurityClientPage';

export const metadata = {
  title: 'Platform Security, Disaster Recovery & NDPA 2023 | SchoolOS',
  description: 'Automated backup restore drills (RPO ≤ 15m, RTO ≤ 60m), NDPA Section 34 student data portability, and SaaS multi-tenancy controls.',
};

export default async function PlatformSecurityPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const [
    initialSnapshots,
    initialDrills,
    initialConsents,
    tenants,
    healthMetrics,
  ] = await Promise.all([
    listSnapshots(session.schoolId, session),
    listBackupDrillReports(session.schoolId, session),
    listGuardianConsents(session.schoolId, session),
    listPlatformTenants(session),
    getPlatformHealthMetrics(session),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <PlatformSecurityClientPage
        session={session}
        initialSnapshots={initialSnapshots}
        initialDrills={initialDrills}
        initialConsents={initialConsents}
        tenants={tenants}
        healthMetrics={healthMetrics}
      />
    </div>
  );
}
