import { NextResponse } from 'next/server';
import { getSethLeadById, getSethLeads } from '@/lib/db/seth-leads';
import { getApiSession, unauthorized } from '@/lib/auth/requireSession';
import { getTenantId } from '@/lib/tenant';

export async function GET(request: Request) {
  const session = await getApiSession();
  if (!session) return unauthorized();

  const tenantId = await getTenantId();
  if (!tenantId) {
    return NextResponse.json(
      { error: 'Tenant ID is unavailable for this user' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    if (leadId) {
      const lead = await getSethLeadById(tenantId, leadId);
      return NextResponse.json({ success: true, lead });
    }

    const leads = await getSethLeads(tenantId);
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error('API Error in GET /api/leads/search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search leads' },
      { status: 500 }
    );
  }
}
