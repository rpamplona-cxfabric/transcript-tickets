import { NextResponse } from 'next/server';
import axios from 'axios';
import { getTranscript } from '@/lib/db/transcriptions';
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
    const { transcriptId, leadName, leadId } = await request.json();

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'transcriptId is required' },
        { status: 400 }
      );
    }

    const transcript = await getTranscript(tenantId, transcriptId);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    let mappedTranscript = transcript.transcript;
    if (transcript.speakerNames) {
      for (const [genericName, mappedName] of Object.entries(transcript.speakerNames)) {
        if (mappedName) {
          const escapedGeneric = genericName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`(^|\\n|\\r)(\\[.*?\\])?\\s*${escapedGeneric}\\s*:`, 'g');
          mappedTranscript = mappedTranscript.replace(regex, `$1$2 ${mappedName}:`);
        }
      }
    }

    const webhookUrl = process.env.FLOW_A_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('FLOW_A_WEBHOOK_URL environment variable is not set. Task generation will proceed in mock mode.');
      return NextResponse.json({
        success: true,
        message: 'Task generation triggered (mock mode - FLOW_A_WEBHOOK_URL not configured)',
        mappedTranscript,
        leadName,
        leadId,
      });
    }

    await axios.post(webhookUrl, {
      transcriptId: transcript.transcriptId,
      transcript: mappedTranscript,
      transcriptSummary: transcript.transcriptSummary,
      leadName,
      leadId,
      fromPortal: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Task generation triggered successfully',
    });
  } catch (error: any) {
    console.error('API Error in POST /api/transcriptions/generate-tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to trigger task generation' },
      { status: 550 }
    );
  }
}
