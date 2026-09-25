import type { ReactNode } from "react";

interface SettingsPageShellProps {
  children: ReactNode;
  description: string;
  title: string;
}

export const SettingsPageShell = ({
  children,
  description,
  title,
}: SettingsPageShellProps) => (
  <div className="workspace-canvas flex flex-1">
    <main className="flex w-full flex-col">
      <section className="app-surface app-shadow-surface overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <header className="border-b border-zinc-200 px-5 py-5 dark:border-zinc-800 sm:px-6 sm:py-6">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </header>
        <div className="p-5 sm:p-6">{children}</div>
      </section>
    </main>
  </div>
);
