'use client';

import { useRef } from 'react';
import { useTaskStore } from '@/lib/store/tasks';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { Task, Transcript } from '@/types';

interface StoreInitializerProps {
  tasks: Task[];
  transcripts: Transcript[];
  children: React.ReactNode;
}

export const StoreInitializer = ({ tasks, transcripts, children }: StoreInitializerProps) => {
  const initialized = useRef<boolean | null>(null);

  if (initialized.current == null) {
    useTaskStore.setState({ tasks, isReady: true });
    useTranscriptionStore.setState({ transcripts, tasks, isReady: true });
    initialized.current = true;
  }

  return <>{children}</>;
};
