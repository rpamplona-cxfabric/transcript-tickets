import { create } from "zustand";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";
import { fetchPhoneNumbers } from "@/lib/api/phoneNumbers";

interface PhoneNumbersState {
  phoneNumbers: PhoneNumber[];
  error: string | null;
  isLoading: boolean;
  loadPhoneNumbers: () => Promise<void>;
}

export const usePhoneNumbersStore = create<PhoneNumbersState>((set) => ({
  phoneNumbers: [],
  error: null,
  isLoading: false,
  loadPhoneNumbers: async () => {
    set({ error: null, isLoading: true });
    try {
      const data = await fetchPhoneNumbers();
      set({ phoneNumbers: data.items, error: null, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Unable to load phone numbers.",
        isLoading: false,
      });
    }
  },
}));
