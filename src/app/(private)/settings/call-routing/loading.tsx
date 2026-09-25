import { SettingsPageLoading } from "../_components/settingsPageLoading";
import { settingsSections } from "../_components/sectionDefinitions";

export default function CallRoutingLoading() {
  return <SettingsPageLoading {...settingsSections["call-routing"]} />;
}
