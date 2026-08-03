'use client';

import { Trash2 } from 'lucide-react';
import { Task } from '@/types';
import { Select } from '@/components/select';

interface ListViewProps {
  filteredTasks: Task[];
  handleQuickUpdate: (task: Task, updates: Partial<Task>) => Promise<void>;
  openEditModal: (task: Task) => void;
  setDeletingTaskId: (id: string | null) => void;
}

export const ListView = ({
  filteredTasks,
  handleQuickUpdate,
  openEditModal,
  setDeletingTaskId
}: ListViewProps) => {
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
      <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:hidden">
        {filteredTasks.map((t) => (
          <div
            key={t.ticketId}
            onClick={() => openEditModal(t)}
            className="flex cursor-pointer flex-col gap-3 p-4 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{t.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{t.description}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingTaskId(t.ticketId);
                }}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div onClick={(e) => e.stopPropagation()}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${
                    t.status === 'open' ? 'bg-sky-500' : t.status === 'in-progress' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <Select
                    value={t.status}
                    onChange={(val) => handleQuickUpdate(t, { status: val as any })}
                    options={[
                      { value: 'open', label: 'Open' },
                      { value: 'in-progress', label: 'In Progress' },
                      { value: 'resolved', label: 'Resolved' }
                    ]}
                    className="w-full"
                    buttonClassName="text-xs py-1 px-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 font-bold dark:text-zinc-300"
                  />
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">Priority</p>
                <Select
                  value={t.priority}
                  onChange={(val) => handleQuickUpdate(t, { priority: val as any })}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'high', label: 'High' }
                  ]}
                  className="w-full"
                  buttonClassName={`text-xs py-1 px-2.5 rounded-lg font-bold border ${
                    t.priority === 'high' 
                      ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50' 
                      : 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                  }`}
                />
              </div>
            </div>

            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Created {formatTime(t.createdAt)}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
          <thead className="bg-zinc-50 text-xs font-bold uppercase text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-850">
            <tr>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4">Title & Description</th>
              <th scope="col" className="px-6 py-4">Priority</th>
              <th scope="col" className="px-6 py-4">Created Date</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredTasks.map((t) => (
              <tr 
                key={t.ticketId}
                onClick={() => openEditModal(t)}
                className="hover:bg-zinc-50/50 cursor-pointer transition-colors dark:hover:bg-zinc-900/30 group"
              >
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      t.status === 'open' ? 'bg-sky-500' : t.status === 'in-progress' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    <Select
                      value={t.status}
                      onChange={(val) => handleQuickUpdate(t, { status: val as any })}
                      options={[
                        { value: 'open', label: 'Open' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'resolved', label: 'Resolved' }
                      ]}
                      buttonClassName="text-xs py-1 px-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 font-bold dark:text-zinc-300"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 max-w-sm">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.title}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{t.description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={t.priority}
                    onChange={(val) => handleQuickUpdate(t, { priority: val as any })}
                    options={[
                      { value: 'low', label: 'Low' },
                      { value: 'high', label: 'High' }
                    ]}
                    buttonClassName={`text-xs py-1 px-2.5 rounded-lg font-bold border ${
                      t.priority === 'high' 
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50' 
                        : 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                    }`}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                  {formatTime(t.createdAt)}
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setDeletingTaskId(t.ticketId)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
