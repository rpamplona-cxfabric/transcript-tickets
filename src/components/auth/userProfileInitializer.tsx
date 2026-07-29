'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { useUserStore } from '@/lib/store/user';
import { getUserProfile } from '@/lib/udas/userApi';

const getStringClaim = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : '';

const getTenantId = (user: Record<string, unknown> | undefined) =>
  getStringClaim(user?.stripeId) ||
  getStringClaim(user?.tenant_id) ||
  getStringClaim(user?.['https://ianswer.io/tenant_id']);

export const UserProfileInitializer = ({ children }: { children: React.ReactNode }) => {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
  const auth0Id = getStringClaim(user?.sub);
  const tenantId = getTenantId(user);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !auth0Id) {
      useUserStore.getState().clearProfile();
      return;
    }

    if (!tenantId) {
      useUserStore.setState({
        error: 'The Auth0 user does not include a tenant identifier.',
        isLoading: false,
        profile: null,
      });
      return;
    }

    const controller = new AbortController();
    useUserStore.setState({ error: null, isLoading: true });

    void getAccessTokenSilently()
      .then((accessToken) =>
        getUserProfile({
          accessToken,
          auth0Id,
          signal: controller.signal,
          tenantId,
        })
      )
      .then((profile) => {
        if (!controller.signal.aborted) {
          useUserStore.getState().setProfile(profile);
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Unable to load the UDAS user profile:', error);
          useUserStore.setState({
            error: error instanceof Error ? error.message : 'Unable to load the UDAS user profile.',
            isLoading: false,
            profile: null,
          });
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    auth0Id,
    getAccessTokenSilently,
    isAuthenticated,
    isLoading,
    tenantId,
  ]);

  return children;
};
