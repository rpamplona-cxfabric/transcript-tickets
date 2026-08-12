import { NextResponse } from 'next/server';
import { getTranscripts, ignoreTranscript, recoverTranscript, updateTranscriptSpeakerNames } from '@/lib/db/transcriptions';
import { getApiSession, unauthorized } from '@/lib/auth/requireSession';
import { getTenantId } from '@/lib/tenant';

const tenantUnavailable = () =>
  NextResponse.json({ error: 'Tenant ID is unavailable for this user' }, { status: 403 });

export async function GET(request: Request) {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) return tenantUnavailable();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const transcripts = await getTranscripts(tenantId);
    const recent20 = transcripts.slice(0, 20);

    if (searchParams.has('page') || searchParams.has('limit')) {
      const startIndex = (page - 1) * limit;
      const paginatedItems = recent20.slice(startIndex, startIndex + limit);

      return NextResponse.json({
        items: paginatedItems,
        total: recent20.length,
        page,
        limit,
        totalPages: Math.ceil(recent20.length / limit),
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
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) return tenantUnavailable();

  try {

    const body = await request.json();
    const { transcriptId, speakerNames, isIgnored } = body;

    if (!transcriptId) {
      return NextResponse.json(
        { error: 'transcriptId is required' },
        { status: 400 }
      );
    }

    const updated = isIgnored === true
      ? await ignoreTranscript(tenantId, transcriptId)
      : isIgnored === false
        ? await recoverTranscript(tenantId, transcriptId)
        : await updateTranscriptSpeakerNames(tenantId, transcriptId, speakerNames);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('API Error in PATCH /api/transcriptions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transcript speaker names' },
      { status: 500 }
    );
  }
}
