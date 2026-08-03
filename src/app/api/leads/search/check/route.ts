import { NextResponse } from 'next/server';
import { checkLeadExists } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const firstName = searchParams.get('firstName') || '';
    const lastName = searchParams.get('lastName') || '';

    if (!firstName && !lastName) {
      return NextResponse.json({ exists: false });
    }

    const exists = await checkLeadExists(firstName, lastName);

    return NextResponse.json({
      success: true,
      exists
    });
  } catch (error: any) {
    console.error('API Error in GET /api/leads/search/check:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check lead duplicate' },
      { status: 500 }
    );
  }
}
