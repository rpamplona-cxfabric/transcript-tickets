"use client";

import Link from "next/link";
import { FileAudio, ChevronRight, Clock } from "lucide-react";
import { Transcript } from "@/types";

interface RecentTranscriptionsProps {
  transcripts: Transcript[];
  isLoading: boolean;
}

const SkeletonTranscript = () => (
  <div className="app-surface rounded-xl border border-zinc-100 p-4 dark:border-zinc-800">
    <div className="flex items-center justify-between gap-4">
      <div className="h-3 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    </div>
    <div className="mt-3 h-3 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
    <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
  </div>
);

export const RecentTranscriptions = ({
  transcripts,
  isLoading,
}: RecentTranscriptionsProps) => {
  const recentTranscripts = transcripts.slice(0, 3);

  return (
    <div className="app-surface app-shadow-surface flex flex-col rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileAudio className="h-5 w-5 text-zinc-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
            Recent Conversations
          </h2>
        </div>
        <Link
          href="/conversations"
          className="text-xs lg:text-sm font-semibold text-zinc-650 hover:text-zinc-900 flex items-center gap-0.5 hover:underline dark:text-zinc-400 dark:hover:text-white"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }, (_, index) => (
            <SkeletonTranscript key={index} />
          ))
        ) : recentTranscripts.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center text-center">
            <span className="text-sm text-zinc-500">
              No conversations found in database.
            </span>
          </div>
        ) : (
          recentTranscripts.map((t) => (
            <Link
              key={t.transcriptId}
              href={`/conversations?open=${t.transcriptId}`}
              className="app-surface flex flex-col gap-2 rounded-xl border border-zinc-100 p-4 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-[#151d27]"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs lg:text-sm font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                  Tenant: {t.tenantId}
                </span>
                <span className="app-surface app-shadow-control text-[10px] text-zinc-500 whitespace-nowrap border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-zinc-400" />{" "}
                  {t.timestamp
                    ? new Date(t.timestamp).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <p className="text-xs lg:text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 italic">
                &ldquo;
                {t.transcriptSummary || t.transcript || "No summary text."}
                &rdquo;
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
