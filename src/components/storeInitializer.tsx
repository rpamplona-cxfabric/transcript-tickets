'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTaskStore } from '@/lib/store/tasks';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { fetchTasks } from '@/lib/api/tasks';
import { fetchTranscriptions } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queryKeys';

export const StoreInitializer = ({ children }: { children: React.ReactNode }) => {
  const tasksQuery = useQuery({ queryKey: queryKeys.tasks, queryFn: fetchTasks });
  const transcriptionsQuery = useQuery({ queryKey: queryKeys.transcriptions, queryFn: fetchTranscriptions });

  const setTasks = useTaskStore((s) => s.setTasks);
  const setTranscriptions = useTranscriptionStore((s) => s.setTranscripts);
  const setTranscriptionTasks = useTranscriptionStore((s) => s.setTasks);

  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(tasksQuery.data);
      setTranscriptionTasks(tasksQuery.data);
    }
  }, [tasksQuery.data, setTasks, setTranscriptionTasks]);

  useEffect(() => {
    if (transcriptionsQuery.data) {
      setTranscriptions(transcriptionsQuery.data);
    }
  }, [transcriptionsQuery.data, setTranscriptions]);

  const isLoading = tasksQuery.isLoading || transcriptionsQuery.isLoading;
  const errors = [tasksQuery.error, transcriptionsQuery.error].filter(Boolean) as Error[];

  const retry = () => {
    tasksQuery.refetch();
    transcriptionsQuery.refetch();
  };

  if (isLoading) {
    return (
      <div className="workspace-canvas flex flex-1 items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
          Loading workspace data…
        </div>
      </div>
    );
  }

  return (
    <>
      {errors.length > 0 && (
        <div className="flex items-start justify-between gap-4 border-b border-amber-200 bg-amber-50 px-5 py-3 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Workspace data is temporarily unavailable</p>
              <p className="mt-0.5 text-xs opacity-80">
                {errors.map((e) => e.message).join(' ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={retry}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-amber-100 dark:border-amber-300/30 dark:hover:bg-amber-300/10"
          >
            <RotateCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}
      {children}
    </>
  );
};
