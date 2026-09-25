"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/settings";

export const useBusinessHoursClient = () => {
  const { error, isLoading, loadSettings, settings } = useSettingsStore();

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  return { error, isLoading, settings };
};
