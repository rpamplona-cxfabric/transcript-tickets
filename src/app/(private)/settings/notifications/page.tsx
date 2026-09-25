import { PlannedSettingsPage } from "../_components/plannedSettingsPage";
import { settingsSections } from "../_components/sectionDefinitions";

export default function NotificationsPage() {
  return <PlannedSettingsPage {...settingsSections.notifications} />;
}
