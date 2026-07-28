import { useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTaskStore } from '@/lib/store/tasks';
import { Task } from '@/types';

export const useTasksClient = () => {
  const {
    tasks,
    setTasks,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    editingTask,
    setEditingTask,
    setDeletingTaskId,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isReady
  } = useTaskStore();

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
  }, [setEditingTask]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('cxf_task_view_mode');
      if (savedMode && (savedMode === 'kanban' || savedMode === 'list')) {
        setViewMode(savedMode as 'kanban' | 'list');
      }
    }
  }, [setViewMode]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reload tasks');
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId) {
        const matchedTask = tasks.find(t => t.ticketId === openId);
        if (matchedTask) {
          openEditModal(matchedTask);
        }
      }
    }
  }, [tasks, openEditModal]);

  const handleQuickUpdate = async (task: Task, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${task.ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          ...updates
        })
      });

      if (!res.ok) throw new Error('Quick update failed');
      await fetchTasks();
      toast.success('Task updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    }
  };

  const filteredTasks = tasks.filter(t => {
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
    isReady,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    editingTask,
    setDeletingTaskId,
    isCreateModalOpen,
    setIsCreateModalOpen,
    openEditModal,
    fetchTasks,
    handleQuickUpdate,
    filteredTasks
  };
};
