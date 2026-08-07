import api from '@/lib/axios';
import type { UdasUserProfile } from '@/lib/udas/userApi';

export const fetchCurrentUserProfile = async (): Promise<UdasUserProfile | null> => {
  const { data } = await api.get<UdasUserProfile | null>('/user-profile');
  return data;
};
