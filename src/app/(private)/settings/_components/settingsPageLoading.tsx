import { SettingsPageShell } from "./settingsPageShell";

interface SettingsPageLoadingProps {
  description: string;
  title: string;
}

export const SettingsPageLoading = ({
  description,
  title,
}: SettingsPageLoadingProps) => (
  <SettingsPageShell description={description} title={title}>
    <div className="animate-pulse space-y-4" aria-label={`Loading ${title}`}>
      <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-12 max-w-2xl rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-52 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="space-y-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-11/12 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  </SettingsPageShell>
);
