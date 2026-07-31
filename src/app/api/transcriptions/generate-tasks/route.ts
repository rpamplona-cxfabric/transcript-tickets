import { NextResponse } from 'next/server';
import { getTranscripts } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { transcriptId } = await request.json();

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'transcriptId is required' },
        { status: 400 }
      );
    }

    // 1. Fetch transcript from DynamoDB
    const transcripts = await getTranscripts();
    const transcript = transcripts.find(t => t.transcriptId === transcriptId);

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript not found' },
        { status: 404 }
      );
    }

    // 2. Perform speaker replacement to build the mapped transcript
    let mappedTranscript = transcript.transcript;
    if (transcript.speakerNames) {
      for (const [genericName, mappedName] of Object.entries(transcript.speakerNames)) {
        if (mappedName) {
          // Replace generic name with mapped name (e.g. "Speaker 1:" -> "Cathy Moore:")
          // Handles optional timestamp prefix in brackets, e.g. "[00:01:23] Speaker 1:"
          const escapedGeneric = genericName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
          const regex = new RegExp(`(^|\\n|\\r)(\\[.*?\\])?\\s*${escapedGeneric}\\s*:`, 'g');
          mappedTranscript = mappedTranscript.replace(regex, `$1$2 ${mappedName}:`);
        }
      }
    }

    // 3. Retrieve Flow A webhook URL
    const webhookUrl = process.env.FLOW_A_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('FLOW_A_WEBHOOK_URL environment variable is not set. Task generation will proceed in mock mode.');
      return NextResponse.json({
        success: true,
        message: 'Task generation triggered (mock mode - FLOW_A_WEBHOOK_URL not configured)',
        mappedTranscript
      });
    }

    // 4. Trigger Flow A Webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcriptId: transcript.transcriptId,
        transcript: mappedTranscript,
        transcriptSummary: transcript.transcriptSummary
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Flow A webhook returned status ${response.status}: ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Task generation triggered successfully'
    });
  } catch (error: any) {
    console.error('API Error in POST /api/transcriptions/generate-tasks:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to trigger task generation' },
      { status: 550 }
    );
  }
}
