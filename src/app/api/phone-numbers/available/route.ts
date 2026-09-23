import { NextResponse } from "next/server";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { errorResponse, tenantUnavailable } from "@/lib/api/responses";
import { getTenantId } from "@/lib/tenant";
import { getAvailablePhoneNumbers } from "@/lib/db/phone-numbers";

export async function GET() {
  const session = await getApiSession();
  if (!session) {
    return unauthorized();
  }

  const tenantId = await getTenantId();
  if (!tenantId) {
    return tenantUnavailable();
  }

  try {
    const phoneNumbers = await getAvailablePhoneNumbers(tenantId);
    return NextResponse.json({ phoneNumbers, success: true });
  } catch (error: unknown) {
    console.error("API Error in GET /api/phone-numbers/available:", error);
    return errorResponse(error, "Unable to fetch available phone numbers.");
  }
}
