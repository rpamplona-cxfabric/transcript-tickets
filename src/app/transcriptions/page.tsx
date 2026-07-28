import { getTranscripts, getTasks } from '../../lib/db';
import { TranscriptionsClient } from './_components/transcriptionsClient';

export const dynamic = 'force-dynamic';

export default async function TranscriptionsPage() {
  const transcripts = await getTranscripts();
  const tasks = await getTasks();

  return (
    <TranscriptionsClient initialTranscripts={transcripts} initialTasks={tasks} />
  );
}
