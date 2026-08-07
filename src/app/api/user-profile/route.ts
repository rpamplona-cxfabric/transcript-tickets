import { NextResponse } from 'next/server';
import { getApiSession, unauthorized } from '@/lib/auth/requireSession';
import { auth0 } from '@/lib/auth/auth0';
import { getTenantId } from '@/lib/tenant';
import { getUserProfile } from '@/lib/udas/userApi';

export async function GET() {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const auth0Id = session.user.sub;
  const tenantId = await getTenantId();

  if (!auth0Id || !tenantId) {
    return NextResponse.json(
      { error: 'The authenticated user does not include a tenant identifier.' },
      { status: 403 }
    );
  }

  try {
    const { token } = await auth0.getAccessToken();
    const profile = await getUserProfile({ accessToken: token, auth0Id, tenantId });
    return NextResponse.json(profile);
  } catch (error) {
    console.error('API Error in GET /api/user-profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load the user profile.' },
      { status: 502 }
    );
  }
}
