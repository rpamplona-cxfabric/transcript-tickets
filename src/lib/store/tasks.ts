import { create } from 'zustand';
import { Task } from '@/types';

interface TaskState {
  tasks: Task[];
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  viewMode: 'kanban' | 'list';
  editingTask: Task | null;
  deletingTaskId: string | null;
  isCreateModalOpen: boolean;

  setTasks: (tasks: Task[]) => void;
  setSearchQuery: (searchQuery: string) => void;
  setPriorityFilter: (priorityFilter: string) => void;
  setStatusFilter: (statusFilter: string) => void;
  setViewMode: (viewMode: 'kanban' | 'list') => void;
  setEditingTask: (editingTask: Task | null) => void;
  setDeletingTaskId: (deletingTaskId: string | null) => void;
  setIsCreateModalOpen: (isCreateModalOpen: boolean) => void;
  updateTaskInList: (updated: Task) => void;
  removeTaskFromList: (ticketId: string) => void;
  addTaskToList: (task: Task) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  searchQuery: '',
  priorityFilter: 'all',
  statusFilter: 'all',
  viewMode: 'kanban',
  editingTask: null,
  deletingTaskId: null,
  isCreateModalOpen: false,

  setTasks: (tasks) => set({ tasks }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setViewMode: (viewMode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cxf_task_view_mode', viewMode);
    }
    set({ viewMode });
  },
  setEditingTask: (editingTask) => set({ editingTask }),
  setDeletingTaskId: (deletingTaskId) => set({ deletingTaskId }),
  setIsCreateModalOpen: (isCreateModalOpen) => set({ isCreateModalOpen }),

  updateTaskInList: (updated) => set((state) => ({
    tasks: state.tasks.map(t => t.ticketId === updated.ticketId ? updated : t)
  })),
  removeTaskFromList: (ticketId) => set((state) => ({
    tasks: state.tasks.filter(t => t.ticketId !== ticketId)
  })),
  addTaskToList: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  }))
}));
