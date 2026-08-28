'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTranscriptions } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queries/queryKeys';
import { DashboardMetrics } from './metrics';
import { RecentTranscriptions } from './recentTranscriptions';

export const DashboardClient = () => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.transcriptionsList({ page: 1, limit: 3 }),
    queryFn: () => fetchTranscriptions({ page: 1, limit: 3 }),
  });

  if (isLoading) return null;

  const transcripts = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="workspace-canvas flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
          Welcome to CXF Console
        </h1>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-450">
          Monitor your customer call transcripts in real-time.
        </p>
      </div>

      <DashboardMetrics totalTranscripts={total} />
      <RecentTranscriptions transcripts={transcripts} />
    </div>
  );
};
