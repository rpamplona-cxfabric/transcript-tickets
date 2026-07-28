'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileAudio, 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  ChevronRight, 
  ArrowUpRight, 
  Activity 
} from 'lucide-react';
import { Task, Transcript } from '@/types';

export default function Dashboard() {
  const [data, setData] = useState<{ tasks: Task[]; transcripts: Transcript[] }>({ tasks: [], transcripts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, transcriptsRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/transcriptions')
        ]);

        if (!tasksRes.ok || !transcriptsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const tasks = await tasksRes.json();
        const transcripts = await transcriptsRes.json();

        setData({ tasks, transcripts });
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-900 dark:text-white" />
          <span className="text-sm text-zinc-500">Loading workspace insights...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-md text-center bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-950 p-6 rounded-2xl shadow-sm">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Error Loading Dashboard</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-950 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { tasks, transcripts } = data;

  // Stat calculations
  const totalTranscripts = transcripts.length;
  const totalTasks = tasks.length;
  const openTasks = tasks.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'resolved').length;

  const recentTranscripts = transcripts.slice(0, 3);
  const recentTasks = tasks.slice(0, 3);

  return (
    <div className="flex-1 bg-zinc-50 p-6 md:p-8 dark:bg-zinc-900 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
          Welcome to CXF Console
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Monitor your customer call transcripts and workspace tasks in real-time.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Metric 1: Transcripts */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Transcriptions</span>
            <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
              <FileAudio className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{totalTranscripts}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-md">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> Synchronized
            </span>
          </div>
        </div>

        {/* Metric 2: Open Tasks */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Tasks</span>
            <div className="rounded-xl bg-zinc-100 p-2.5 text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-white dark:group-hover:text-zinc-950">
              <CheckSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{openTasks}</span>
            <span className="text-xs text-zinc-500">out of {totalTasks} total</span>
          </div>
        </div>

        {/* Metric 3: High Priority Tasks */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Urgent Tasks</span>
            <div className="rounded-xl bg-red-50 p-2.5 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors dark:bg-red-950/20 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{highPriorityTasks}</span>
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-1.5 py-0.5 rounded-md">
              Immediate action
            </span>
          </div>
        </div>

        {/* Metric 4: Health */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950/60 group">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">System Connection</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors dark:bg-emerald-950/20 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-lg font-semibold text-zinc-900 dark:text-white">Active</span>
            <span className="text-xs text-zinc-500">Online</span>
          </div>
        </div>
      </div>

      {/* Grid of Recents */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Transcriptions */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileAudio className="h-5 w-5 text-zinc-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Transcriptions</h2>
            </div>
            <Link 
              href="/transcriptions" 
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-0.5 hover:underline dark:text-zinc-400 dark:hover:text-white"
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

        {/* Recent Tasks */}
        <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-zinc-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Tasks</h2>
            </div>
            <Link 
              href="/tasks" 
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 flex items-center gap-0.5 hover:underline dark:text-zinc-400 dark:hover:text-white"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex-1 space-y-4">
            {recentTasks.length === 0 ? (
              <div className="flex h-36 flex-col items-center justify-center text-center">
                <span className="text-sm text-zinc-500">No tasks found in database.</span>
              </div>
            ) : (
              recentTasks.map((t) => (
                <Link 
                  key={t.ticketId} 
                  href={`/tasks?open=${t.ticketId}`}
                  className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                      {t.title}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${
                        t.priority === 'high' 
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                          : 'bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}>
                        {t.priority}
                      </span>
                      <span className={`text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded ${
                        t.status === 'resolved' 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : t.status === 'in-progress' 
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {t.description}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
