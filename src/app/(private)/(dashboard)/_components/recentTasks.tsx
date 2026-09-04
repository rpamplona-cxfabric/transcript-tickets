'use client';

import Link from 'next/link';
import { CheckSquare, ChevronRight } from 'lucide-react';
import { Task } from '@/types';

interface RecentTasksProps {
  tasks: Task[];
}

export const RecentTasks = ({ tasks }: RecentTasksProps) => {
  const recentTasks = tasks.slice(0, 3);

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-zinc-500" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white">Recent Tasks</h2>
        </div>
        <Link 
          href="/tasks" 
          className="text-xs font-semibold text-zinc-650 hover:text-zinc-900 flex items-center gap-0.5 hover:underline dark:text-zinc-400 dark:hover:text-white"
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
              className="flex flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50"
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
              <p className="text-xs text-zinc-500 dark:text-zinc-450 line-clamp-2">
                {t.description}
              </p>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};
