import { NextResponse } from "next/server";
import {
  assignPhoneNumber,
  deletePhoneNumber,
  purchasePhoneNumber,
  getPhoneNumbers,
} from "@/lib/db/phone-numbers";
import { auth0 } from "@/lib/auth/auth0";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { errorResponse, tenantUnavailable } from "@/lib/api/responses";
import { getTenantId } from "@/lib/tenant";
import { getTenantUsers } from "@/lib/udas/usersApi";

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
        routing: "",
        sid: result.sid,
        status: "active",
        tenantId,
      },
    });
  } catch (error: unknown) {
    console.error("API Error in POST /api/phone-numbers:", error);
    return errorResponse(error, "Failed to generate phone number.");
  }
}

export async function PUT(request: Request) {
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
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!phoneNumber) {
    return NextResponse.json(
      { error: "phoneNumber is required." },
      { status: 400 },
    );
  }

  try {
    if (userId) {
      const { token } = await auth0.getAccessToken();
      const users = await getTenantUsers({ accessToken: token, tenantId });
      if (!users.some((user) => user.auth0_id === userId)) {
        return NextResponse.json(
          { error: "The selected user is not in this workspace." },
          { status: 404 },
        );
      }
    }

    await assignPhoneNumber(tenantId, phoneNumber, userId);
    return NextResponse.json({ phoneNumber, success: true, userId });
  } catch (error: unknown) {
    console.error("API Error in PUT /api/phone-numbers:", error);
    return errorResponse(error, "Failed to assign the phone number.");
  }
}

export async function DELETE(request: Request) {
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
  const sid = typeof body.sid === "string" ? body.sid.trim() : "";
  if (!phoneNumber || !sid) {
    return NextResponse.json(
      { error: "phoneNumber and sid are required." },
      { status: 400 },
    );
  }

  try {
    await deletePhoneNumber(tenantId, phoneNumber, sid);
    return NextResponse.json({ phoneNumber, sid, success: true });
  } catch (error: unknown) {
    console.error("API Error in DELETE /api/phone-numbers:", error);
    return errorResponse(error, "Failed to remove the phone number.");
  }
}
