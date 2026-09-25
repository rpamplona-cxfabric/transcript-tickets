import { NextResponse } from "next/server";
import { errorResponse, tenantUnavailable } from "@/lib/api/responses";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { updateSpamHandling } from "@/lib/db/business-settings";
import { spamHandlingSettingsSchema } from "@/lib/settings/schemas";
import { getTenantId } from "@/lib/tenant";

export async function PUT(request: Request) {
  const session = await getApiSession();
  if (!session) {
    return unauthorized();
  }

  const tenantId = await getTenantId();
  if (!tenantId) {
    return tenantUnavailable();
  }

  try {
    const { spamHandling } = await request.json();
    const updatedSpamHandling = await updateSpamHandling(
      tenantId,
      spamHandlingSettingsSchema.parse(spamHandling),
    );

    return NextResponse.json(updatedSpamHandling);
  } catch (error: unknown) {
    console.error("API Error in PUT /api/settings/spam-handling:", error);
    return errorResponse(error, "Unable to save spam handling.");
  }
}
