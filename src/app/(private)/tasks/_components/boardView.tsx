'use client';

import { Clock, Trash2 } from 'lucide-react';
import { Task } from '@/types';
import { Select } from '@/components/select';

interface BoardViewProps {
  filteredTasks: Task[];
  handleQuickUpdate: (task: Task, updates: Partial<Task>) => Promise<void>;
  openEditModal: (task: Task) => void;
  setDeletingTaskId: (id: string | null) => void;
}

export const BoardView = ({
  filteredTasks,
  handleQuickUpdate,
  openEditModal,
  setDeletingTaskId
}: BoardViewProps) => {
  const columns: { id: 'open' | 'in-progress' | 'resolved'; title: string; color: string }[] = [
    { id: 'open', title: 'Open Tickets', color: 'bg-sky-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'resolved', title: 'Resolved', color: 'bg-emerald-500' }
  ];

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map(col => {
        const columnTasks = filteredTasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-950/20 flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${col.color}`} />
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">{col.title}</h2>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-zinc-200/60 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
              {columnTasks.map(t => (
                <div
                  key={t.ticketId}
                  onClick={() => openEditModal(t)}
                  className="group flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      t.priority === 'high' 
                        ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50' 
                        : 'bg-zinc-100 text-zinc-650 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                    }`}>
                      <span className={`h-1 w-1 rounded-full ${t.priority === 'high' ? 'bg-red-500' : 'bg-zinc-400'}`} />
                      {t.priority}
                    </span>
                    
                    <Select
                      value={t.status}
                      onChange={(val) => handleQuickUpdate(t, { status: val as any })}
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'resolved', label: 'Resolved' }
                      ]}
                      buttonClassName="text-[10px] py-1 px-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 font-bold dark:text-zinc-300"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {t.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-450 line-clamp-3 leading-relaxed">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-900/60" onClick={(e) => e.stopPropagation()}>
                    <span className="text-[10px] font-medium text-zinc-450 dark:text-zinc-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-zinc-400" /> {formatTime(t.createdAt)}
                    </span>
                    
                    <button
                      onClick={() => setDeletingTaskId(t.ticketId)}
                      title="Delete Task"
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition duration-150 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {columnTasks.length === 0 && (
                <div className="flex h-24 items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800/60 rounded-xl">
                  <span className="text-[11px] text-zinc-450 font-semibold">No tickets in this status</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
