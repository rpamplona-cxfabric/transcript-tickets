import { useEffect } from 'react';
import { useTranscriptionStore } from '@/lib/store/transcriptions';

export const useTranscriptionsClient = () => {
  const {
    transcripts,
    isReady,
    activeTranscript,
    setActiveTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
  } = useTranscriptionStore();

  useEffect(() => {
    if (transcripts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId) {
        const matchedTranscript = transcripts.find((transcript) => transcript.transcriptId === openId);
        if (matchedTranscript) {
          setActiveTranscript(matchedTranscript);
        }
      }
    }
  }, [transcripts, setActiveTranscript]);

  const tenants = ['all', ...new Set(transcripts.map((transcript) => transcript.tenantId).filter(Boolean))];
  const filteredTranscripts = transcripts.filter((transcript) => {
    const matchesSearch =
      (transcript.transcript && transcript.transcript.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transcript.transcriptSummary && transcript.transcriptSummary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (transcript.transcriptId && transcript.transcriptId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTenant = selectedTenant === 'all' || transcript.tenantId === selectedTenant;

    return matchesSearch && matchesTenant;
  });

  return {
    isReady,
    activeTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
    tenants,
    hasTranscripts: filteredTranscripts.length > 0,
  };
};
