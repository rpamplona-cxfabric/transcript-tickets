'use client';

import { FileAudio, CheckSquare, AlertTriangle, Activity, ArrowUpRight } from 'lucide-react';

interface DashboardMetricsProps {
  totalTranscripts: number;
  openTasks: number;
  totalTasks: number;
  highPriorityTasks: number;
}

export const DashboardMetrics = ({
  totalTranscripts,
  openTasks,
  totalTasks,
  highPriorityTasks
}: DashboardMetricsProps) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Transcriptions</span>
          <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
            <FileAudio className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{totalTranscripts}</span>
          <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
            <ArrowUpRight className="h-3 w-3 mr-0.5" /> Synchronized
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Tasks</span>
          <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
            <CheckSquare className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{openTasks}</span>
          <span className="text-xs text-zinc-550 font-medium">out of {totalTasks} total</span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Urgent Tasks</span>
          <div className="rounded-xl bg-red-50 p-2.5 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors dark:bg-red-950/20 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{highPriorityTasks}</span>
          <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-md">
            Immediate action
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">System Connection</span>
          <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-950/20 dark:text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-zinc-900 dark:text-white">Active</span>
          <span className="text-xs text-zinc-550 font-medium">Online</span>
        </div>
      </div>
    </div>
  );
};
