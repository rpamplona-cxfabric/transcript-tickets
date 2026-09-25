"use client";

import { BusinessHoursForm } from "../businessHoursForm";
import { BusinessHoursSkeleton } from "../businessHoursSkeleton";
import { SettingsPageShell } from "../settingsPageShell";
import { useSettingsClient } from "./hook";

export const SettingsClient = () => {
  const { error, isLoading, settings } = useSettingsClient();

  return (
    <SettingsPageShell
      title="Business hours"
      description="Calls outside these hours can use your workspace's after-hours routing when it is configured."
    >
      {isLoading ? (
        <BusinessHoursSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
          {error}
        </div>
      ) : settings ? (
        <BusinessHoursForm settings={settings} />
      ) : null}
    </SettingsPageShell>
  );
};
