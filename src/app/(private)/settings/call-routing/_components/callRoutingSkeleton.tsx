export const CallRoutingSkeleton = () => (
  <div className="animate-pulse space-y-6" aria-label="Loading call routing">
    {[0, 1, 2, 3].map((section) => (
      <div
        key={section}
        className="space-y-3 border-b border-zinc-200 pb-6 last:border-b-0 dark:border-zinc-800"
      >
        <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 max-w-xl rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-11 max-w-md rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    ))}
  </div>
);
