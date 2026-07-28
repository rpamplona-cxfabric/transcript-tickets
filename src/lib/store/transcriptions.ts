import { create } from 'zustand';
import { Task, Transcript } from '@/types';

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
