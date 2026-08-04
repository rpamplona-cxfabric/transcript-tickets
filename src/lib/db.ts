import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';
// @ts-ignore
import snappy from 'snappy';
import { Task, Transcript, LeadObject } from '../types';

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

    const processedIds = await getProcessedTranscripts();

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const transcript = await decompressField(item.transcript);
        const transcriptSummary = await decompressField(item.transcriptSummary);

        let speakerNamesObj: Record<string, string> = {};
        if (item.speakerNames) {
          try {
            speakerNamesObj = typeof item.speakerNames === 'string'
              ? JSON.parse(item.speakerNames)
              : item.speakerNames;
          } catch (e) {
            console.error('Error parsing speakerNames:', e);
          }
        }

        return {
          ...item,
          transcript,
          transcriptSummary,
          speakerNames: speakerNamesObj,
          isProcessed: processedIds.includes(item.transcriptId),
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
      speakerNames: JSON.stringify(speakerNames),
    };

    const command = new PutCommand({
      TableName: 'contact-transcripts',
      Item: updatedItem,
    });
    await docClient.send(command);

    const transcript = await decompressField(updatedItem.transcript);
    const transcriptSummary = await decompressField(updatedItem.transcriptSummary);

    const processedIds = await getProcessedTranscripts();

    return {
      ...updatedItem,
      speakerNames,
      transcript,
      transcriptSummary,
      isProcessed: processedIds.includes(updatedItem.transcriptId),
    } as Transcript;
  } catch (error) {
    console.error('Error updating transcript speakerNames:', error);
    throw error;
  }
}

export async function addTranscriptLead(
  transcriptId: string,
  leadObj: LeadObject
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

    let leadIdsArray: Array<string | number> = [];
    if (existing.leads) {
      try {
        const parsed = JSON.parse(existing.leads);
        if (Array.isArray(parsed)) {
          leadIdsArray = parsed.filter(
            (leadId) => leadId !== undefined && leadId !== null && `${leadId}`.trim() !== ''
          );
        }
      } catch (e) {
        console.error('Error parsing existing leads string:', e);
      }
    }

    if (!leadIdsArray.some((existingLeadId) => `${existingLeadId}` === `${leadObj.leadId}`)) {
      leadIdsArray.push(`${leadObj.leadId}`);
    }

    const updatedItem: any = {
      ...existing,
      leads: JSON.stringify(leadIdsArray),
    };

    const command = new PutCommand({
      TableName: 'contact-transcripts',
      Item: updatedItem,
    });
    await docClient.send(command);

    const transcript = await decompressField(updatedItem.transcript);
    const transcriptSummary = await decompressField(updatedItem.transcriptSummary);

    const processedIds = await getProcessedTranscripts();

    let speakerNamesObj: Record<string, string> = {};
    if (updatedItem.speakerNames) {
      try {
        speakerNamesObj = typeof updatedItem.speakerNames === 'string'
          ? JSON.parse(updatedItem.speakerNames)
          : updatedItem.speakerNames;
      } catch (e) {
        console.error('Error parsing speakerNames:', e);
      }
    }

    return {
      ...updatedItem,
      transcript,
      transcriptSummary,
      speakerNames: speakerNamesObj,
      isProcessed: processedIds.includes(updatedItem.transcriptId),
    } as Transcript;
  } catch (error) {
    console.error('Error adding transcript lead:', error);
    throw error;
  }
}

export async function getSethLeadsByIds(leadIds: Array<string | number>): Promise<any[]> {
  try {
    const uniqueIds = Array.from(new Set(leadIds.map((id) => `${id}`.trim()).filter(Boolean)));
    if (uniqueIds.length === 0) return [];

    const result = await docClient.send(new BatchGetCommand({
      RequestItems: { 'seth-leads': { Keys: uniqueIds.map((id) => ({ leadId: id })) } },
    }));

    const items = result.Responses?.['seth-leads'] || [];
    const byId = new Map(items.map((item: any) => [`${item.leadId}`, item]));
    return uniqueIds.map((id) => byId.get(id)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching leads by ids from seth-leads:', error);
    return [];
  }
}

export async function getProcessedTranscripts(): Promise<string[]> {
  try {
    const command = new ScanCommand({
      TableName: 'processed-transcripts',
    });
    const result = await docClient.send(command);
    return (result.Items || []).map(item => item.transcriptId);
  } catch (error) {
    console.error('Error fetching processed transcripts:', error);
    return [];
  }
}

export async function searchSethLeads(query: string): Promise<any[]> {
  try {
    const command = new ScanCommand({
      TableName: 'seth-leads',
    });
    const result = await docClient.send(command);
    const items = result.Items || [];

    if (!query || query.trim() === '') {
      return items.slice(0, 50);
    }

    const lowerQuery = query.toLowerCase().trim();
    const filtered = items.filter((item: any) => {
      const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim().toLowerCase();
      return fullName.includes(lowerQuery) ||
             (item.firstName && item.firstName.toLowerCase().includes(lowerQuery)) ||
             (item.lastName && item.lastName.toLowerCase().includes(lowerQuery));
    });

    return filtered.slice(0, 50);
  } catch (error) {
    console.error('Error scanning seth-leads table:', error);
    return [];
  }
}

export async function checkLeadExists(firstName: string, lastName: string): Promise<boolean> {
  try {
    const command = new ScanCommand({
      TableName: 'seth-leads',
    });
    const result = await docClient.send(command);
    const items = result.Items || [];

    const lowerFirst = firstName.trim().toLowerCase();
    const lowerLast = lastName.trim().toLowerCase();

    return items.some((item: any) => {
      const itemFirst = (item.firstName || '').trim().toLowerCase();
      const itemLast = (item.lastName || '').trim().toLowerCase();
      return itemFirst === lowerFirst && itemLast === lowerLast;
    });
  } catch (error) {
    console.error('Error checking duplicate lead in seth-leads:', error);
    return false;
  }
}
