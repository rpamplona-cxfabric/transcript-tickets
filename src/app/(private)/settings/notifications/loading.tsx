import { SettingsPageLoading } from "../_components/settingsPageLoading";
import { settingsSections } from "../_components/sectionDefinitions";

export default function NotificationsLoading() {
  return <SettingsPageLoading {...settingsSections.notifications} />;
}
