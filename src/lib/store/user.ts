import { create } from 'zustand';
import { UdasUserProfile } from '@/lib/udas/userApi';

interface UserState {
  error: string | null;
  isLoading: boolean;
  profile: UdasUserProfile | null;
  clearProfile: () => void;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setProfile: (profile: UdasUserProfile | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  error: null,
  isLoading: false,
  profile: null,
  clearProfile: () => set({ error: null, isLoading: false, profile: null }),
  setError: (error) => set({ error }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setProfile: (profile) => set({ error: null, isLoading: false, profile }),
}));
