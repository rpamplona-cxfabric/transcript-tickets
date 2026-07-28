'use client';

import Link from 'next/link';
import { FileAudio, ChevronRight, Clock } from 'lucide-react';
import { Transcript } from '@/types';

interface RecentTranscriptionsProps {
  transcripts: Transcript[];
}

export const RecentTranscriptions = ({ transcripts }: RecentTranscriptionsProps) => {
  const recentTranscripts = transcripts.slice(0, 3);

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-zinc-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Transcriptions</h2>
        </div>
        <Link 
          href="/transcriptions" 
          className="text-xs font-semibold text-zinc-650 hover:text-zinc-900 flex items-center gap-0.5 hover:underline dark:text-zinc-400 dark:hover:text-white"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {recentTranscripts.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center text-center">
            <span className="text-sm text-zinc-500">No transcriptions found in database.</span>
          </div>
        ) : (
          recentTranscripts.map((t) => (
            <Link 
              key={t.transcriptId} 
              href={`/transcriptions?open=${t.transcriptId}`}
              className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                  Tenant: {t.tenantId}
                </span>
                <span className="text-[10px] text-zinc-500 whitespace-nowrap bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Clock className="h-2.5 w-2.5 text-zinc-400" /> {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 italic">
                &ldquo;{t.transcriptSummary || t.transcript || 'No summary text.'}&rdquo;
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
