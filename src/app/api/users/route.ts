import { NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth/auth0';
import { getApiSession, unauthorized } from '@/lib/auth/requireSession';
import { getTenantId } from '@/lib/tenant';
import {
  deleteTenantUser,
  getTenantRoles,
  getTenantUsers,
  updateTenantUserRole,
  updateTenantUserStatus,
} from '@/lib/udas/usersApi';

const getRequestContext = async () => {
  const session = await getApiSession();
  if (!session) return null;

  const tenantId = await getTenantId();
  if (!tenantId) throw new Error('The authenticated user does not include a tenant identifier.');

  const { token } = await auth0.getAccessToken();
  return { session, tenantId, accessToken: token };
};

const errorResponse = (error: unknown) =>
  NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unable to complete the user request.' },
    { status: 502 }
  );

export async function GET() {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const [users, roles] = await Promise.all([
      getTenantUsers(context),
      getTenantRoles(context),
    ]);
    return NextResponse.json({ users, roles });
  } catch (error) {
    console.error('API Error in GET /api/users:', error);
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const body = await request.json();
    const auth0Id = typeof body.auth0Id === 'string' ? body.auth0Id : '';
    if (!auth0Id) return NextResponse.json({ error: 'auth0Id is required.' }, { status: 400 });

    if (body.action === 'status') {
      const status = body.status;
      if (status !== 'active' && status !== 'suspended') {
        return NextResponse.json({ error: 'A valid user status is required.' }, { status: 400 });
      }
      return NextResponse.json(await updateTenantUserStatus({ ...context, auth0Id, status }));
    }

    if (body.action === 'role' && typeof body.roleId === 'string' && body.roleId) {
      return NextResponse.json(await updateTenantUserRole({ ...context, auth0Id, roleId: body.roleId }));
    }

    return NextResponse.json({ error: 'Unsupported user action.' }, { status: 400 });
  } catch (error) {
    console.error('API Error in PATCH /api/users:', error);
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const { searchParams } = new URL(request.url);
    const auth0Id = searchParams.get('auth0Id') || '';
    if (!auth0Id) return NextResponse.json({ error: 'auth0Id is required.' }, { status: 400 });

    return NextResponse.json(await deleteTenantUser({ ...context, auth0Id }));
  } catch (error) {
    console.error('API Error in DELETE /api/users:', error);
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const auth0Gateway = process.env.AUTH0_GATEWAY;
    if (!auth0Gateway) {
      return NextResponse.json({ error: 'AUTH0_GATEWAY is not configured.' }, { status: 500 });
    }

    const body = await request.json();
    const emails: string[] = Array.isArray(body.emails)
      ? body.emails.filter((email: unknown): email is string => typeof email === 'string')
      : [];
    if (!emails.length || emails.length > 10 || emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ error: 'Invite between one and ten valid email addresses.' }, { status: 400 });
    }

    const response = await fetch(auth0Gateway, {
      method: 'POST',
      headers: {
        'Apollo-Require-Preflight': 'true',
        Authorization: `Bearer ${context.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `mutation InviteUser($tenantId: String!, $input: InviteInput) {
          inviteUser(tenantId: $tenantId, input: $input) {
            isSuccessful message resultObject
          }
        }`,
        variables: {
          tenantId: context.tenantId,
          input: {
            emails,
            inviter: context.session.user.sub,
            messages: typeof body.message === 'string' ? body.message : '',
            roles: body.roles && typeof body.roles === 'object' ? body.roles : {},
          },
        },
      }),
    });
    const payload = await response.json();
    if (!response.ok || payload.errors?.length) {
      return NextResponse.json(
        { error: payload.errors?.[0]?.message || 'Unable to send invitation.' },
        { status: response.status || 502 }
      );
    }

    return NextResponse.json(payload.data?.inviteUser);
  } catch (error) {
    console.error('API Error in POST /api/users:', error);
    return errorResponse(error);
  }
}
