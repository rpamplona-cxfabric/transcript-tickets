import { auth0 } from "@/lib/auth/auth0";

const getStringClaim = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : "";

const getClaimBySuffix = (claims: Record<string, unknown>, suffix: string) => {
  const match = Object.entries(claims).find(([key]) =>
    key.toLowerCase().endsWith(suffix.toLowerCase()),
  );
  return match ? getStringClaim(match[1]) : "";
};

/**
 * The Auth0 SDK validates the ID token during login, then encrypts it into the
 * server session. Decode its payload only on the server to read custom claims
 * that are intentionally omitted from session.user.
 */
const getIdTokenClaims = (
  idToken: string | undefined,
): Record<string, unknown> => {
  if (!idToken) return {};

  try {
    const payload = idToken.split(".")[1];
    if (!payload) return {};
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return {};
  }
};

/**
 * Returns the authenticated user's tenant ID from their server-side Auth0
 * session, or null when there is no session or tenant claim.
 */
export const getTenantId = async (): Promise<string | null> => {
  const session = await auth0.getSession();
  if (!session) return null;

  const user = session.user as Record<string, unknown>;
  const idTokenClaims = getIdTokenClaims(session.tokenSet.idToken);

  return (
    getStringClaim(user.stripeId) ||
    getStringClaim(user.tenant_id) ||
    getStringClaim(user["https://ianswer.io/tenant_id"]) ||
    getStringClaim(idTokenClaims.stripeId) ||
    getStringClaim(idTokenClaims.tenant_id) ||
    getStringClaim(idTokenClaims["https://ianswer.io/tenant_id"]) ||
    null
  );
};

/**
 * UDAS stores the application user id (`cxfUserId`) rather than always using
 * Auth0's subject. Prefer that claim so membership and permission queries use
 * the same identity as the existing frontend.
 */
export const getUserAuth0Id = async (): Promise<string | null> => {
  const session = await auth0.getSession();
  if (!session) return null;

  const user = session.user as Record<string, unknown>;
  const idTokenClaims = getIdTokenClaims(session.tokenSet.idToken);

  return (
    getStringClaim(user.cxfUserId) ||
    getStringClaim(user.auth0_id) ||
    getStringClaim(user["https://ianswer.io/cxfUserId"]) ||
    getClaimBySuffix(user, "/cxfUserId") ||
    getStringClaim(idTokenClaims.cxfUserId) ||
    getStringClaim(idTokenClaims.auth0_id) ||
    getStringClaim(idTokenClaims["https://ianswer.io/cxfUserId"]) ||
    getClaimBySuffix(idTokenClaims, "/cxfUserId") ||
    getStringClaim(user.sub) ||
    null
  );
};
