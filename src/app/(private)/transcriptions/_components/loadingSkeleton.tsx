const SKELETON_ROWS = Array.from({ length: 7 }, (_, index) => index);

const SkeletonBar = ({ className = '' }: { className?: string }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800 ${className}`}
  />
);

export const TranscriptionsLoadingSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40" role="status" aria-label="Loading transcriptions">
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:hidden">
          {SKELETON_ROWS.slice(0, 4).map((row) => (
            <div key={row} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <SkeletonBar className="h-7 w-40 rounded-full" />
                <SkeletonBar className="h-7 w-20 rounded-full" />
              </div>
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                <SkeletonBar className="h-3 w-16" />
                <SkeletonBar className="mt-3 h-4 w-full" />
                <SkeletonBar className="mt-2 h-4 w-3/4" />
              </div>
            </div>
          ))}
    </div>

    <div className="hidden overflow-x-auto lg:block">
      <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-bold uppercase text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <tr>
                <th scope="col" className="px-6 py-4">Date &amp; Time</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">AI Summary</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {SKELETON_ROWS.map((row) => (
                <tr key={row}>
                  <td className="px-6 py-5"><SkeletonBar className="h-4 w-40" /></td>
                  <td className="px-6 py-5"><SkeletonBar className="h-7 w-24 rounded-full" /></td>
                  <td className="px-6 py-5"><SkeletonBar className="h-4 w-4/5" /></td>
                  <td className="px-6 py-5"><SkeletonBar className="ml-auto h-8 w-8 rounded-lg" /></td>
                </tr>
              ))}
            </tbody>
      </table>
    </div>

    <div className="hidden border-t border-zinc-200 bg-zinc-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex sm:items-center sm:justify-between sm:px-6">
      <SkeletonBar className="h-4 w-52" />
      <SkeletonBar className="h-8 w-32 rounded-xl" />
    </div>
    <span className="sr-only">Loading transcriptions</span>
  </div>
);
