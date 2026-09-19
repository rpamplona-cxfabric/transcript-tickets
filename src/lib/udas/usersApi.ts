import { getQuery } from './udasWrapper';

export interface TenantUser {
  auth0_id: string;
  tenant_id: string;
  username: string | null;
  user_type: string | null;
  role_id: string | null;
  status: 'active' | 'invited' | 'suspended' | string | null;
  first_name: string | null;
  last_name: string | null;
  email_address: string | null;
  image: string | null;
  created_date_time: string | null;
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

export const getTenantUsers = async ({ accessToken, tenantId }: UdasRequestOptions) => {
  const result = await getQuery<{ users: TenantUser[] }>(
    {
      query: `query Users($tenantId: String!) {
        users(tenant_id: $tenantId) {
          auth0_id tenant_id username user_type role_id status first_name last_name
          email_address image created_date_time
        }
      }`,
      variables: { tenantId },
    },
    { accessToken }
  );

  return result.users ?? [];
};

export const getTenantRoles = async ({ accessToken, tenantId }: UdasRequestOptions) => {
  const result = await getQuery<{ roles: TenantRole[] }>(
    {
      query: `query Roles($tenantId: String!) {
        roles(tenant_id: $tenantId) {
          id tenant_id name description status
        }
      }`,
      variables: { tenantId },
    },
    { accessToken }
  );

  return result.roles ?? [];
};

export const updateTenantUserStatus = async ({
  accessToken,
  tenantId,
  auth0Id,
  status,
}: UdasRequestOptions & { auth0Id: string; status: 'active' | 'suspended' }) => {
  const result = await getQuery<{ updateUserStatus: UserActionResult }>(
    {
      query: `mutation UpdateUserStatus($auth0Id: String!, $tenantId: String!, $status: String!) {
        updateUserStatus(auth0_id: $auth0Id, tenant_id: $tenantId, status: $status) {
          isSuccessful message resultObject
        }
      }`,
      variables: { auth0Id, tenantId, status },
    },
    { accessToken }
  );

  return result.updateUserStatus;
};

export const updateTenantUserRole = async ({
  accessToken,
  tenantId,
  auth0Id,
  roleId,
}: UdasRequestOptions & { auth0Id: string; roleId: string }) => {
  const result = await getQuery<{ updateUserRole: UserActionResult }>(
    {
      query: `mutation UpdateUserRole($tenantId: String, $auth0Id: String, $roleId: ID) {
        updateUserRole(tenant_id: $tenantId, auth0_id: $auth0Id, role_id: $roleId) {
          isSuccessful message resultObject
        }
      }`,
      variables: { tenantId, auth0Id, roleId },
    },
    { accessToken }
  );

  return result.updateUserRole;
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
    { accessToken }
  );

  return result.deleteUser;
};
