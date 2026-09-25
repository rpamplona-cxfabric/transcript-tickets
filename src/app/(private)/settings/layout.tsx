import { SettingsInitializer } from "./_components/settingsInitializer";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SettingsInitializer>{children}</SettingsInitializer>;
}
