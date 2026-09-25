export const SpamHandlingSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-label="Loading spam handling">
    <div className="space-y-3">
      <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-24 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-11 max-w-md rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
    <div className="space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
      <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  </div>
);
