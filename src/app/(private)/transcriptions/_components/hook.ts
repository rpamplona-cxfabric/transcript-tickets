import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { fetchTranscriptions } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queries/queryKeys';
import { useDebounce } from '@/lib/hooks/useDebounce';

const PAGE_SIZE = 20;

export const useTranscriptionsClient = () => {
  const {
    activeTranscript,
    setActiveTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
  } = useTranscriptionStore();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const queryParams = {
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearchQuery || undefined,
    status: selectedStatus,
    tenant: selectedTenant === 'all' ? undefined : selectedTenant,
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.transcriptionsList(queryParams),
    queryFn: () => fetchTranscriptions(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const transcripts = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    const items = data?.items;
    if (!items || items.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const openId = params.get('open');
    if (!openId) return;

    const matchedTranscript = items.find((transcript) => transcript.transcriptId === openId);
    if (matchedTranscript) {
      setActiveTranscript(matchedTranscript);
    }
  }, [data, setActiveTranscript]);

  return {
    isReady: !isLoading,
    isFetching,
    error,
    refetch,
    activeTranscript,
    setActiveTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
    selectedStatus,
    setSelectedStatus,
    transcripts,
    total,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setCurrentPage,
    hasTranscripts: transcripts.length > 0,
  };
};
