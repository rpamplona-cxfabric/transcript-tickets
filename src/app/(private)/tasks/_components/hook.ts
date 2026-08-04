import { useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTaskStore } from '@/lib/store/tasks';
import { fetchTasks, updateTask } from '@/lib/api/tasks';
import { queryKeys } from '@/lib/queryKeys';
import { Task } from '@/types';

export const useTasksClient = () => {
  const qc = useQueryClient();

  const {
    searchQuery, setSearchQuery,
    priorityFilter, setPriorityFilter,
    statusFilter, setStatusFilter,
    viewMode, setViewMode,
    editingTask, setEditingTask,
    setDeletingTaskId,
    isCreateModalOpen, setIsCreateModalOpen,
  } = useTaskStore();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: queryKeys.tasks,
    queryFn: fetchTasks,
  });

  const quickUpdateMutation = useMutation({
    mutationFn: ({ task, updates }: { task: Task; updates: Partial<Task> }) =>
      updateTask({ id: task.ticketId, ...task, ...updates }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tasks });
      toast.success('Task updated successfully!');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update task'),
  });

  const openEditModal = useCallback((task: Task) => setEditingTask(task), [setEditingTask]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('cxf_task_view_mode');
    if (saved === 'kanban' || saved === 'list') setViewMode(saved);
  }, [setViewMode]);

  useEffect(() => {
    if (tasks.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const openId = params.get('open');
    if (openId) {
      const matched = tasks.find((t) => t.ticketId === openId);
      if (matched) openEditModal(matched);
    }
  }, [tasks, openEditModal]);

  const handleQuickUpdate = async (task: Task, updates: Partial<Task>) => {
    await quickUpdateMutation.mutateAsync({ task, updates });
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketId.includes(searchQuery);
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return {
    tasks,
    isReady: !isLoading,
    searchQuery, setSearchQuery,
    priorityFilter, setPriorityFilter,
    statusFilter, setStatusFilter,
    viewMode, setViewMode,
    editingTask,
    setDeletingTaskId,
    isCreateModalOpen, setIsCreateModalOpen,
    openEditModal,
    handleQuickUpdate,
    filteredTasks,
  };
};
