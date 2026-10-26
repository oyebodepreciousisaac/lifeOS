import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getParentPortalData } from '@/lib/portals/portal-service';
import ParentPortalClient from './ParentPortalClient';

export const metadata = {
  title: 'Parent Portal | SchoolOS',
  description: 'Dedicated multi-child parent portal with real-time attendance, report cards, fee invoicing, and Paystack checkout.',
};

export default async function ParentPortalPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const initialData = await getParentPortalData(session.schoolId, session);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <ParentPortalClient session={session} initialData={initialData} />
    </div>
  );
}
