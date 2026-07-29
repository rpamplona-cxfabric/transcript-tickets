import { getQuery } from './udasWrapper';

export interface UdasUserProfile {
  auth0_id: string;
  tenant_id: string;
  first_name: string | null;
  last_name: string | null;
  email_address: string | null;
  image: string | null;
}

interface UserByIdResponse {
  userbyid: UdasUserProfile | null;
}

interface GetUserProfileOptions {
  accessToken: string;
  auth0Id: string;
  signal?: AbortSignal;
  tenantId: string;
}

export const getUserProfile = async ({
  accessToken,
  auth0Id,
  signal,
  tenantId,
}: GetUserProfileOptions): Promise<UdasUserProfile | null> => {
  const result = await getQuery<UserByIdResponse>(
    {
      query: `
        query UserProfile($auth0Id: String!, $tenantId: String!) {
          userbyid(auth0_id: $auth0Id, tenant_id: $tenantId) {
            auth0_id
            tenant_id
            first_name
            last_name
            email_address
            image
          }
        }
      `,
      variables: {
        auth0Id,
        tenantId,
      },
    },
    {
      accessToken,
      signal,
    }
  );

  return result.userbyid;
};
