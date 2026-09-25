import { create } from "zustand";
import type { WorkspaceSettings } from "@/lib/api/settings";
import { fetchWorkspaceSettings } from "@/lib/api/settings";

interface SettingsState {
  error: string | null;
  isLoading: boolean;
  settings: WorkspaceSettings | null;
  loadSettings: () => Promise<void>;
  setSettings: (settings: WorkspaceSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  error: null,
  isLoading: false,
  settings: null,
  loadSettings: async () => {
    set({ error: null, isLoading: true });
    try {
      const settings = await fetchWorkspaceSettings();
      set({ error: null, isLoading: false, settings });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Unable to load settings.",
        isLoading: false,
      });
    }
  },
  setSettings: (settings) => set({ settings }),
}));
