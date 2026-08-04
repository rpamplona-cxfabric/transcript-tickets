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
