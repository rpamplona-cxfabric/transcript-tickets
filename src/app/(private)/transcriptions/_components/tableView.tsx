'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranscriptionStore } from '@/lib/store/transcriptions';

export const TableView = () => {
  const {
    transcripts,
    currentPage,
    setCurrentPage,
    setActiveTranscript,
    searchQuery,
    selectedTenant
  } = useTranscriptionStore();

  const itemsPerPage = 20;

  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch =
      (t.transcript && t.transcript.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.transcriptSummary && t.transcriptSummary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.transcriptId && t.transcriptId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTenant = selectedTenant === 'all' || t.tenantId === selectedTenant;

    return matchesSearch && matchesTenant;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTranscripts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTranscripts.length / itemsPerPage);

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return 'N/A';
    try {
      const date = new Date(timeStr);
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs font-bold uppercase text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th scope="col" className="px-6 py-4">Transcript ID</th>
              <th scope="col" className="px-6 py-4">AI Summary</th>
              <th scope="col" className="px-6 py-4">Date & Time</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {currentItems.map((t) => (
              <tr
                key={t.transcriptId}
                onClick={() => setActiveTranscript(t)}
                className="hover:bg-zinc-50 cursor-pointer transition-colors dark:hover:bg-zinc-900/30"
              >
                <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-900 dark:text-zinc-200">
                  {t.transcriptId.slice(0, 8)}...
                </td>
                <td className="px-6 py-4 max-w-sm truncate text-zinc-650 dark:text-zinc-400 font-medium">
                  {t.transcriptSummary || 'No summary available.'}
                </td>
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium">
                  {formatTime(t.timestamp)}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setActiveTranscript(t)}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 rounded-b-2xl">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-zinc-550 font-medium">
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.min(indexOfLastItem, filteredTranscripts.length)}
                </span>{' '}
                of <span className="font-semibold text-zinc-900 dark:text-white">{filteredTranscripts.length}</span> transcripts
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${currentPage === page
                      ? 'z-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                      : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
