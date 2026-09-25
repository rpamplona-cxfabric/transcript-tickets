import { SettingsPageLoading } from "../_components/settingsPageLoading";
import { settingsSections } from "../_components/sectionDefinitions";

export default function SpamHandlingLoading() {
  return <SettingsPageLoading {...settingsSections["spam-handling"]} />;
}
