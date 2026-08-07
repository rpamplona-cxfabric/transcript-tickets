import { NextResponse } from 'next/server';
import { isTranscriptProcessed } from '@/lib/db/processed-transcriptions';
import { getApiSession, unauthorized } from '@/lib/auth/requireSession';
import { getTenantId } from '@/lib/tenant';

export async function GET(request: Request) {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant ID is unavailable for this user' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const transcriptId = searchParams.get('transcriptId');

    if (!transcriptId) {
      return NextResponse.json({ error: 'transcriptId is required' }, { status: 400 });
    }

    const isProcessed = await isTranscriptProcessed(tenantId, transcriptId);

    return NextResponse.json({ isProcessed });
  } catch (error: any) {
    console.error('API Error in GET /api/transcriptions/processed-status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check processed status' },
      { status: 500 }
    );
  }
}
