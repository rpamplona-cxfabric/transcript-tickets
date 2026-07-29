'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { ShieldAlert } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Sidebar } from '@/components/sidebar';
import { StoreInitializer } from '@/components/storeInitializer';

const LoadingScreen = () => (
  <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
    <div className="flex items-center gap-3 text-sm font-medium text-zinc-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      Verifying your session…
    </div>
  </div>
);

export const PrivateAppShell = ({ children }: { children: React.ReactNode }) => {
  const { error, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || isAuthenticated || error) {
      return;
    }

    const returnTo = `${pathname}${window.location.search}`;
    router.replace(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
  }, [error, isAuthenticated, isLoading, pathname, router]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-red-400/20 bg-zinc-900 p-6 shadow-2xl">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">Unable to verify your session</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{error.message}</p>
          <button
            type="button"
            onClick={() => loginWithRedirect({ appState: { returnTo: pathname } })}
            className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Try signing in again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || !isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="workspace-canvas flex min-h-screen flex-col text-zinc-900 md:flex-row dark:text-zinc-50">
      <Sidebar />
      <main className="flex min-h-screen flex-1 flex-col overflow-x-hidden md:h-screen md:overflow-y-auto">
        <StoreInitializer>{children}</StoreInitializer>
      </main>
    </div>
  );
};
