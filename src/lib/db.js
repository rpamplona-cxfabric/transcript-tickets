import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import snappy from 'snappy';

// Initialize the DynamoDB Client
const region = process.env.AWS_REGION || 'us-east-1';
const accessKeyId = process.env.AWS_ACCESS_KEY || '';
const secretAccessKey = process.env.AWS_SECRET_KEY || '';

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
 * Fetch all tickets from `mock-tickets`
 */
export async function getTickets() {
  try {
    const command = new ScanCommand({
      TableName: 'mock-tickets',
    });
    const result = await docClient.send(command);
    const items = result.Items || [];

    // Standardize structure (add default values if fields are missing)
    const tickets = items.map((item) => ({
      ticketId: item.ticketId || '',
      title: item.title || 'Untitled Ticket',
      description: item.description || '',
      priority: item.priority || 'low',
      status: item.status || 'open',
      createdAt: item.createdAt || new Date().toISOString(),
    }));

    // Sort by createdAt descending
    tickets.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });

    return tickets;
  } catch (error) {
    console.error('Error scanning tickets:', error);
    throw error;
  }
}

/**
 * Create a new ticket
 */
export async function createTicket(ticketData) {
  const ticketId = `${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const newTicket = {
    ticketId,
    title: ticketData.title || 'Untitled Ticket',
    description: ticketData.description || '',
    priority: ticketData.priority || 'low',
    status: ticketData.status || 'open',
    createdAt: new Date().toISOString(),
  };

  try {
    const command = new PutCommand({
      TableName: 'mock-tickets',
      Item: newTicket,
    });
    await docClient.send(command);
    return newTicket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

/**
 * Update an existing ticket
 */
export async function updateTicket(ticketId, ticketData) {
  try {
    // Merge updated fields with original ticket
    const scanCommand = new ScanCommand({
      TableName: 'mock-tickets',
    });
    const result = await docClient.send(scanCommand);
    const existingTicket = (result.Items || []).find((t) => t.ticketId === ticketId);

    const updatedTicket = {
      ...existingTicket,
      ticketId,
      title: ticketData.title !== undefined ? ticketData.title : (existingTicket?.title || 'Untitled Ticket'),
      description: ticketData.description !== undefined ? ticketData.description : (existingTicket?.description || ''),
      priority: ticketData.priority !== undefined ? ticketData.priority : (existingTicket?.priority || 'low'),
      status: ticketData.status !== undefined ? ticketData.status : (existingTicket?.status || 'open'),
      createdAt: existingTicket?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: 'mock-tickets',
      Item: updatedTicket,
    });
    await docClient.send(command);
    return updatedTicket;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
}

/**
 * Delete a ticket
 */
export async function deleteTicket(ticketId) {
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
    console.error('Error deleting ticket:', error);
    throw error;
  }
}
