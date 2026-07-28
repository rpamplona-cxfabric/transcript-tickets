import { NextResponse } from 'next/server';
import { updateTask, deleteTask } from '../../../../lib/db';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateTask(id, body);
    return NextResponse.json(updated);
  } catch (error) {
    console.error(`API Error in PUT /api/tasks/[id]:`, error);
    return NextResponse.json(
      { error: 'Failed to update task in database' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteTask(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`API Error in DELETE /api/tasks/[id]:`, error);
    return NextResponse.json(
      { error: 'Failed to delete task from database' },
      { status: 500 }
    );
  }
}
