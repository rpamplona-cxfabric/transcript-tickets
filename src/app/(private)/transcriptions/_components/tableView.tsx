'use client';

import { ChevronRight, ChevronLeft } from 'lucide-react';
import { SortableTableHeaderCell, TableHeader, TableSortDirection } from '@/components/tableHeader';
import { StatusBadge } from '@/components/statusBadge';
import { Transcript } from '@/types';

interface TableViewProps {
  transcripts: Transcript[];
  total: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onSelectTranscript: (transcript: Transcript) => void;
  sortField: 'timestamp' | 'status' | 'summary';
  sortDirection: Exclude<TableSortDirection, null>;
  onSort: (field: 'timestamp' | 'status' | 'summary') => void;
}

export const TableView = ({
  transcripts,
  total,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onSelectTranscript,
  sortField,
  sortDirection,
  onSort,
}: TableViewProps) => {
  const indexOfFirstItem = (currentPage - 1) * pageSize;
  const indexOfLastItem = indexOfFirstItem + transcripts.length;

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
    <div className="app-surface app-shadow-surface flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <div className="table-scrollbar min-h-0 flex-1 overflow-y-auto">
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:hidden">
        {transcripts.map((t) => (
          <button
            key={t.transcriptId}
            type="button"
            onClick={() => onSelectTranscript(t)}
            className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-4 p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-[#151d27]"
          >
            <div className="min-w-0 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              {formatTime(t.timestamp)}
            </div>
            <StatusBadge status={t.isIgnored ? 'ignored' : t.isProcessed ? 'processed' : 'pending'} className="shrink-0" />
            <p className="line-clamp-3 text-sm font-medium leading-6 text-zinc-700 dark:text-zinc-300">
              {t.transcriptSummary || 'No summary available.'}
            </p>
            <ChevronRight className="h-4.5 w-4.5 self-center justify-self-end text-zinc-500 dark:text-zinc-400" />
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
          <TableHeader sticky>
            <tr>
              <SortableTableHeaderCell sortDirection={sortField === 'timestamp' ? sortDirection : null} onSort={() => onSort('timestamp')}>DATE &amp; TIME</SortableTableHeaderCell>
              <SortableTableHeaderCell sortDirection={sortField === 'status' ? sortDirection : null} onSort={() => onSort('status')}>STATUS</SortableTableHeaderCell>
              <SortableTableHeaderCell sortDirection={sortField === 'summary' ? sortDirection : null} onSort={() => onSort('summary')}>AI SUMMARY</SortableTableHeaderCell>
              <th scope="col" className="px-6 py-2 text-right">ACTIONS</th>
            </tr>
          </TableHeader>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {transcripts.map((t) => (
              <tr
                key={t.transcriptId}
                onClick={() => onSelectTranscript(t)}
                className="hover:bg-zinc-50 cursor-pointer transition-colors dark:hover:bg-[#151d27]"
              >
                <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400 font-medium">
                  {formatTime(t.timestamp)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={t.isIgnored ? 'ignored' : t.isProcessed ? 'processed' : 'pending'} />
                </td>
                <td className="px-6 py-4 max-w-sm truncate text-zinc-650 dark:text-zinc-400 font-medium">
                  {t.transcriptSummary || 'No summary available.'}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onSelectTranscript(t)}
                      className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-black dark:hover:text-white cursor-pointer"
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
      </div>

      {totalPages > 1 && (
        <div className="app-surface flex shrink-0 items-center justify-between rounded-b-2xl border-t border-zinc-200 px-4 py-4 dark:border-zinc-800 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs lg:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-400 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs lg:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-400 cursor-pointer"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs lg:text-sm text-zinc-550 font-medium">
                Showing <span className="font-semibold text-zinc-900 dark:text-white">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {Math.min(indexOfLastItem, total)}
                </span>{' '}
                of <span className="font-semibold text-zinc-900 dark:text-white">{total}</span> transcripts
              </p>
            </div>
            <div>
              <nav className="inline-flex items-center gap-1" aria-label="Pagination">
                {currentPage > 1 && (
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-black dark:hover:text-white"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                )}

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-normal transition-colors ${currentPage === page
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                      : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-black dark:hover:text-white'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                {currentPage < totalPages && (
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-black dark:hover:text-white"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
