import { create } from "zustand";
import { fetchUsers, type UsersResponse } from "@/lib/api/users";

interface UsersState extends UsersResponse {
  error: string | null;
  isLoading: boolean;
  loadUsers: () => Promise<void>;
  setUsersData: (data: UsersResponse) => void;
}

const initialData: UsersResponse = {
  actorAuth0Id: "",
  permissions: [],
  roles: [],
  users: [],
};

export const useUsersStore = create<UsersState>((set) => ({
  ...initialData,
  error: null,
  isLoading: false,
  setUsersData: (data) => set({ ...data, error: null, isLoading: false }),
  loadUsers: async () => {
    set({ error: null, isLoading: true });
    try {
      const data = await fetchUsers();
      set({ ...data, error: null, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Unable to load users.",
        isLoading: false,
      });
    }
  },
}));
