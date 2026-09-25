import { NextResponse } from "next/server";
import { errorResponse, tenantUnavailable } from "@/lib/api/responses";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import {
  getBusinessSettings,
  updateBusinessHours,
} from "@/lib/db/business-settings";
import { workspaceSettingsSchema } from "@/lib/settings/schemas";
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
    const settings = await getBusinessSettings(tenantId);
    return NextResponse.json(settings);
  } catch (error: unknown) {
    console.error("API Error in GET /api/settings:", error);
    return errorResponse(error, "Unable to retrieve workspace settings.");
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

  try {
    const settings = workspaceSettingsSchema.parse(await request.json());
    const updatedSettings = await updateBusinessHours(tenantId, settings);

    return NextResponse.json(updatedSettings);
  } catch (error: unknown) {
    console.error("API Error in PUT /api/settings:", error);
    return errorResponse(error, "Unable to save business hours.");
  }
}
