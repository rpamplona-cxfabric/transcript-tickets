export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <div className="workspace-canvas flex flex-1 items-center justify-center">
      <div className="app-surface app-shadow-surface max-w-md rounded-2xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          Task management unavailable
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Tasks are no longer loaded or managed from this workspace.
        </p>
      </div>
    </div>
  );
}
