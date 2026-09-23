import { NextResponse } from "next/server";
import { purchasePhoneNumber, getPhoneNumbers } from "@/lib/db/phone-numbers";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { errorResponse, tenantUnavailable } from "@/lib/api/responses";
import { getTenantId } from "@/lib/tenant";

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

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session) {
    return unauthorized();
  }

  const tenantId = await getTenantId();
  if (!tenantId) {
    return tenantUnavailable();
  }

  const body = await request.json();
  const phoneNumber =
    typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "A phone number selection is required." },
      { status: 400 },
    );
  }

  try {
    const result = await purchasePhoneNumber(tenantId, phoneNumber);

    return NextResponse.json({
      ...result,
      item: {
        phoneNumber: result.phoneNumber,
        status: "active",
        tenantId,
      },
    });
  } catch (error: unknown) {
    console.error("API Error in POST /api/phone-numbers:", error);
    return errorResponse(error, "Failed to generate phone number.");
  }
}
