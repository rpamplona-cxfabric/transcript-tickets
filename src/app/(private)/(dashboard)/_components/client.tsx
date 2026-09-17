'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { fetchTranscriptions } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queries/queryKeys';
import { DashboardMetrics } from './metrics';
import { RecentTranscriptions } from './recentTranscriptions';

export const DashboardClient = () => {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.transcriptionsList({ page: 1, limit: 3 }),
    queryFn: () => fetchTranscriptions({ page: 1, limit: 3 }),
  });

  const transcripts = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="workspace-canvas flex-1">
      <main className="w-full">
        <section className="app-surface app-shadow-surface relative mb-4 overflow-hidden rounded-3xl border border-zinc-200 px-6 py-8 dark:border-zinc-800 sm:px-8 sm:py-10">
          <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-400/15" />
          <div className="absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-400/10" />
          <div className="relative max-w-xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs lg:text-sm font-semibold text-emerald-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-200">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
              CXF CALL INTELLIGENCE
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">Your call workspace</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
              Review recent conversations, surface what matters, and keep every follow-up moving.
            </p>
            <Link
              href="/transcriptions"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Browse transcriptions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <DashboardMetrics totalTranscripts={total} isLoading={isLoading} />
        <RecentTranscriptions transcripts={transcripts} isLoading={isLoading} />
      </main>
    </div>
  );
};
