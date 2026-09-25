import { SettingsPageLoading } from "../_components/settingsPageLoading";
import { settingsSections } from "../_components/sectionDefinitions";

export default function RecordingLoading() {
  return <SettingsPageLoading {...settingsSections.recording} />;
}
