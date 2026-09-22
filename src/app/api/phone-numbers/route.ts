import { NextResponse } from "next/server";
import { getPhoneNumbers, generatePhoneNumber } from "@/lib/db/phone-numbers";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { getTenantId } from "@/lib/tenant";

const errorResponse = (error: unknown, fallbackMessage: string) =>
  NextResponse.json(
    {
      error: error instanceof Error ? error.message : fallbackMessage,
    },
    { status: 500 },
  );

const tenantUnavailable = () =>
  NextResponse.json(
    { error: "Tenant ID is unavailable for this user" },
    { status: 403 },
  );

export async function GET() {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) return tenantUnavailable();

  try {
    const phoneNumbers = await getPhoneNumbers(tenantId);

    return NextResponse.json({
      success: true,
      items: phoneNumbers,
      count: phoneNumbers.length,
    });
  } catch (error: unknown) {
    console.error("API Error in GET /api/phone-numbers:", error);
    return errorResponse(error, "Failed to retrieve phone numbers.");
  }
}

export async function POST() {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) return tenantUnavailable();

  try {
    const result = await generatePhoneNumber(tenantId);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("API Error in POST /api/phone-numbers:", error);
    return errorResponse(error, "Failed to generate phone number.");
  }
}
