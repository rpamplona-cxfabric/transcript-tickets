const dayRows = Array.from({ length: 7 }, (_, index) => index);

export const BusinessHoursSkeleton = () => (
  <div className="animate-pulse space-y-5" aria-label="Loading business hours">
    <div className="space-y-2">
      <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-11 max-w-sm rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
    <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      {dayRows.map((day) => (
        <div
          key={day}
          className="flex items-center gap-4 border-b border-zinc-200 p-4 last:border-b-0 dark:border-zinc-800"
        >
          <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-5 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-10 w-48 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
    <div className="flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <div className="h-10 w-40 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  </div>
);
