import { PlannedSettingsPage } from "../_components/plannedSettingsPage";
import { settingsSections } from "../_components/sectionDefinitions";

export default function DataRetentionPage() {
  return <PlannedSettingsPage {...settingsSections["data-retention"]} />;
}
