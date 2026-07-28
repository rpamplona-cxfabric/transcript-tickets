'use client';

import { Search, FileAudio } from 'lucide-react';
import { Select } from '@/components/select';
import { TranscriptionDetailDrawer } from './transcriptionDetailDrawer';
import { TableView } from './tableView';
import { useTranscriptionsClient } from './hook';

export const TranscriptionsClient = () => {
  const {
    isReady,
    activeTranscript,
    searchQuery,
    setSearchQuery,
    selectedTenant,
    setSelectedTenant,
    tenants,
    hasTranscripts
  } = useTranscriptionsClient();

  if (!isReady) {
    return null;
  }

  return (
    <div className="relative flex flex-1 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex flex-col flex-1 p-6 md:p-8 pb-32 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Call Transcriptions
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
              View and search through your recent call transcriptions.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
            value={selectedTenant}
            onChange={setSelectedTenant}
            options={[
              { value: 'all', label: 'All Tenants' },
              ...tenants.filter(t => t !== 'all').map(tenantId => ({
                value: tenantId,
                label: tenantId.length > 15 ? `${tenantId.slice(0, 15)}...` : tenantId
              }))
            ]}
            className="w-full sm:w-60"
          />
        </div>

        {!hasTranscripts ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950/40 text-center">
            <FileAudio className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No transcriptions found</p>
            <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <TableView />
        )}
      </div>

      <TranscriptionDetailDrawer key={activeTranscript ? activeTranscript.transcriptId : 'closed'} />
    </div>
  );
};
