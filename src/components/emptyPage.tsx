interface EmptyPageProps {
  title: string;
}

export const EmptyPage = ({ title }: EmptyPageProps) => (
  <div className="workspace-canvas flex flex-1 items-center justify-center">
    <section className="app-surface app-shadow-surface w-full max-w-md rounded-2xl border border-zinc-200 p-6 text-center dark:border-zinc-800">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
        {title}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        This page is coming soon.
      </p>
    </section>
  </div>
);
