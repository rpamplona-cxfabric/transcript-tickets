'use client';

import { useEffect } from 'react';
import { fetchCurrentUserProfile } from '@/lib/api/user';
import { useUserStore } from '@/lib/store/user';

export const UserProfileInitializer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const controller = new AbortController();
    useUserStore.setState({ error: null, isLoading: true });

    void fetchCurrentUserProfile()
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

    return () => controller.abort();
  }, []);

  return children;
};
