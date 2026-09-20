export const USER_PERMISSIONS = {
  REMOVE_USERS: "Remove users",
  INVITE_USERS: "Invite users",
} as const;

export const USER_PERMISSION_NAMES = Object.values(USER_PERMISSIONS);

export type UserPermissionName =
  (typeof USER_PERMISSIONS)[keyof typeof USER_PERMISSIONS];

export interface TenantPermission {
  name: string;
  value: boolean;
}

export const hasUserPermission = (
  permissions: TenantPermission[],
  permission: UserPermissionName,
) => permissions.some((item) => item.name === permission && item.value);
