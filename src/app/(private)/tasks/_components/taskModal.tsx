'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTaskStore } from '@/lib/store/tasks';
import { createTask, updateTask } from '@/lib/api/tasks';
import { queryKeys } from '@/lib/queryKeys';
import { Select } from '@/components/select';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['low', 'high']),
  status: z.enum(['open', 'in-progress', 'resolved']),
  transcriptId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export const TaskModal = () => {
  const qc = useQueryClient();
  const { isCreateModalOpen, setIsCreateModalOpen, editingTask, setEditingTask } = useTaskStore();

  const isOpen = isCreateModalOpen || !!editingTask;

  const getDefaultValues = (): FormValues => {
    if (editingTask) {
      return {
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'low',
        status: editingTask.status || 'open',
        transcriptId: editingTask.transcriptId || '',
      };
    }
    if (typeof window !== 'undefined') {
      const createFromId = new URLSearchParams(window.location.search).get('createFrom');
      if (createFromId && isCreateModalOpen) {
        return {
          title: `Follow-up for Call ${createFromId.slice(0, 8)}`,
          description: `This task was created based on call transcript ${createFromId}.\n\nNext Steps:\n- [ ] Review call details\n- [ ] Action item`,
          priority: 'low',
          status: 'open',
          transcriptId: createFromId,
        };
      }
    }
    return { title: '', description: '', priority: 'low', status: 'open', transcriptId: '' };
  };

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (isOpen) reset(getDefaultValues());
  }, [isOpen, editingTask]);

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success('Task created successfully!');
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
      handleClose();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to create task'),
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) => updateTask({ id: editingTask!.ticketId, ...values }),
    onSuccess: () => {
      toast.success('Task updated successfully!');
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
      handleClose();
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update task'),
  });

  const onSubmit = (values: FormValues) => {
    if (isCreateModalOpen) createMutation.mutate(values);
    else updateMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs transition-opacity duration-200 cursor-pointer" />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            {isCreateModalOpen ? 'Create Support Ticket' : 'Edit Support Ticket'}
          </h2>
          <button onClick={handleClose} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Ticket Title</label>
              <input
                {...register('title')}
                placeholder="Brief summary of the issue..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Detailed Description</label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder="Describe the task details..."
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Priority</label>
                <Select
                  value={watch('priority')}
                  onChange={(val) => setValue('priority', val as 'low' | 'high')}
                  options={[
                    { value: 'low', label: 'Low Priority' },
                    { value: 'high', label: 'High Priority' },
                  ]}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Status</label>
                <Select
                  value={watch('status')}
                  onChange={(val) => setValue('status', val as 'open' | 'in-progress' | 'resolved')}
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'resolved', label: 'Resolved' },
                  ]}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-zinc-200 p-6 dark:border-zinc-800 flex justify-end gap-3">
            <button type="button" onClick={handleClose} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer">
              {isPending ? 'Saving...' : isCreateModalOpen ? 'Create Ticket' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
