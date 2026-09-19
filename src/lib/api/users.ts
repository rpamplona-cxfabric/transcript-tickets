import api from '@/lib/axios';
import type { TenantRole, TenantUser, UserActionResult } from '@/lib/udas/usersApi';

export interface UsersResponse {
  users: TenantUser[];
  roles: TenantRole[];
}

export const fetchUsers = async () => (await api.get<UsersResponse>('/users')).data;

export const updateUserStatus = async (auth0Id: string, status: 'active' | 'suspended') =>
  (await api.patch<UserActionResult>('/users', { action: 'status', auth0Id, status })).data;

export const updateUserRole = async (auth0Id: string, roleId: string) =>
  (await api.patch<UserActionResult>('/users', { action: 'role', auth0Id, roleId })).data;

export const removeUser = async (auth0Id: string) =>
  (await api.delete<UserActionResult>('/users', { params: { auth0Id } })).data;

export const inviteUsers = async ({
  emails,
  roles,
  message,
}: {
  emails: string[];
  roles: Record<string, string>;
  message: string;
}) => (await api.post<UserActionResult>('/users', { emails, roles, message })).data;
