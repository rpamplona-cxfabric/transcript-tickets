import { create } from 'zustand';

export const useTranscriptionStore = create((set) => ({
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

export const useTaskStore = create((set) => ({
  tasks: [],
  searchQuery: '',
  priorityFilter: 'all',
  statusFilter: 'all',
  viewMode: 'kanban', // 'kanban' or 'list'
  editingTask: null,
  deletingTaskId: null,
  isCreateModalOpen: false,

  setTasks: (tasks) => set({ tasks }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setViewMode: (viewMode) => set({ viewMode }),
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
