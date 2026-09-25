import { PlannedSettingsPage } from "../_components/plannedSettingsPage";
import { settingsSections } from "../_components/sectionDefinitions";

export default function CallRoutingPage() {
  return <PlannedSettingsPage {...settingsSections["call-routing"]} />;
}
