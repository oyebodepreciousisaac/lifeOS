import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { listAiDrafts } from '@/lib/ai/ai-store';
import AssistiveAiClientPage from './AssistiveAiClientPage';

export const metadata = {
  title: 'Justified Assistive AI & Smart Automation | SchoolOS',
  description: 'Strictly human-governed AI assistant for teacher questions, lesson plans, parent progress narratives, and bursar payment advisories.',
};

export default async function AssistiveAiPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const initialDrafts = await listAiDrafts(session.schoolId, session);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <AssistiveAiClientPage session={session} initialDrafts={initialDrafts} />
    </div>
  );
}
