import { PlannedSettingsPage } from "../_components/plannedSettingsPage";
import { settingsSections } from "../_components/sectionDefinitions";

export default function SpamHandlingPage() {
  return <PlannedSettingsPage {...settingsSections["spam-handling"]} />;
}
