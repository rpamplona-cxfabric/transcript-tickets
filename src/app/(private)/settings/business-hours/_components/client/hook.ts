import { useSettingsStore } from "@/lib/store/settings";

export const useBusinessHoursClient = () => {
  const error = useSettingsStore((state) => state.error);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const settings = useSettingsStore((state) => state.settings);

  return { error, isLoading, settings };
};
