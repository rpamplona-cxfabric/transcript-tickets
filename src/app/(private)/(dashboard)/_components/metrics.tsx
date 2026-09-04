'use client';

import { ArrowUpRight, FileAudio } from 'lucide-react';

interface DashboardMetricsProps {
  totalTranscripts: number;
  isLoading: boolean;
}

export const DashboardMetrics = ({ totalTranscripts, isLoading }: DashboardMetricsProps) => (
  <div className="mb-6 sm:mb-8">
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm  hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500" />
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Transcriptions</span>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">All call records available in your workspace</p>
        </div>
        <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
          <FileAudio className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-9 w-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" aria-label="Loading total transcriptions" />
        ) : (
          <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{totalTranscripts}</span>
        )}
        <span className="flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/30">
          <ArrowUpRight className="mr-0.5 h-3 w-3" /> Synchronized
        </span>
      </div>
    </div>
  </div>
);
