import { create } from 'zustand';
import { Transcript } from '@/types';

interface TranscriptionState {
  transcripts: Transcript[];
  isReady: boolean;
  activeTranscript: Transcript | null;
  searchQuery: string;
  selectedTenant: string;
  currentPage: number;

  setTranscripts: (transcripts: Transcript[]) => void;
  setActiveTranscript: (activeTranscript: Transcript | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSelectedTenant: (selectedTenant: string) => void;
  setCurrentPage: (currentPage: number) => void;
  updateTranscript: (updated: Transcript) => void;
}

export const useTranscriptionStore = create<TranscriptionState>((set) => ({
  transcripts: [],
  isReady: false,
  activeTranscript: null,
  searchQuery: '',
  selectedTenant: 'all',
  currentPage: 1,

  setTranscripts: (transcripts) => set({ transcripts, isReady: true }),
  setActiveTranscript: (activeTranscript) => set({ activeTranscript }),
  setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
  setSelectedTenant: (selectedTenant) => set({ selectedTenant, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),

  updateTranscript: (updated) => set((state) => ({
    transcripts: state.transcripts.map((transcript) =>
      transcript.transcriptId === updated.transcriptId ? updated : transcript
    ),
    activeTranscript:
      state.activeTranscript?.transcriptId === updated.transcriptId
        ? updated
        : state.activeTranscript,
  })),
}));
