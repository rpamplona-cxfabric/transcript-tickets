import { SettingsPageLoading } from "../_components/settingsPageLoading";
import { settingsSections } from "../_components/sectionDefinitions";

export default function DataRetentionLoading() {
  return <SettingsPageLoading {...settingsSections["data-retention"]} />;
}
