import { create } from "zustand";
import type { AvailablePhoneNumber, PhoneNumber } from "@/lib/api/phoneNumbers";
import { fetchPhoneNumbers } from "@/lib/api/phoneNumbers";

interface PhoneNumbersState {
  availablePhoneNumbers: AvailablePhoneNumber[];
  phoneNumbers: PhoneNumber[];
  error: string | null;
  isLoading: boolean;
  appendPhoneNumber: (phoneNumber: PhoneNumber) => void;
  loadPhoneNumbers: () => Promise<void>;
  removePhoneNumber: (phoneNumber: string) => void;
  setAvailablePhoneNumbers: (phoneNumbers: AvailablePhoneNumber[]) => void;
}

export const usePhoneNumbersStore = create<PhoneNumbersState>((set) => ({
  availablePhoneNumbers: [],
  phoneNumbers: [],
  error: null,
  isLoading: false,
  appendPhoneNumber: (phoneNumber) =>
    set((state) => ({
      phoneNumbers: [
        ...state.phoneNumbers.filter(
          (item) => item.phoneNumber !== phoneNumber.phoneNumber,
        ),
        phoneNumber,
      ],
    })),
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
  removePhoneNumber: (phoneNumber) =>
    set((state) => ({
      phoneNumbers: state.phoneNumbers.filter(
        (item) => item.phoneNumber !== phoneNumber,
      ),
    })),
  setAvailablePhoneNumbers: (phoneNumbers) =>
    set({ availablePhoneNumbers: phoneNumbers }),
}));
