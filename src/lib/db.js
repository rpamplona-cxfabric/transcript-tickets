import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import snappy from 'snappy';

// Initialize the DynamoDB Client
const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AMAZON_ACCESS_KEY || '';
const secretAccessKey = process.env.AMAZON_SECRET_KEY || '';

if (!accessKeyId || !secretAccessKey) {
  console.warn('WARNING: AWS credentials are not fully set in environment variables.');
}

const client = new DynamoDBClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Helper to decompress a snappy-compressed base64 string
async function decompressField(value) {
  if (!value) return '';
  try {
    const buf = Buffer.from(value, 'base64');
    const decompressed = await snappy.uncompress(buf, { asBuffer: false });
    return typeof decompressed === 'string' ? decompressed : decompressed.toString('utf8');
  } catch (error) {
    console.error('Error decompressing snappy field:', error);
    // If it fails, return the original string or empty
    return value;
  }
}

/**
 * Fetch and decompress all transcripts from `contact-transcripts`
 */
export async function getTranscripts() {
  try {
    const command = new ScanCommand({
      TableName: 'contact-transcripts',
    });
    const result = await docClient.send(command);
    const items = result.Items || [];

    // Decompress snappy fields in parallel
    const processedItems = await Promise.all(
      items.map(async (item) => {
        const transcript = await decompressField(item.transcript);
        const transcriptSummary = await decompressField(item.transcriptSummary);
        return {
          ...item,
          transcript,
          transcriptSummary,
        };
      })
    );

    // Sort by timestamp descending
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

/**
 * Fetch all tasks from `mock-tickets`
 */
export async function getTasks() {
  try {
    const command = new ScanCommand({
      TableName: 'mock-tickets',
    });
    const result = await docClient.send(command);
    const items = result.Items || [];

    // Standardize structure (add default values if fields are missing)
    const tasks = items.map((item) => ({
      ticketId: item.ticketId || '',
      title: item.title || 'Untitled Task',
      description: item.description || '',
      priority: item.priority || 'low',
      status: item.status || 'open',
      transcriptId: item.transcriptId || '',
      createdAt: item.createdAt || new Date().toISOString(),
    }));

    // Sort by createdAt descending
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

/**
 * Create a new task
 */
export async function createTask(taskData) {
  const ticketId = `${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const newRawTask = {
    ticketId,
    title: taskData.title || 'Untitled Task',
    description: taskData.description || '',
    priority: taskData.priority || 'low',
    status: taskData.status || 'open',
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

/**
 * Update an existing task
 */
export async function updateTask(ticketId, taskData) {
  try {
    // Merge updated fields with original task
    const scanCommand = new ScanCommand({
      TableName: 'mock-tickets',
    });
    const result = await docClient.send(scanCommand);
    const existingTask = (result.Items || []).find((t) => t.ticketId === ticketId);

    const updatedTask = {
      ...existingTask,
      ticketId,
      title: taskData.title !== undefined ? taskData.title : (existingTask?.title || 'Untitled Task'),
      description: taskData.description !== undefined ? taskData.description : (existingTask?.description || ''),
      priority: taskData.priority !== undefined ? taskData.priority : (existingTask?.priority || 'low'),
      status: taskData.status !== undefined ? taskData.status : (existingTask?.status || 'open'),
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

/**
 * Delete a task
 */
export async function deleteTask(ticketId) {
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

/**
 * Update speakerNames for a transcript
 */
export async function updateTranscriptSpeakerNames(transcriptId, speakerNames) {
  try {
    const scanCommand = new ScanCommand({
      TableName: 'contact-transcripts',
    });
    const result = await docClient.send(scanCommand);
    const existing = (result.Items || []).find((t) => t.transcriptId === transcriptId);

    if (!existing) {
      throw new Error(`Transcript not found with id: ${transcriptId}`);
    }

    const updatedItem = {
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
    };
  } catch (error) {
    console.error('Error updating transcript speakerNames:', error);
    throw error;
  }
}
