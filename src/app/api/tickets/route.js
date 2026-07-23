import { NextResponse } from 'next/server';
import { getTickets, createTicket } from '../../../lib/db';

export async function GET() {
  try {
    const tickets = await getTickets();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('API Error in GET /api/tickets:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tickets from database' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    const newTicket = await createTicket(body);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/tickets:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket in database' },
      { status: 500 }
    );
  }
}
