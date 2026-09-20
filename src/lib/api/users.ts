import api from "@/lib/axios";
import type {
  TenantRole,
  TenantUser,
  UserActionResult,
} from "@/lib/udas/usersApi";
import type { TenantPermission } from "@/lib/permissions";

export interface UsersResponse {
  users: TenantUser[];
  roles: TenantRole[];
  permissions: TenantPermission[];
  actorAuth0Id: string;
}

export const fetchUsers = async () =>
  (await api.get<UsersResponse>("/users")).data;

export const removeUser = async (auth0Id: string) =>
  (await api.delete<UserActionResult>("/users", { params: { auth0Id } })).data;

export const inviteUsers = async ({
  emails,
  roles,
  message,
}: {
  emails: string[];
  roles: Record<string, string>;
  message: string;
}) =>
  (await api.post<UserActionResult>("/users", { emails, roles, message })).data;
