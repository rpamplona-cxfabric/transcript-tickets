import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
// @ts-ignore
import snappy from 'snappy';
import { Task, Transcript } from '../types';

// Initialize the DynamoDB Client
const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AMAZON_ACCESS_KEY || '';
const secretAccessKey = process.env.AMAZON_SECRET_KEY || '';
const sessionToken = process.env.AMAZON_SESSION_TOKEN;
const hasCustomCredentials = Boolean(accessKeyId && secretAccessKey);

if ((accessKeyId || secretAccessKey) && !hasCustomCredentials) {
  console.warn(
    'WARNING: Ignoring incomplete AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY credentials. Falling back to the AWS SDK credential provider chain.'
  );
}

const client = new DynamoDBClient({
  region,
  ...(hasCustomCredentials
    ? {
        credentials: {
          accessKeyId,
          secretAccessKey,
          ...(sessionToken ? { sessionToken } : {}),
        },
      }
    : {}),
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});


async function decompressField(value: string | undefined): Promise<string> {
  if (!value) return '';
  try {
    const buf = Buffer.from(value, 'base64');
    const decompressed = await snappy.uncompress(buf, { asBuffer: false });
    return typeof decompressed === 'string' ? decompressed : decompressed.toString('utf8');
  } catch (error) {
    console.error('Error decompressing snappy field:', error);

    return value;
  }
}

export async function getTranscripts(): Promise<Transcript[]> {
  try {
    const command = new ScanCommand({
      TableName: 'contact-transcripts',
    });
    const result = await docClient.send(command);
    const items = result.Items || [];

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const transcript = await decompressField(item.transcript);
        const transcriptSummary = await decompressField(item.transcriptSummary);
        return {
          ...item,
          transcript,
          transcriptSummary,
        } as Transcript;
      })
    );

    processedItems.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    return processedItems;
  } catch (error) {
    console.error('Error scanning transcripts:', error);
    throw error;
  }
}

export async function getTasks(): Promise<Task[]> {
  try {
    const command = new ScanCommand({
      TableName: 'mock-tickets',
    });
    const result = await docClient.send(command);
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
    const command = new PutCommand({
      TableName: 'mock-tickets',
      Item: newRawTask,
    });
    await docClient.send(command);
    return newRawTask;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

export async function updateTask(ticketId: string, taskData: Partial<Task>): Promise<Task> {
  try {
    const scanCommand = new ScanCommand({
      TableName: 'mock-tickets',
    });
    const result = await docClient.send(scanCommand);
    const existingTask = (result.Items || []).find((t) => t.ticketId === ticketId);

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

    const command = new PutCommand({
      TableName: 'mock-tickets',
      Item: updatedTask,
    });
    await docClient.send(command);
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

export async function deleteTask(ticketId: string): Promise<{ success: boolean; ticketId: string }> {
  try {
    const command = new DeleteCommand({
      TableName: 'mock-tickets',
      Key: {
        ticketId,
      },
    });
    await docClient.send(command);
    return { success: true, ticketId };
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

export async function updateTranscriptSpeakerNames(
  transcriptId: string,
  speakerNames: Record<string, string>
): Promise<Transcript> {
  try {
    const scanCommand = new ScanCommand({
      TableName: 'contact-transcripts',
    });
    const result = await docClient.send(scanCommand);
    const existing = (result.Items || []).find((t) => t.transcriptId === transcriptId) as any;

    if (!existing) {
      throw new Error(`Transcript not found with id: ${transcriptId}`);
    }

    const updatedItem: any = {
      ...existing,
      speakerNames: speakerNames,
    };

    const command = new PutCommand({
      TableName: 'contact-transcripts',
      Item: updatedItem,
    });
    await docClient.send(command);

    const transcript = await decompressField(updatedItem.transcript);
    const transcriptSummary = await decompressField(updatedItem.transcriptSummary);

    return {
      ...updatedItem,
      transcript,
      transcriptSummary,
    } as Transcript;
  } catch (error) {
    console.error('Error updating transcript speakerNames:', error);
    throw error;
  }
}
