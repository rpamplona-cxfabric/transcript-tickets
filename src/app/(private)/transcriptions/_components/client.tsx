'use client';

import { Search, FileAudio, AlertTriangle, RotateCw } from 'lucide-react';
import { Select } from '@/components/select';
import { TranscriptionDetailDrawer } from './transcriptionDetailDrawer';
import { TableView } from './tableView';
import { useTranscriptionsClient } from './hook';

export const TranscriptionsClient = () => {
  const {
    isReady,
    isFetching,
    error,
    refetch,
    activeTranscript,
    setActiveTranscript,
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    transcripts,
    total,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    hasTranscripts,
  } = useTranscriptionsClient();

  if (!isReady) {
    return null;
  }

  return (
    <div className="workspace-canvas relative flex flex-1">
      <div className="flex min-w-0 flex-1 flex-col px-4 pb-24 pt-4 sm:px-6 sm:pb-28 sm:pt-6 md:px-8 md:pb-32 md:pt-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Call Transcriptions
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
              View and search through your recent call transcriptions.
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search transcript keyword or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
            />
          </div>
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value as typeof selectedStatus)}
            options={[
              { value: 'active', label: 'All active' },
              { value: 'pending', label: 'Pending' },
              { value: 'processed', label: 'Processed' },
              { value: 'ignored', label: 'Ignored' },
            ]}
            className="sm:w-44"
          />
        </div>

        {error instanceof Error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
            <div className="flex min-w-0 items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-sm font-semibold">Unable to load transcriptions</p>
                <p className="mt-0.5 text-xs opacity-80">{error.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-semibold hover:bg-amber-100 dark:border-amber-300/30 dark:hover:bg-amber-300/10"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        {!hasTranscripts ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40 text-center">
            <FileAudio className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No transcriptions found</p>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className={isFetching ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <TableView
              transcripts={transcripts}
              total={total}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onSelectTranscript={setActiveTranscript}
            />
          </div>
        )}
      </div>

      <TranscriptionDetailDrawer key={activeTranscript ? activeTranscript.transcriptId : 'closed'} />
    </div>
  );
};
