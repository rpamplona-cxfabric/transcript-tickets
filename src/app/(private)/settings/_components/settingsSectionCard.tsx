import { LockKeyhole } from "lucide-react";

interface SettingsSectionCardProps {
  items: readonly string[];
}

export const SettingsSectionCard = ({ items }: SettingsSectionCardProps) => (
  <div>
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        Configuration options
      </p>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-zinc-100 px-2.5 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-[#182233] dark:text-[#9eb8f6]">
        <LockKeyhole className="h-3.5 w-3.5" /> Planned
      </span>
    </div>
    <ul className="mt-5 space-y-2 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);
