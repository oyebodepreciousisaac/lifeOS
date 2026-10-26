import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import {
  listClinicVisits,
  listTransportRoutes,
  listExeatPasses,
  listLibraryBooks,
  listBookLoans,
  listFixedAssets,
  listPtaProjects,
  listPtaContributions,
  getAuxiliaryMetrics,
} from '@/lib/auxiliary/auxiliary-store';
import AuxiliaryClientPage from './AuxiliaryClientPage';

export const metadata = {
  title: 'School Auxiliary Operations & Community | SchoolOS',
  description: 'Campus clinic, bus transport fleet, hostel & digital exeats, library circulation, fixed assets, and PTA levies.',
};

export default async function AuxiliaryPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const [
    initialClinicVisits,
    initialRoutes,
    initialExeats,
    initialBooks,
    initialLoans,
    initialAssets,
    initialPta,
    initialContributions,
    metrics,
  ] = await Promise.all([
    listClinicVisits(session.schoolId, session),
    listTransportRoutes(session.schoolId, session),
    listExeatPasses(session.schoolId, session),
    listLibraryBooks(session.schoolId, session),
    listBookLoans(session.schoolId, session),
    listFixedAssets(session.schoolId, session),
    listPtaProjects(session.schoolId, session),
    listPtaContributions(session.schoolId, session),
    getAuxiliaryMetrics(session.schoolId, session),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <AuxiliaryClientPage
        session={session}
        initialClinicVisits={initialClinicVisits}
        initialRoutes={initialRoutes}
        initialExeats={initialExeats}
        initialBooks={initialBooks}
        initialLoans={initialLoans}
        initialAssets={initialAssets}
        initialPta={initialPta}
        initialContributions={initialContributions}
        metrics={metrics}
      />
    </div>
  );
}
