'use client';

import { Activity, ArrowUpRight, FileAudio } from 'lucide-react';

interface DashboardMetricsProps {
  totalTranscripts: number;
}

export const DashboardMetrics = ({ totalTranscripts }: DashboardMetricsProps) => (
  <div className="mb-8 grid gap-6 sm:grid-cols-2">
    <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Transcriptions</span>
        <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 transition-colors group-hover:bg-zinc-900 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
          <FileAudio className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{totalTranscripts}</span>
        <span className="flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/30">
          <ArrowUpRight className="mr-0.5 h-3 w-3" /> Synchronized
        </span>
      </div>
    </div>

    <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">System Connection</span>
        <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950/20 dark:text-emerald-400">
          <Activity className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-lg font-semibold text-zinc-900 dark:text-white">Active</span>
        <span className="text-xs font-medium text-zinc-550">Online</span>
      </div>
    </div>
  </div>
);
