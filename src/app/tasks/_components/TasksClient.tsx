'use client';

import { useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Kanban, 
  List, 
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTaskStore } from '@/lib/store/tasks';
import { Select } from '@/components/select';
import { TaskModal } from './taskModal';
import { DeleteConfirmationModal } from './deleteConfirmationModal';
import { Task } from '../../../types';

interface TasksClientProps {
  initialTasks: Task[];
}

export const TasksClient = ({ initialTasks }: TasksClientProps) => {
  const {
    tasks,
    setTasks,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    setEditingTask,
    setDeletingTaskId,
    setIsCreateModalOpen
  } = useTaskStore();

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
  }, [setEditingTask]);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks, setTasks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('cxf_task_view_mode');
      if (savedMode && (savedMode === 'kanban' || savedMode === 'list')) {
        setViewMode(savedMode as 'kanban' | 'list');
      }
    }
  }, [setViewMode]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to reload tasks');
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId) {
        const matchedTask = tasks.find(t => t.ticketId === openId);
        if (matchedTask) {
          openEditModal(matchedTask);
        }
      }
    }
  }, [tasks, openEditModal]);

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleQuickUpdate = async (task: Task, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${task.ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          ...updates
        })
      });

      if (!res.ok) throw new Error('Quick update failed');
      await fetchTasks();
      toast.success('Task updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketId.includes(searchQuery);

    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

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

  const columns: { id: 'open' | 'in-progress' | 'resolved'; title: string; color: string }[] = [
    { id: 'open', title: 'Open Tickets', color: 'bg-sky-500' },
    { id: 'in-progress', title: 'In Progress', color: 'bg-amber-500' },
    { id: 'resolved', title: 'Resolved', color: 'bg-emerald-500' }
  ];

  return (
    <div className="relative flex flex-1 bg-zinc-50 dark:bg-zinc-900">
      <div className="flex flex-col flex-1 p-6 md:p-8 pb-32 min-w-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Support Tickets
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
              Create and manage support tickets identified from call recordings.
            </p>
          </div>
          
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-zinc-800 transition dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Ticket
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
              />
            </div>
            
            {/* Filter Priority */}
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'low', label: 'Low Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
            />

            {/* Filter Status (Only active in list view) */}
            {viewMode === 'list' && (
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'open', label: 'Open' },
                  { value: 'in-progress', label: 'In Progress' },
                  { value: 'resolved', label: 'Resolved' }
                ]}
              />
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Kanban className="h-4 w-4" /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'list' 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950' 
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <List className="h-4 w-4" /> List
            </button>
          </div>
        </div>

        {/* Board View */}
        {viewMode === 'kanban' ? (
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
                          <p className="text-xs text-zinc-550 dark:text-zinc-450 line-clamp-3 leading-relaxed">
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
        ) : (
          /* List View */
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="overflow-x-auto">
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
        )}
      </div>

      <TaskModal onRefresh={fetchTasks} />
      <DeleteConfirmationModal onRefresh={fetchTasks} />
    </div>
  );
}
