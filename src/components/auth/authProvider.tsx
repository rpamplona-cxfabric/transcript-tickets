'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { UserProfileInitializer } from '@/components/auth/userProfileInitializer';

const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN
  ?.replace(/^https?:\/\//, '')
  .replace(/\/$/, '');
const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
const subscribe = () => () => {};

const getSafeReturnTo = (returnTo?: string) => {
  if (!returnTo || typeof window === 'undefined') {
    return '/';
  }

  try {
    const url = new URL(returnTo, window.location.origin);
    if (url.origin !== window.location.origin) {
      return '/';
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
};

const AuthLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
    <div className="flex items-center gap-3 text-sm font-medium text-zinc-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
      Loading secure workspace…
    </div>
  </div>
);

const AuthConfigurationError = () => (
  <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-white">
    <div className="w-full max-w-lg rounded-2xl border border-amber-400/20 bg-zinc-900 p-6 shadow-2xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
        <ShieldAlert className="h-5 w-5" />
      </div>
      <h1 className="text-xl font-semibold">Auth0 configuration is missing</h1>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        Add <code className="text-zinc-200">NEXT_PUBLIC_AUTH0_DOMAIN</code> and{' '}
        <code className="text-zinc-200">NEXT_PUBLIC_AUTH0_CLIENT_ID</code> to{' '}
        <code className="text-zinc-200">.env.local</code>, then restart the development server.
      </p>
    </div>
  </div>
);

export const AppAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const redirectUri = useSyncExternalStore(
    subscribe,
    () => window.location.origin,
    () => ''
  );

  if (!domain || !clientId) {
    return <AuthConfigurationError />;
  }

  if (!redirectUri) {
    return <AuthLoading />;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      cacheLocation="localstorage"
      authorizationParams={{
        redirect_uri: redirectUri,
        ...(audience ? { audience } : {}),
      }}
      onRedirectCallback={(appState) => {
        router.replace(getSafeReturnTo(appState?.returnTo));
      }}
    >
      <UserProfileInitializer>{children}</UserProfileInitializer>
    </Auth0Provider>
  );
};
