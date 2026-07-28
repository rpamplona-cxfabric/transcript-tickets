import { getTasks, getTranscripts } from '@/lib/db';
import { StoreInitializer } from '@/components/storeInitializer';

export const dynamic = 'force-dynamic';

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const tasks = await getTasks();
  const transcripts = await getTranscripts();

  return (
    <StoreInitializer tasks={tasks} transcripts={transcripts}>
      {children}
    </StoreInitializer>
  );
}
