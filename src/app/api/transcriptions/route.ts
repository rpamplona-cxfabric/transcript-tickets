import { NextResponse } from 'next/server';
import { getTranscripts, updateTranscriptSpeakerNames } from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const transcripts = await getTranscripts();
    
    const recent20 = transcripts.slice(0, 20);

    if (searchParams.has('page') || searchParams.has('limit')) {
      const startIndex = (page - 1) * limit;
      const paginatedItems = recent20.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        items: paginatedItems,
        total: recent20.length,
        page,
        limit,
        totalPages: Math.ceil(recent20.length / limit)
      });
    }

    return NextResponse.json(recent20);
  } catch (error) {
    console.error('API Error in GET /api/transcriptions:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve transcripts from database' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { transcriptId, speakerNames } = body;

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'transcriptId is required' },
        { status: 400 }
      );
    }

    const updated = await updateTranscriptSpeakerNames(transcriptId, speakerNames);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('API Error in PATCH /api/transcriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transcript speaker names' },
      { status: 500 }
    );
  }
}
