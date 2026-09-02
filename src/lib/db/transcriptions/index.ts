import axios from 'axios';
// @ts-ignore
import snappy from 'snappy';
import { LeadObject, Transcript } from '@/types';
import { isTranscriptProcessed } from '../processed-transcriptions';

const TRANSCRIPTS_EXECUTOR_URL = 'https://cxf-executor-qa.cxfabric.io/restendpoint';
const TRANSCRIPTS_FLOW_ID = '25bffe69-38a9-497c-b4cf-8d0432ca4373';
type TranscriptRecord = Record<string, any>;

interface GetTranscriptsExecutorResponse {
  success: boolean;
  items: TranscriptRecord[];
  count?: number;
}

interface GetTranscriptExecutorResponse {
  success: boolean;
  item: TranscriptRecord | null;
}

interface TranscriptActionExecutorResponse {
  success: boolean;
}

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

function normalizeLeads(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map(String).filter(Boolean));
  }

  return typeof value === 'string' ? value : undefined;
}

async function formatTranscript(
  item: TranscriptRecord,
  isProcessed: boolean,
  decompress = true
): Promise<Transcript> {
  const transcript = decompress
    ? await decompressField(item.transcript)
    : typeof item.transcript === 'string' ? item.transcript : '';
  const transcriptSummary = decompress
    ? await decompressField(item.transcriptSummary)
    : typeof item.transcriptSummary === 'string' ? item.transcriptSummary : '';

  return {
    ...item,
    transcript,
    transcriptSummary,
    speakerNames: parseSpeakerNames(item.speakerNames),
    leads: normalizeLeads(item.leads),
    isProcessed,
    isIgnored: item.isIgnored === true,
  } as Transcript;
}

export async function ignoreTranscript(
  tenantId: string,
  transcriptId: string
): Promise<{ transcriptId: string; isIgnored: true }> {
  try {
    const { data: result } = await axios.post<TranscriptActionExecutorResponse>(
      TRANSCRIPTS_EXECUTOR_URL,
      { transcriptId },
      {
        params: {
          tenant_id: tenantId,
          flow_id: TRANSCRIPTS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: 'ignoreTranscript',
        },
      },
    );

    if (!result.success) {
      throw new Error('CXFabric failed to ignore the transcript');
    }

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
    const { data: result } = await axios.post<TranscriptActionExecutorResponse>(
      TRANSCRIPTS_EXECUTOR_URL,
      { transcriptId },
      {
        params: {
          tenant_id: tenantId,
          flow_id: TRANSCRIPTS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: 'recoverTranscript',
        },
      },
    );

    if (!result.success) {
      throw new Error('CXFabric failed to recover the transcript');
    }

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
  const { data: result } = await axios.post<GetTranscriptsExecutorResponse>(
    TRANSCRIPTS_EXECUTOR_URL,
    undefined,
    {
      params: {
        tenant_id: tenantId,
        flow_id: TRANSCRIPTS_FLOW_ID,
        draft: true,
        displayExecutionLogs: false,
        action: 'getTranscripts',
      }
    }
  );

  if (!result.success || !Array.isArray(result.items)) {
    throw new Error('CXFabric returned an invalid transcript response');
  }

  const transcripts = await Promise.all(
    result.items.map(async (item) => formatTranscript(
      item,
      await isTranscriptProcessed(tenantId, item.transcriptId),
      false
    ))
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
 * The CXFabric executor returns the complete transcript collection, so filtering,
 * sorting, and pagination are applied in memory to preserve the API's existing shape.
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
    console.error('Error fetching tenant transcripts:', error);
    throw error;
  }
}

export async function getTranscript(
  tenantId: string,
  transcriptId: string
): Promise<Transcript | null> {
  try {
    const { data: result } = await axios.post<GetTranscriptExecutorResponse>(
      TRANSCRIPTS_EXECUTOR_URL,
      { transcriptId },
      {
        params: {
          tenant_id: tenantId,
          flow_id: TRANSCRIPTS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: 'getTranscript',
        },
      }
    );

    if (!result.success) {
      throw new Error('CXFabric returned an invalid transcript response');
    }

    if (!result.item) return null;

    const isProcessed = await isTranscriptProcessed(tenantId, transcriptId);
    return formatTranscript(result.item, isProcessed, false);
  } catch (error) {
    console.error('Error getting tenant transcript:', error);
    throw error;
  }
}

export async function updateTranscriptSpeakerNames(
  tenantId: string,
  transcriptId: string,
  speakerNames: Record<string, string>
): Promise<{
  success: true;
  transcriptId: string;
  speakerNames: Record<string, string>;
}> {
  try {
    const { data: result } = await axios.post<TranscriptActionExecutorResponse>(
      TRANSCRIPTS_EXECUTOR_URL,
      { speakerNames, transcriptId },
      {
        params: {
          tenant_id: tenantId,
          flow_id: TRANSCRIPTS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: 'updateSpeakerNames',
        },
      },
    );

    if (!result.success) {
      throw new Error('CXFabric failed to update transcript speaker names');
    }

    return { success: true, transcriptId, speakerNames };
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
    const leads = [`${leadObj.leadId}`];
    const { data: result } = await axios.post<TranscriptActionExecutorResponse>(
      TRANSCRIPTS_EXECUTOR_URL,
      { leads, transcriptId },
      {
        params: {
          tenant_id: tenantId,
          flow_id: TRANSCRIPTS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: 'addTranscriptLead',
        },
      },
    );

    if (!result.success) {
      throw new Error('CXFabric failed to add the transcript lead');
    }

    const updatedTranscript = await getTranscript(tenantId, transcriptId);
    if (!updatedTranscript) {
      throw new Error(`Transcript not found with id: ${transcriptId}`);
    }

    return updatedTranscript;
  } catch (error) {
    console.error('Error adding transcript lead:', error);
    throw error;
  }
}
