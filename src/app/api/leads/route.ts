import { NextResponse } from 'next/server';
import { addTranscriptLead } from '@/lib/db';

export async function POST(request: Request) {
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
      const updatedTranscript = await addTranscriptLead(transcriptId, {
        leadId,
        name: leadName,
        phoneNumber: phoneNumber || undefined,
        email: email || undefined
      });
      return NextResponse.json({
        success: true,
        action: 'associateLead',
        leadId,
        updatedTranscript
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

    const cxfResponse = await fetch(
      'https://cxf-executor-qa.cxfabric.io/restendpoint?tenant_id=1f23a6b3-fb9a-4af4-84fb-4ba01dad68e8&flow_id=c276db63-834c-4306-9888-a3597860e686&draft=true&targetUserId=auth0_6a58fa6f7d004d7b0c57bac3&displayExecutionLogs=true',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          lastname,
          phoneNumber: phoneNumber ?? '',
          email: email ?? '',
        }),
      }
    );

    if (!cxfResponse.ok) {
      throw new Error(`CXFabric endpoint returned status: ${cxfResponse.status}`);
    }

    const cxfData = await cxfResponse.json();
    const createdLeadId = cxfData?.leadId || cxfData?.result?.leadId;

    if (!createdLeadId) {
      throw new Error('CXFabric did not return a valid leadId');
    }

    const leadName = `${firstname || ''} ${lastname || ''}`.trim() || 'Unknown Lead';

    const updatedTranscript = await addTranscriptLead(transcriptId, {
      leadId: createdLeadId,
      name: leadName,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined
    });

    return NextResponse.json({
      success: true,
      action: 'createOrUpdateLead',
      operation: cxfData.operation || 'created',
      leadId: createdLeadId,
      result: {
        leadId: createdLeadId,
      },
      updatedTranscript
    });
  } catch (error: any) {
    console.error('API Error in POST /api/leads:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create lead and associate with transcript' },
      { status: 500 }
    );
  }
}
