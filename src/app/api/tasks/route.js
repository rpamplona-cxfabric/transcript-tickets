import { NextResponse } from 'next/server';
import { getTasks, createTask } from '../../../lib/db';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('API Error in GET /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve tasks from database' },
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
    
    const newTask = await createTask(body);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/tasks:', error);
    return NextResponse.json(
      { error: 'Failed to create task in database' },
      { status: 500 }
    );
  }
}
