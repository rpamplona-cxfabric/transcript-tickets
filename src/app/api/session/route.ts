import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";

export async function GET() {
  const session = await getApiSession();
  if (!session) {
    return unauthorized();
  }

  try {
    const { token } = await auth0.getAccessToken();
    if (!token) {
      return unauthorized();
    }

    return NextResponse.json({ authenticated: true });
  } catch (error: unknown) {
    console.error("Unable to refresh the Auth0 session:", error);
    return unauthorized();
  }
}
