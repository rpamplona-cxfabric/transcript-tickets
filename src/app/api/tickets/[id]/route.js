import { NextResponse } from 'next/server';
import { updateTicket, deleteTicket } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateTicket(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`API Error in PUT /api/tickets/[id]:`, error);
    return NextResponse.json(
      { error: 'Failed to update ticket in database' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const result = await deleteTicket(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`API Error in DELETE /api/tickets/[id]:`, error);
    return NextResponse.json(
      { error: 'Failed to delete ticket from database' },
      { status: 500 }
    );
  }
}
