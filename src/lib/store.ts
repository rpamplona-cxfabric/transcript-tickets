import { create } from 'zustand';
import { Task, Transcript } from '../types';

interface TranscriptionState {
  transcripts: Transcript[];
  tasks: Task[];
  activeTranscript: Transcript | null;
  searchQuery: string;
  selectedTenant: string;
  currentPage: number;

  setTranscripts: (transcripts: Transcript[]) => void;
  setTasks: (tasks: Task[]) => void;
  setActiveTranscript: (activeTranscript: Transcript | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSelectedTenant: (selectedTenant: string) => void;
  setCurrentPage: (currentPage: number) => void;
  updateTranscript: (updated: Transcript) => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  transcripts: [],
  tasks: [],
  activeTranscript: null,
  searchQuery: '',
  selectedTenant: 'all',
  currentPage: 1,

  setTranscripts: (transcripts) => set({ transcripts }),
  setTasks: (tasks) => set({ tasks }),
  setActiveTranscript: (activeTranscript) => set({ activeTranscript }),
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setSelectedTenant: (selectedTenant) => set({ selectedTenant, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  updateTranscript: (updated) => set((state) => ({
    transcripts: state.transcripts.map(t => t.transcriptId === updated.transcriptId ? updated : t),
    activeTranscript: state.activeTranscript?.transcriptId === updated.transcriptId ? updated : state.activeTranscript
  }))
}));

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
