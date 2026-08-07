import { NextResponse } from 'next/server';
import axios from 'axios';
import { addTranscriptLead } from '@/lib/db/transcriptions';
import { getApiSession, unauthorized } from '@/lib/auth/requireSession';
import { getTenantId } from '@/lib/tenant';

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is unavailable for this user' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { firstname, lastname, phoneNumber, email, transcriptId, leadId } = body;

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'transcriptId is required' },
        { status: 400 }
      );
    }

    if (leadId) {
      const leadName = `${firstname || ''} ${lastname || ''}`.trim() || 'Unknown Lead';
      const updatedTranscript = await addTranscriptLead(tenantId, transcriptId, {
        leadId,
        name: leadName,
        phoneNumber: phoneNumber || undefined,
        email: email || undefined,
      });
      return NextResponse.json({
        success: true,
        action: 'associateLead',
        leadId,
        updatedTranscript,
      });
    }

    if (!firstname) {
      return NextResponse.json(
        { error: 'firstname is required' },
        { status: 400 }
      );
    }

    if (!lastname) {
      return NextResponse.json(
        { error: 'lastname is required' },
        { status: 400 }
      );
    }

    const { data: cxfData } = await axios.post(
      'https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=1f23a6b3-fb9a-4af4-84fb-4ba01dad68e8&flow_id=c276db63-834c-4306-9888-a3597860e686&draft=true&targetUserId=auth0_6a58fa6f7d004d7b0c57bac3&displayExecutionLogs=true',
      {
        firstname,
        lastname,
        phoneNumber: phoneNumber ?? '',
        email: email ?? '',
      }
    );

    const createdLeadId = cxfData?.leadId;
    if (!createdLeadId) {
      throw new Error('CXFabric did not return a valid leadId');
    }

    const leadName = `${cxfData.firstName || firstname || ''} ${cxfData.lastName || lastname || ''}`.trim() || 'Unknown Lead';
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
      action: 'createOrUpdateLead',
      leadId: createdLeadId,
      result: { leadId: createdLeadId },
      updatedTranscript,
    });
  } catch (error: any) {
    console.error('API Error in POST /api/leads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead and associate with transcript' },
      { status: 500 }
    );
  }
}
