import { create } from 'zustand';
import { Transcript } from '@/types';

interface TranscriptionState {
  activeTranscript: Transcript | null;
  searchQuery: string;
  selectedTenant: string;
  selectedStatus: 'active' | 'pending' | 'processed' | 'ignored';
  currentPage: number;

  setActiveTranscript: (activeTranscript: Transcript | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSelectedTenant: (selectedTenant: string) => void;
  setSelectedStatus: (selectedStatus: TranscriptionState['selectedStatus']) => void;
  setCurrentPage: (currentPage: number) => void;
  updateTranscript: (updated: Transcript) => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  activeTranscript: null,
  searchQuery: '',
  selectedTenant: 'all',
  selectedStatus: 'active',
  currentPage: 1,

  setActiveTranscript: (activeTranscript) => set({ activeTranscript }),
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setSelectedTenant: (selectedTenant) => set({ selectedTenant, currentPage: 1 }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  updateTranscript: (updated) => set((state) => ({
    activeTranscript:
      state.activeTranscript?.transcriptId === updated.transcriptId
        ? updated
        : state.activeTranscript,
  })),
}));
