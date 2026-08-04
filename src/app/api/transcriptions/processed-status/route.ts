import { NextResponse } from 'next/server';
import { getProcessedTranscripts } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const transcriptId = searchParams.get('transcriptId');

    if (!transcriptId) {
      return NextResponse.json({ error: 'transcriptId is required' }, { status: 400 });
    }

    const processedIds = await getProcessedTranscripts();
    const isProcessed = processedIds.includes(transcriptId);

    return NextResponse.json({ isProcessed });
  } catch (error: any) {
    console.error('API Error in GET /api/transcriptions/processed-status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check processed status' },
      { status: 500 }
    );
  }
}
