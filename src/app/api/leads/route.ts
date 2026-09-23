import { NextResponse } from "next/server";
import { addTranscriptLead } from "@/lib/db/transcriptions";
import { executeCreateLeadFlow } from "@/lib/db/leads/flow";
import { getApiSession, unauthorized } from "@/lib/auth/requireSession";
import { errorResponse, tenantUnavailable } from "@/lib/api/responses";
import { getTenantId } from "@/lib/tenant";

interface CreateLeadExecutorResponse {
  emails?: string[];
  firstName?: string;
  lastName?: string;
  leadId?: string;
  phones?: string[];
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

  try {
    const body = await request.json();
    const { firstname, lastname, phoneNumber, email, transcriptId, leadId } =
      body;

    if (!transcriptId) {
      return NextResponse.json(
        { error: "transcriptId is required" },
        { status: 400 },
      );
    }

    if (leadId) {
      const leadName =
        `${firstname || ""} ${lastname || ""}`.trim() || "Unknown Lead";
      const updatedTranscript = await addTranscriptLead(
        tenantId,
        transcriptId,
        {
          leadId,
          name: leadName,
          phoneNumber: phoneNumber || undefined,
          email: email || undefined,
        },
      );
      return NextResponse.json({
        success: true,
        action: "associateLead",
        leadId,
        updatedTranscript,
      });
    }

    if (!firstname) {
      return NextResponse.json(
        { error: "firstname is required" },
        { status: 400 },
      );
    }

    if (!lastname) {
      return NextResponse.json(
        { error: "lastname is required" },
        { status: 400 },
      );
    }

    const cxfData = await executeCreateLeadFlow<CreateLeadExecutorResponse>({
      payload: {
        firstname,
        lastname,
        phoneNumber: phoneNumber ?? "",
        email: email ?? "",
      },
      tenantId,
    });

    const createdLeadId = cxfData?.leadId;
    if (!createdLeadId) {
      throw new Error("CXFabric did not return a valid leadId");
    }

    const leadName =
      `${cxfData.firstName || firstname || ""} ${cxfData.lastName || lastname || ""}`.trim() ||
      "Unknown Lead";
    const resolvedPhone = cxfData.phones?.[0] || phoneNumber || undefined;
    const resolvedEmail = cxfData.emails?.[0] || email || undefined;

    const updatedTranscript = await addTranscriptLead(tenantId, transcriptId, {
      leadId: createdLeadId,
      name: leadName,
      phoneNumber: resolvedPhone,
      email: resolvedEmail,
    });

    return NextResponse.json({
      success: true,
      action: "createOrUpdateLead",
      leadId: createdLeadId,
      result: { leadId: createdLeadId },
      updatedTranscript,
    });
  } catch (error: unknown) {
    console.error("API Error in POST /api/leads:", error);
    return errorResponse(
      error,
      "Failed to create lead and associate with transcript",
    );
  }
}
