import api from '@/lib/axios';
import { PaginatedTranscriptsResponse, Transcript } from '@/types';

export interface FetchTranscriptionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'pending' | 'processed' | 'ignored';
  tenant?: string;
}

export const fetchTranscriptions = async (
  params: FetchTranscriptionsParams = {}
): Promise<PaginatedTranscriptsResponse> => {
  const { page = 1, limit = 20, search, status, tenant } = params;

  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('limit', String(limit));
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  if (tenant) query.set('tenant', tenant);

  const { data } = await api.get<PaginatedTranscriptsResponse>(`/transcriptions?${query.toString()}`);
  return data;
};

export const patchSpeakerNames = async ({
  transcriptId,
  speakerNames,
}: {
  transcriptId: string;
  speakerNames: Record<string, string>;
}): Promise<Transcript> => {
  const { data } = await api.patch<Transcript>('/transcriptions', { transcriptId, speakerNames });
  return data;
};

export const ignoreTranscript = async (transcriptId: string): Promise<{ transcriptId: string; isIgnored: true }> => {
  const { data } = await api.patch<{ transcriptId: string; isIgnored: true }>('/transcriptions', { transcriptId, isIgnored: true });
  return data;
};

export const recoverTranscript = async (transcriptId: string): Promise<{ transcriptId: string; isIgnored: false }> => {
  const { data } = await api.patch<{ transcriptId: string; isIgnored: false }>('/transcriptions', { transcriptId, isIgnored: false });
  return data;
};

export const generateTasks = async ({
  transcriptId,
  leadName,
  leadId,
}: {
  transcriptId: string;
  leadName?: string;
  leadId?: number;
}): Promise<void> => {
  await api.post('/transcriptions/generate-tasks', { transcriptId, leadName, leadId });
};

export const checkProcessedStatus = async (transcriptId: string): Promise<boolean> => {
  const { data } = await api.get<{ isProcessed: boolean }>(
    `/transcriptions/processed-status?transcriptId=${encodeURIComponent(transcriptId)}`
  );
  return data.isProcessed;
};

export const pollUntilProcessed = (
  transcriptId: string,
  intervalMs = 1500,
  timeoutMs = 40000
): Promise<boolean> => {
  return new Promise((resolve) => {
    const start = Date.now();

    const tick = async () => {
      try {
        const processed = await checkProcessedStatus(transcriptId);
        if (processed) {
          resolve(true);
          return;
        }
      } catch(error) {
      }

      if (Date.now() - start >= timeoutMs) {
        resolve(false);
        return;
      }

      setTimeout(tick, intervalMs);
    };

    tick();
  });
};
