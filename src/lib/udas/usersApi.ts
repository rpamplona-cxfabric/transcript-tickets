import { getQuery } from "./udasWrapper";

export interface TenantUser {
  auth0_id: string;
  tenant_id: string;
  username: string | null;
  user_type: string | null;
  role_id: string | null;
  status: "active" | "invited" | "suspended" | string | null;
  first_name: string | null;
  last_name: string | null;
  email_address: string | null;
  image: string | null;
  created_date_time: string | null;
  organization: string | null;
  mobile: string | null;
  phone: string | null;
  your_location: string | null;
  language: string | null;
  user_preferences: unknown;
}

export interface TenantRole {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  status: string | null;
}

export interface UserActionResult {
  isSuccessful: boolean;
  message: string | null;
  resultObject: unknown;
}

interface UdasRequestOptions {
  accessToken: string;
  tenantId: string;
}

export const getTenantUsers = async ({
  accessToken,
  tenantId,
}: UdasRequestOptions) => {
  const result = await getQuery<{ users: TenantUser[] }>(
    {
      query: `query Users($tenantId: String!) {
        users(tenant_id: $tenantId) {
          auth0_id tenant_id username user_type role_id status first_name last_name
          email_address image created_date_time organization mobile phone your_location language user_preferences
        }
      }`,
      variables: { tenantId },
    },
    { accessToken },
  );

  return result.users ?? [];
};

export const getTenantUserPermissions = async ({
  accessToken,
  tenantId,
  auth0Id,
  permissions,
}: UdasRequestOptions & { auth0Id: string; permissions: string[] }) => {
  const result = await getQuery<{
    checkUserPermission?: { resultObject?: unknown };
  }>(
    {
      query: `query CheckUserPermission($userId: String!, $tenantId: String!, $permissionsToCheck: [String!]!) {
        checkUserPermission(user_id: $userId, tenant_id: $tenantId, permissions_to_check: $permissionsToCheck) {
          resultObject
        }
      }`,
      variables: { userId: auth0Id, tenantId, permissionsToCheck: permissions },
    },
    { accessToken },
  );

  const value = result.checkUserPermission?.resultObject;
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const candidate = item as { name?: unknown; value?: unknown };
    return typeof candidate.name === "string" &&
      typeof candidate.value === "boolean"
      ? [{ name: candidate.name, value: candidate.value }]
      : [];
  });
};

export const getTenantRoles = async ({
  accessToken,
  tenantId,
}: UdasRequestOptions) => {
  const result = await getQuery<{ roles: TenantRole[] }>(
    {
      query: `query Roles($tenantId: String!) {
        roles(tenant_id: $tenantId) {
          id tenant_id name description status
        }
      }`,
      variables: { tenantId },
    },
    { accessToken },
  );

  return result.roles ?? [];
};

export const deleteTenantUser = async ({
  accessToken,
  tenantId,
  auth0Id,
}: UdasRequestOptions & { auth0Id: string }) => {
  const result = await getQuery<{ deleteUser: UserActionResult }>(
    {
      query: `mutation DeleteUser($tenantId: String!, $auth0Id: String!) {
        deleteUser(tenant_id: $tenantId, auth0_id: $auth0Id) {
          isSuccessful message resultObject
        }
      }`,
      variables: { tenantId, auth0Id },
    },
    { accessToken },
  );

  return result.deleteUser;
};
