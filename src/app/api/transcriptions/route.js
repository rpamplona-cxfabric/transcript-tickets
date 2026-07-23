import { NextResponse } from 'next/server';
import { getTranscripts } from '../../../lib/db';

export async function GET() {
  try {
    const transcripts = await getTranscripts();
    return NextResponse.json(transcripts);
  } catch (error) {
    console.error('API Error in GET /api/transcriptions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcripts from database' },
      { status: 500 }
    );
  }
}
