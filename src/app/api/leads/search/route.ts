import { NextResponse } from 'next/server';
import { searchSethLeads } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const leads = await searchSethLeads(query);

    return NextResponse.json({
      success: true,
      leads
    });
  } catch (error: any) {
    console.error('API Error in GET /api/leads/search:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search leads' },
      { status: 500 }
    );
  }
}
