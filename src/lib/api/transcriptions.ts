import api from '@/lib/axios';
import { Transcript } from '@/types';

export const fetchTranscriptions = async (): Promise<Transcript[]> => {
  const { data } = await api.get<Transcript[]>('/transcriptions');
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
  timeoutMs = 20000
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
