import { DeleteCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Task } from '@/types';
import { docClient } from '../client';

const TASKS_TABLE = 'mock-tickets';

export async function getTasks(): Promise<Task[]> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TASKS_TABLE,
    }));
    const items = result.Items || [];

    const tasks = items.map((item) => ({
      ticketId: item.ticketId || '',
      title: item.title || 'Untitled Task',
      description: item.description || '',
      priority: (item.priority || 'low') as 'low' | 'high',
      status: (item.status || 'open') as 'open' | 'in-progress' | 'resolved',
      transcriptId: item.transcriptId || '',
      createdAt: item.createdAt || new Date().toISOString(),
    }));

    tasks.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return tasks;
  } catch (error) {
    console.error('Error scanning tasks:', error);
    throw error;
  }
}

export async function createTask(taskData: Partial<Task>): Promise<Task> {
  const ticketId = `${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const newRawTask: Task = {
    ticketId,
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    priority: (taskData.priority || 'low') as 'low' | 'high',
    status: (taskData.status || 'open') as 'open' | 'in-progress' | 'resolved',
    transcriptId: taskData.transcriptId || '',
    createdAt: new Date().toISOString(),
  };

  try {
    await docClient.send(new PutCommand({
      TableName: TASKS_TABLE,
      Item: newRawTask,
    }));
    return newRawTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTask(ticketId: string, taskData: Partial<Task>): Promise<Task> {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TASKS_TABLE,
    }));
    const existingTask = (result.Items || []).find((task) => task.ticketId === ticketId);

    const updatedTask: Task = {
      ...existingTask,
      ticketId,
      title: taskData.title !== undefined ? taskData.title : (existingTask?.title || 'Untitled Task'),
      description: taskData.description !== undefined ? taskData.description : (existingTask?.description || ''),
      priority: (taskData.priority !== undefined ? taskData.priority : (existingTask?.priority || 'low')) as 'low' | 'high',
      status: (taskData.status !== undefined ? taskData.status : (existingTask?.status || 'open')) as 'open' | 'in-progress' | 'resolved',
      transcriptId: taskData.transcriptId !== undefined ? taskData.transcriptId : (existingTask?.transcriptId || ''),
      createdAt: existingTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({
      TableName: TASKS_TABLE,
      Item: updatedTask,
    }));
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTask(ticketId: string): Promise<{ success: boolean; ticketId: string }> {
  try {
    await docClient.send(new DeleteCommand({
      TableName: TASKS_TABLE,
      Key: {
        ticketId,
      },
    }));
    return { success: true, ticketId };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}
