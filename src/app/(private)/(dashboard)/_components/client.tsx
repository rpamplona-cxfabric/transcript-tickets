'use client';

import { useTaskStore } from '@/lib/store/tasks';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { DashboardMetrics } from './metrics';
import { RecentTranscriptions } from './recentTranscriptions';
import { RecentTasks } from './recentTasks';

export const DashboardClient = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const isTasksReady = useTaskStore((state) => state.isReady);
  const transcripts = useTranscriptionStore((state) => state.transcripts);
  const isTranscriptionsReady = useTranscriptionStore((state) => state.isReady);

  if (!isTasksReady || !isTranscriptionsReady) {
    return null;
  }

  const totalTranscripts = transcripts.length;
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'resolved').length;

  return (
    <div className="workspace-canvas flex-1 overflow-y-auto p-6 md:p-8">
      <div className="flex flex-col gap-1 mb-8">
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
