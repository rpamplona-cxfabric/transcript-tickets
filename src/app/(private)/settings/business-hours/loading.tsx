import { SettingsPageLoading } from "../_components/settingsPageLoading";

export default function BusinessHoursLoading() {
  return (
    <SettingsPageLoading
      title="Business hours"
      description="Calls outside these hours can use your workspace's after-hours routing when it is configured."
    />
  );
}
