"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/store/settings";

export const SettingsInitializer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const error = useSettingsStore((state) => state.error);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const settings = useSettingsStore((state) => state.settings);

  useEffect(() => {
    if (!settings && !isLoading && !error) {
      void loadSettings();
    }
  }, [error, isLoading, loadSettings, settings]);

  return <>{children}</>;
};
