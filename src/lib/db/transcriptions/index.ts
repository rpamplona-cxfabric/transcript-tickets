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
    isIgnored: item.isIgnored === true,
  } as Transcript;
}

export async function ignoreTranscript(
  tenantId: string,
  transcriptId: string
): Promise<{ transcriptId: string; isIgnored: true }> {
  try {
    await docClient.send(new UpdateCommand({
      TableName: CONTACT_TRANSCRIPTS_TABLE,
      Key: { tenantId, transcriptId },
      UpdateExpression: 'SET #isIgnored = :isIgnored',
      ConditionExpression: 'attribute_exists(#tenantId) AND attribute_exists(#transcriptId)',
      ExpressionAttributeNames: {
        '#isIgnored': 'isIgnored',
        '#tenantId': 'tenantId',
        '#transcriptId': 'transcriptId',
      },
      ExpressionAttributeValues: { ':isIgnored': true },
    }));

    return { transcriptId, isIgnored: true };
  } catch (error) {
    console.error('Error ignoring transcript:', error);
    throw error;
  }
}

export async function recoverTranscript(
  tenantId: string,
  transcriptId: string
): Promise<{ transcriptId: string; isIgnored: false }> {
  try {
    await docClient.send(new UpdateCommand({
      TableName: CONTACT_TRANSCRIPTS_TABLE,
      Key: { tenantId, transcriptId },
      UpdateExpression: 'SET #isIgnored = :isIgnored',
      ConditionExpression: 'attribute_exists(#tenantId) AND attribute_exists(#transcriptId)',
      ExpressionAttributeNames: {
        '#isIgnored': 'isIgnored',
        '#tenantId': 'tenantId',
        '#transcriptId': 'transcriptId',
      },
      ExpressionAttributeValues: { ':isIgnored': false },
    }));

    return { transcriptId, isIgnored: false };
  } catch (error) {
    console.error('Error recovering transcript:', error);
    throw error;
  }
}

export interface GetTranscriptsFilters {
  search?: string;
  tenantId?: string;
  status?: 'active' | 'pending' | 'processed' | 'ignored';
}

export interface GetTranscriptsOptions {
  page?: number;
  limit?: number;
  filters?: GetTranscriptsFilters;
}

export interface PaginatedTranscripts {
  items: Transcript[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

async function fetchAllTranscripts(tenantId: string): Promise<Transcript[]> {
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
}

function applyFilters(transcripts: Transcript[], filters?: GetTranscriptsFilters): Transcript[] {
  if (!filters) return transcripts;

  const { search, tenantId: subTenantId, status } = filters;
  const normalizedSearch = search?.trim().toLowerCase();

  return transcripts.filter((transcript) => {
    const matchesSearch = !normalizedSearch
      || transcript.transcript?.toLowerCase().includes(normalizedSearch)
      || transcript.transcriptSummary?.toLowerCase().includes(normalizedSearch)
      || transcript.transcriptId?.toLowerCase().includes(normalizedSearch);

    const matchesTenant = !subTenantId || subTenantId === 'all' || transcript.tenantId === subTenantId;

    const matchesStatus = !status
      ? true
      : status === 'ignored'
        ? Boolean(transcript.isIgnored)
        : status === 'processed'
          ? !transcript.isIgnored && Boolean(transcript.isProcessed)
          : status === 'pending'
            ? !transcript.isIgnored && !transcript.isProcessed
            : !transcript.isIgnored; // 'active'

    return matchesSearch && matchesTenant && matchesStatus;
  });
}

/**
 * Fetches transcripts for a tenant, applies filtering, and paginates the result.
 *
 * DynamoDB only supports pagination via ExclusiveStartKey (not arbitrary offsets), and
 * filtering/sorting must happen across the full result set for correct counts, so this
 * reads all items for the tenant partition and slices in memory. This is acceptable at
 * current per-tenant data volumes; if a tenant's transcript volume grows significantly,
 * this should move to a GSI with a sort key supporting real cursor-based pagination.
 */
export async function getTranscripts(
  tenantId: string,
  options: GetTranscriptsOptions = {}
): Promise<PaginatedTranscripts> {
  try {
    const { page = 1, limit = 20, filters } = options;

    const allTranscripts = await fetchAllTranscripts(tenantId);
    const filtered = applyFilters(allTranscripts, filters);

    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, limit);
    const startIndex = (safePage - 1) * safeLimit;
    const items = filtered.slice(startIndex, startIndex + safeLimit);

    return {
      items,
      total: filtered.length,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(filtered.length / safeLimit) || 1,
    };
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
