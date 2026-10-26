import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  getGovernanceRequests,
  getGovernanceMetrics,
} from '@/lib/governance/governance-store';
import GovernanceClientPage from './GovernanceClientPage';

export const metadata = {
  title: 'Maker-Checker Governance Engine | SchoolOS',
  description: 'Dual-control approval queue for score alterations, fee reversals, and institutional mutations.',
};

export default async function GovernancePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Dual-control governance requires privileged role or authorized staff
  const initialRequests = await getGovernanceRequests(session.schoolId, session);
  const metrics = await getGovernanceMetrics(session.schoolId, session);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <GovernanceClientPage
        session={session}
        initialRequests={initialRequests}
        metrics={metrics}
      />
    </div>
  );
}
