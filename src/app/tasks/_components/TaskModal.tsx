'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, CalendarDays, FileAudio } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTaskStore } from '../../../lib/store';
import Select from '../../../components/Select';

interface TaskModalProps {
  onRefresh: () => Promise<void> | void;
}

interface FormData {
  title: string;
  description: string;
  priority: 'low' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  transcriptId: string;
}

export default function TaskModal({ onRefresh }: TaskModalProps) {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingTask,
    setEditingTask
  } = useTaskStore();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'low',
    status: 'open',
    transcriptId: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync state when editing task changes
  useEffect(() => {
    if (editingTask) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        priority: editingTask.priority || 'low',
        status: editingTask.status || 'open',
        transcriptId: editingTask.transcriptId || ''
      });
      setFormError(null);
    }
  }, [editingTask]);

  // Sync state when createFrom param is parsed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const createFromId = params.get('createFrom');
    if (createFromId && isCreateModalOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: `Follow-up for Call ${createFromId.slice(0, 8)}`,
        description: `This task was created based on call transcript ${createFromId}.\n\nNext Steps:\n- [ ] Review call details\n- [ ] Action item`,
        priority: 'low',
        status: 'open',
        transcriptId: createFromId
      });
      setFormError(null);
    }
  }, [isCreateModalOpen]);

  const isOpen = isCreateModalOpen || !!editingTask;

  if (!isOpen) return null;

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
    setFormData({ title: '', description: '', priority: 'low', status: 'open', transcriptId: '' });
    setFormError(null);
  };

  const hasChanges = () => {
    if (isCreateModalOpen) return true; // Always allow save when creating new tasks
    if (!editingTask) return false;

    return (
      formData.title.trim() !== (editingTask.title || '') ||
      formData.description.trim() !== (editingTask.description || '') ||
      formData.priority !== (editingTask.priority || 'low') ||
      formData.status !== (editingTask.status || 'open')
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      if (isCreateModalOpen) {
        // Create mutation
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            priority: formData.priority,
            status: 'open',
            transcriptId: formData.transcriptId || ''
          })
        });

        if (!res.ok) throw new Error('Could not create task');
        toast.success('Task created successfully!');
      } else if (editingTask) {
        // Edit mutation
        const res = await fetch(`/api/tasks/${editingTask.ticketId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formData.title.trim(),
            description: formData.description.trim(),
            priority: formData.priority,
            status: formData.status
          })
        });

        if (!res.ok) throw new Error('Could not update task');
        toast.success('Task updated successfully!');
      }

      handleClose();
      await onRefresh();
    } catch (err: any) {
      setFormError(err.message);
      toast.error(err.message || 'Failed to save task');
    } finally {
      setFormLoading(false);
    }
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return 'N/A';
    try {
      const date = new Date(timeStr);
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <>
      <div
        onClick={handleClose}
        className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs transition-opacity duration-200 cursor-pointer"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            {isCreateModalOpen ? 'Create Support Ticket' : 'Edit Support Ticket'}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {formError && (
              <div className="rounded-xl bg-red-50 p-4 text-xs font-semibold text-red-800 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Ticket Title</label>
              <input
                type="text"
                required
                placeholder="Brief summary of the issue..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Detailed Description</label>
              <textarea
                required
                rows={5}
                placeholder="Describe the task details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Priority</label>
                <Select
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val as 'low' | 'high' })}
                  options={[
                    { value: 'low', label: 'Low Priority' },
                    { value: 'high', label: 'High Priority' }
                  ]}
                  className="w-full"
                />
              </div>

              {/* Status */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Status</label>
                <Select
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val as 'open' | 'in-progress' | 'resolved' })}
                  options={[
                    { value: 'open', label: 'Open' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'resolved', label: 'Resolved' }
                  ]}
                  className="w-full"
                  placeholder="Status"
                />
              </div>
            </div>

            {/* Task Metadata Row */}
            {!isCreateModalOpen && editingTask && (
              <div className="border-t border-zinc-100 pt-4 dark:border-zinc-900/60 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-zinc-400" />
                  <span>Created:</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatTime(editingTask.createdAt)}
                  </span>
                </div>
                {editingTask.transcriptId && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-500 dark:text-zinc-400">Associated Transcript:</span>
                    <Link
                      href={`/transcriptions?open=${editingTask.transcriptId}`}
                      className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <FileAudio className="h-3.5 w-3.5" />
                      View Call
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading || !hasChanges()}
              className="rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer"
            >
              {formLoading ? 'Saving...' : 'Save Ticket'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
