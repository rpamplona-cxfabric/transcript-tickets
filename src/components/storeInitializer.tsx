'use client';

import { AlertTriangle, RotateCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTaskStore } from '@/lib/store/tasks';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { Task, Transcript } from '@/types';

interface StoreInitializerProps {
  children: React.ReactNode;
}

const getJson = async <T,>(path: string, label: string): Promise<T> => {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || `Failed to load ${label}`);
  }

  return response.json();
};

const loadWorkspaceData = async () => {
  const [tasksResult, transcriptsResult] = await Promise.allSettled([
    getJson<Task[]>('/api/tasks', 'tasks'),
    getJson<Transcript[]>('/api/transcriptions', 'transcriptions'),
  ]);

  const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value : [];
  const transcripts =
    transcriptsResult.status === 'fulfilled' ? transcriptsResult.value : [];
  const failures = [tasksResult, transcriptsResult]
    .filter((result) => result.status === 'rejected')
    .map((result) => (result as PromiseRejectedResult).reason?.message)
    .filter(Boolean);

  return {
    tasks,
    transcripts,
    errorMessage: failures.join(' '),
  };
};

export const StoreInitializer = ({ children }: StoreInitializerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const applyWorkspaceData = useCallback(({
    tasks,
    transcripts,
    errorMessage: nextErrorMessage,
  }: Awaited<ReturnType<typeof loadWorkspaceData>>) => {
    useTaskStore.setState({ tasks, isReady: true });
    useTranscriptionStore.setState({ transcripts, tasks, isReady: true });
    setErrorMessage(nextErrorMessage);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    void loadWorkspaceData().then((result) => {
      if (!cancelled) {
        applyWorkspaceData(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [applyWorkspaceData]);

  const retry = () => {
    setIsLoading(true);
    setErrorMessage('');
    useTaskStore.setState({ isReady: false });
    useTranscriptionStore.setState({ isReady: false });
    void loadWorkspaceData().then(applyWorkspaceData);
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
      {errorMessage && (
        <div className="flex items-start justify-between gap-4 border-b border-amber-200 bg-amber-50 px-5 py-3 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <div className="flex min-w-0 items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Workspace data is temporarily unavailable</p>
              <p className="mt-0.5 text-xs opacity-80">
                Check the server console and AWS credentials. The workspace is running with empty data.
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
