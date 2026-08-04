'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '@/lib/api/tasks';
import { fetchTranscriptions } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queryKeys';
import { DashboardMetrics } from './metrics';
import { RecentTranscriptions } from './recentTranscriptions';
import { RecentTasks } from './recentTasks';

export const DashboardClient = () => {
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({ queryKey: queryKeys.tasks, queryFn: fetchTasks });
  const { data: transcripts = [], isLoading: transcriptsLoading } = useQuery({ queryKey: queryKeys.transcriptions, queryFn: fetchTranscriptions });

  if (tasksLoading || transcriptsLoading) return null;

  const totalTranscripts = transcripts.length;
  const totalTasks = tasks.length;
  const openTasks = tasks.filter((t) => t.status === 'open' || t.status === 'in-progress').length;
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' && t.status !== 'resolved').length;

  return (
    <div className="workspace-canvas flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
          Welcome to CXF Console
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
          Monitor your customer call transcripts and workspace tasks in real-time.
        </p>
      </div>

      <DashboardMetrics
        totalTranscripts={totalTranscripts}
        openTasks={openTasks}
        totalTasks={totalTasks}
        highPriorityTasks={highPriorityTasks}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <RecentTranscriptions transcripts={transcripts} />
        <RecentTasks tasks={tasks} />
      </div>
    </div>
  );
};
