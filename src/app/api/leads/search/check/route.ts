import { NextResponse } from 'next/server';
import { checkLeadExists } from '@/lib/db/seth-leads';
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
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';

    if (!firstName && !lastName) {
      return NextResponse.json({ exists: false });
    }

    const exists = await checkLeadExists(tenantId, firstName, lastName);
    return NextResponse.json({ success: true, exists });
  } catch (error: any) {
    console.error('API Error in GET /api/leads/search/check:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check lead duplicate' },
      { status: 500 }
    );
  }
}
