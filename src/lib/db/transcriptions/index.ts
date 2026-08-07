import { GetCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
// @ts-ignore
import snappy from 'snappy';
import { LeadObject, Transcript } from '@/types';
import { docClient } from '../client';
import { getProcessedTranscripts } from '../processed-transcriptions';

const CONTACT_TRANSCRIPTS_TABLE = 'contact-transcripts';
type TranscriptRecord = Record<string, any>;
type QueryPaginationKey = import('@aws-sdk/lib-dynamodb').QueryCommandInput['ExclusiveStartKey'];

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

function parseSpeakerNames(value: unknown): Record<string, string> {
  if (!value) return {};

  let parsed = value;
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) return {};

    try {
      parsed = JSON.parse(trimmedValue);
    } catch {
      return {};
    }
  }

  return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, string>
    : {};
}

async function formatTranscript(
  item: TranscriptRecord,
  processedIds: string[]
): Promise<Transcript> {
  const transcript = await decompressField(item.transcript);
  const transcriptSummary = await decompressField(item.transcriptSummary);

  return {
    ...item,
    transcript,
    transcriptSummary,
    speakerNames: parseSpeakerNames(item.speakerNames),
    isProcessed: processedIds.includes(item.transcriptId),
  } as Transcript;
}

export async function getTranscripts(tenantId: string): Promise<Transcript[]> {
  try {
    const items: TranscriptRecord[] = [];
    let lastEvaluatedKey: QueryPaginationKey;

    do {
      const result = await docClient.send(new QueryCommand({
        TableName: CONTACT_TRANSCRIPTS_TABLE,
        KeyConditionExpression: '#tenantId = :tenantId',
        ExpressionAttributeNames: {
          '#tenantId': 'tenantId',
        },
        ExpressionAttributeValues: {
          ':tenantId': tenantId,
        },
        ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {}),
      }));

      items.push(...((result.Items || []) as TranscriptRecord[]));
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    const processedIds = await getProcessedTranscripts(tenantId);
    const transcripts = await Promise.all(
      items.map((item) => formatTranscript(item, processedIds))
    );

    transcripts.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });

    return transcripts;
  } catch (error) {
    console.error('Error querying tenant transcripts:', error);
    throw error;
  }
}

export async function getTranscript(
  tenantId: string,
  transcriptId: string
): Promise<Transcript | null> {
  try {
    const result = await docClient.send(new GetCommand({
      TableName: CONTACT_TRANSCRIPTS_TABLE,
      Key: {
        tenantId,
        transcriptId,
      },
    }));

    if (!result.Item) return null;

    const processedIds = await getProcessedTranscripts(tenantId);
    return formatTranscript(result.Item as TranscriptRecord, processedIds);
  } catch (error) {
    console.error('Error getting tenant transcript:', error);
    throw error;
  }
}

export async function updateTranscriptSpeakerNames(
  tenantId: string,
  transcriptId: string,
  speakerNames: Record<string, string>
): Promise<Transcript> {
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: CONTACT_TRANSCRIPTS_TABLE,
      Key: {
        tenantId,
        transcriptId,
      },
      UpdateExpression: 'SET #speakerNames = :speakerNames',
      ConditionExpression: 'attribute_exists(#tenantId) AND attribute_exists(#transcriptId)',
      ExpressionAttributeNames: {
        '#speakerNames': 'speakerNames',
        '#tenantId': 'tenantId',
        '#transcriptId': 'transcriptId',
      },
      ExpressionAttributeValues: {
        ':speakerNames': JSON.stringify(speakerNames),
      },
      ReturnValues: 'ALL_NEW',
    }));

    if (!result.Attributes) {
      throw new Error(`Transcript not found with id: ${transcriptId}`);
    }

    const processedIds = await getProcessedTranscripts(tenantId);
    return formatTranscript(result.Attributes as TranscriptRecord, processedIds);
  } catch (error) {
    console.error('Error updating transcript speakerNames:', error);
    throw error;
  }
}

export async function addTranscriptLead(
  tenantId: string,
  transcriptId: string,
  leadObj: LeadObject
): Promise<Transcript> {
  try {
    const existingResult = await docClient.send(new GetCommand({
      TableName: CONTACT_TRANSCRIPTS_TABLE,
      Key: {
        tenantId,
        transcriptId,
      },
    }));
    const existing = existingResult.Item as TranscriptRecord | undefined;

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
      } catch (error) {
        console.error('Error parsing existing leads string:', error);
      }
    }

    if (!leadIdsArray.some((existingLeadId) => `${existingLeadId}` === `${leadObj.leadId}`)) {
      leadIdsArray.push(`${leadObj.leadId}`);
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: CONTACT_TRANSCRIPTS_TABLE,
      Key: {
        tenantId,
        transcriptId,
      },
      UpdateExpression: 'SET #leads = :leads',
      ConditionExpression: 'attribute_exists(#tenantId) AND attribute_exists(#transcriptId)',
      ExpressionAttributeNames: {
        '#leads': 'leads',
        '#tenantId': 'tenantId',
        '#transcriptId': 'transcriptId',
      },
      ExpressionAttributeValues: {
        ':leads': JSON.stringify(leadIdsArray),
      },
      ReturnValues: 'ALL_NEW',
    }));

    if (!result.Attributes) {
      throw new Error(`Transcript not found with id: ${transcriptId}`);
    }

    const processedIds = await getProcessedTranscripts(tenantId);
    return formatTranscript(result.Attributes as TranscriptRecord, processedIds);
  } catch (error) {
    console.error('Error adding transcript lead:', error);
    throw error;
  }
}
