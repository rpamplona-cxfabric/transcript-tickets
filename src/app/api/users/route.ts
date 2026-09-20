import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { getTenantId, getUserAuth0Id } from "@/lib/tenant";
import {
  deleteTenantUser,
  getTenantRoles,
  getTenantUserPermissions,
  getTenantUsers,
} from "@/lib/udas/usersApi";
import {
  USER_PERMISSION_NAMES,
  USER_PERMISSIONS,
  hasUserPermission,
  type TenantPermission,
  type UserPermissionName,
} from "@/lib/permissions";

const getRequestContext = async () => {
  const session = await getApiSession();
  if (!session) return null;

  const tenantId = await getTenantId();
  if (!tenantId)
    throw new Error(
      "The authenticated user does not include a tenant identifier.",
    );
  const actorAuth0Id = await getUserAuth0Id();
  if (!actorAuth0Id)
    throw new Error(
      "The authenticated user does not include a user identifier.",
    );

  const { token } = await auth0.getAccessToken();
  return { session, tenantId, accessToken: token, actorAuth0Id };
};

const errorResponse = (error: unknown) =>
  NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Unable to complete the user request.",
    },
    { status: 502 },
  );

const forbidden = () =>
  NextResponse.json(
    { error: "You do not have permission to perform this action." },
    { status: 403 },
  );

const permissionsFor = async (
  context: NonNullable<Awaited<ReturnType<typeof getRequestContext>>>,
) =>
  getTenantUserPermissions({
    ...context,
    auth0Id: context.actorAuth0Id,
    permissions: USER_PERMISSION_NAMES,
  }) as Promise<TenantPermission[]>;

const targetIsOwner = async (
  context: NonNullable<Awaited<ReturnType<typeof getRequestContext>>>,
  auth0Id: string,
) => {
  const [users, roles] = await Promise.all([
    getTenantUsers(context),
    getTenantRoles(context),
  ]);
  const target = users.find((user) => user.auth0_id === auth0Id);
  return (
    roles.find((role) => role.id === target?.role_id)?.name.toLowerCase() ===
    "owner"
  );
};

const can = (permissions: TenantPermission[], permission: UserPermissionName) =>
  hasUserPermission(permissions, permission);

export async function GET() {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const [users, roles, permissions] = await Promise.all([
      getTenantUsers(context),
      getTenantRoles(context),
      permissionsFor(context),
    ]);
    return NextResponse.json({
      users,
      roles,
      permissions,
      actorAuth0Id: context.actorAuth0Id,
    });
  } catch (error) {
    console.error("API Error in GET /api/users:", error);
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const [permissions, { searchParams }] = await Promise.all([
      permissionsFor(context),
      Promise.resolve(new URL(request.url)),
    ]);
    const auth0Id = searchParams.get("auth0Id") || "";
    if (!auth0Id)
      return NextResponse.json(
        { error: "auth0Id is required." },
        { status: 400 },
      );

    if (
      !can(permissions, USER_PERMISSIONS.REMOVE_USERS) ||
      auth0Id === context.actorAuth0Id ||
      (await targetIsOwner(context, auth0Id))
    )
      return forbidden();
    return NextResponse.json(await deleteTenantUser({ ...context, auth0Id }));
  } catch (error) {
    console.error("API Error in DELETE /api/users:", error);
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const context = await getRequestContext();
    if (!context) return unauthorized();

    const auth0Gateway = process.env.AUTH0_GATEWAY;
    if (!auth0Gateway) {
      return NextResponse.json(
        { error: "AUTH0_GATEWAY is not configured." },
        { status: 500 },
      );
    }

    const [body, permissions] = await Promise.all([
      request.json(),
      permissionsFor(context),
    ]);
    if (!can(permissions, USER_PERMISSIONS.INVITE_USERS)) return forbidden();
    const emails: string[] = Array.isArray(body.emails)
      ? body.emails.filter(
          (email: unknown): email is string => typeof email === "string",
        )
      : [];
    if (
      !emails.length ||
      emails.length > 10 ||
      emails.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    ) {
      return NextResponse.json(
        { error: "Invite between one and ten valid email addresses." },
        { status: 400 },
      );
    }

    const response = await fetch(auth0Gateway, {
      method: "POST",
      headers: {
        "Apollo-Require-Preflight": "true",
        Authorization: `Bearer ${context.accessToken}`,
        "Content-Type": "application/json",
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
            inviter: context.actorAuth0Id,
            messages: typeof body.message === "string" ? body.message : "",
            roles:
              body.roles && typeof body.roles === "object" ? body.roles : {},
          },
        },
      }),
    });
    const payload = await response.json();
    if (!response.ok || payload.errors?.length) {
      return NextResponse.json(
        { error: payload.errors?.[0]?.message || "Unable to send invitation." },
        { status: response.status || 502 },
      );
    }

    return NextResponse.json(payload.data?.inviteUser);
  } catch (error) {
    console.error("API Error in POST /api/users:", error);
    return errorResponse(error);
  }
}
