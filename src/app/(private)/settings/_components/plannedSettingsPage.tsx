import { SettingsPageShell } from "./settingsPageShell";
import { SettingsSectionCard } from "./settingsSectionCard";
import type { SettingsSection } from "./sectionDefinitions";

export const PlannedSettingsPage = ({
  description,
  items,
  title,
}: SettingsSection) => (
  <SettingsPageShell description={description} title={title}>
    <SettingsSectionCard items={items} />
  </SettingsPageShell>
);
