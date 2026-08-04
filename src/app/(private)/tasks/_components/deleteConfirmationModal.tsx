'use client';

import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTaskStore } from '@/lib/store/tasks';
import { deleteTask } from '@/lib/api/tasks';
import { queryKeys } from '@/lib/queryKeys';

export const DeleteConfirmationModal = () => {
  const qc = useQueryClient();
  const { deletingTaskId, setDeletingTaskId } = useTaskStore();

  const mutation = useMutation({
    mutationFn: () => deleteTask(deletingTaskId!),
    onSuccess: () => {
      toast.success('Task deleted successfully!');
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
      setDeletingTaskId(null);
    },
    onError: (err: Error) => toast.error(`Failed to delete task: ${err.message}`),
  });

  if (!deletingTaskId) return null;

  return (
    <>
      <div onClick={() => setDeletingTaskId(null)} className="fixed inset-0 z-50 bg-zinc-950/35 backdrop-blur-xs transition-opacity duration-200 cursor-pointer" />

      <div className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Delete Support Ticket</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400">
              Are you sure you want to permanently delete this support ticket? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setDeletingTaskId(null)}
            disabled={mutation.isPending}
            className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-red-500 cursor-pointer disabled:opacity-50"
          >
            {mutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </>
  );
};
