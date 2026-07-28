import { useEffect } from 'react';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { useTaskStore } from '@/lib/store/tasks';

export const useTranscriptionsClient = () => {
  const {
    transcripts,
    isReady: isTranscriptionsReady,
    activeTranscript,
    setActiveTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant
  } = useTranscriptionStore();

  const isTasksReady = useTaskStore((state) => state.isReady);

  useEffect(() => {
    if (transcripts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId) {
        const matchedTranscript = transcripts.find(t => t.transcriptId === openId);
        if (matchedTranscript) {
          setActiveTranscript(matchedTranscript);
        }
      }
    }
  }, [transcripts, setActiveTranscript]);

  const tenants = ['all', ...new Set(transcripts.map(t => t.tenantId).filter(Boolean))];

  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch =
      (t.transcript && t.transcript.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.transcriptSummary && t.transcriptSummary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.transcriptId && t.transcriptId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTenant = selectedTenant === 'all' || t.tenantId === selectedTenant;

    return matchesSearch && matchesTenant;
  });

  const isReady = isTranscriptionsReady && isTasksReady;
  const hasTranscripts = filteredTranscripts.length > 0;

  return {
    isReady,
    activeTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
    tenants,
    hasTranscripts
  };
};
