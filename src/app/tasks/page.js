'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Loader2, 
  Kanban, 
  List, 
  Clock, 
  X, 
  MessageSquareWarning, 
  AlertCircle,
  FolderKanban,
  Settings,
  ShieldAlert,
  CalendarDays,
  ListTodo,
  FileAudio
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Views
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'low',
    status: 'open',
    transcriptId: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Fetch Tasks
  async function fetchTasks() {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to load tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

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
  }, [tasks]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const createFromId = params.get('createFrom');
    if (createFromId) {
      setFormData({
        title: `Follow-up for Call ${createFromId.slice(0, 8)}`,
        description: `This task was created based on call transcript ${createFromId}.\n\nNext Steps:\n- [ ] Review call details\n- [ ] Action item`,
        priority: 'low',
        status: 'open',
        transcriptId: createFromId
      });
      setIsCreateModalOpen(true);
    }
  }, []);

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketId.includes(searchQuery);

    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Create Task Action
  async function handleCreateTask(e) {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setFormError('Title and description are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: 'open',
          transcriptId: formData.transcriptId || ''
        })
      });

      if (!res.ok) throw new Error('Could not create task');
      
      setIsCreateModalOpen(false);
      setFormData({ title: '', description: '', priority: 'low', status: 'open' });
      await fetchTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  // Edit Task Action
  async function handleEditTask(e) {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setFormError('Title and description are required.');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    try {
      const res = await fetch(`/api/tasks/${editingTask.ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status
        })
      });

      if (!res.ok) throw new Error('Could not update task');

      setEditingTask(null);
      setFormData({ title: '', description: '', priority: 'low', status: 'open' });
      await fetchTasks();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  }

  // Quick Status/Priority Update Action (Inline)
  async function handleQuickUpdate(task, updates) {
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
    } catch (err) {
      console.error(err);
      alert('Error updating task');
    }
  }

  // Delete Task Action
  async function handleDeleteTask() {
    if (!deletingTaskId) return;

    setFormLoading(true);
    try {
      const res = await fetch(`/api/tasks/${deletingTaskId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Could not delete task');

      setDeletingTaskId(null);
      await fetchTasks();
    } catch (err) {
      alert(`Delete error: ${err.message}`);
    } finally {
      setFormLoading(false);
    }
  }

  // Open Edit Modal
  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      transcriptId: task.transcriptId || ''
    });
    setFormError(null);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({ title: '', description: '', priority: 'low', status: 'open', transcriptId: '' });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Helper to format timestamps neatly
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString(undefined, { dateStyle: 'medium' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 p-6 md:p-8 dark:bg-zinc-900 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-zinc-900 text-white p-2 dark:bg-zinc-800">
              <FolderKanban className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Task Workspace
            </h1>
          </div>
          <p className="text-sm text-zinc-555 dark:text-zinc-400">
            Click directly on any task to edit, update status, priority, or delete.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition-all duration-200 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
        >
          <Plus className="h-4.5 w-4.5" />
          Create Task
        </button>
      </div>

      {/* Control panel (Filters and View switch) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs dark:bg-zinc-950 dark:border-zinc-800/80">
        <div className="flex flex-col sm:flex-row flex-1 gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white"
            />
          </div>
          
          {/* Filter Priority */}
          <div className="relative flex items-center bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-850 rounded-xl px-3">
            <Filter className="h-4 w-4 text-zinc-400 mr-2" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent py-2.5 text-sm outline-none dark:text-white cursor-pointer pr-4 font-semibold"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Filter Status (Only active in list view) */}
          {viewMode === 'list' && (
            <div className="relative flex items-center bg-zinc-50/50 dark:bg-zinc-900 border border-zinc-200/85 dark:border-zinc-855 rounded-xl px-3">
              <Filter className="h-4 w-4 text-zinc-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent py-2.5 text-sm outline-none dark:text-white cursor-pointer pr-4 font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 self-start md:self-auto border border-zinc-200/60 dark:border-zinc-800">
          <button
            onClick={() => setViewMode('board')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
              viewMode === 'board' 
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Kanban className="h-3.5 w-3.5" />
            Board View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white' 
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List View
          </button>
        </div>
      </div>

      {/* Main Board/List content */}
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-2" />
          <span className="text-sm text-zinc-500">Loading tasks...</span>
        </div>
      ) : error ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Failed to load tasks</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-md">{error}</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/20">
          <ListTodo className="h-10 w-10 text-zinc-400 mb-3" />
          <h3 className="text-base font-semibold text-zinc-900 dark:text-white">No tasks match criteria</h3>
          <p className="text-sm text-zinc-500 mt-1">Try updating your filters or create a new task.</p>
        </div>
      ) : viewMode === 'board' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid gap-6 md:grid-cols-3">
          {['open', 'in-progress', 'resolved'].map((colStatus) => {
            const columnTasks = filteredTasks.filter(t => t.status === colStatus);
            return (
              <div 
                key={colStatus} 
                className="flex flex-col h-full min-h-[500px] rounded-2xl bg-zinc-100/40 p-4 dark:bg-zinc-950/10 border border-zinc-200/50 dark:border-zinc-800/40"
              >
                {/* Column Title */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      colStatus === 'open' 
                        ? 'bg-sky-500 shadow-sky-500/50' 
                        : colStatus === 'in-progress' 
                        ? 'bg-amber-500 shadow-amber-500/50' 
                        : 'bg-emerald-500 shadow-emerald-500/50'
                    } shadow-md`} />
                    <h2 className="text-xs uppercase tracking-wider font-extrabold text-zinc-700 dark:text-zinc-400">
                      {colStatus === 'in-progress' ? 'In Progress' : colStatus}
                    </h2>
                  </div>
                  <span className="text-[10px] font-extrabold text-zinc-500 bg-zinc-200/60 dark:bg-zinc-850 px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Content */}
                <div className="flex-1 space-y-3.5 overflow-y-auto">
                  {columnTasks.map((t) => (
                    <div 
                      key={t.ticketId}
                      onClick={() => openEditModal(t)}
                      className="group flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:shadow-md hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-950 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          t.priority === 'high' 
                            ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' 
                            : 'bg-zinc-100 text-zinc-650 border border-zinc-200/50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-850'
                        }`}>
                          <span className={`h-1 w-1 rounded-full ${t.priority === 'high' ? 'bg-red-500' : 'bg-zinc-400'}`} />
                          {t.priority}
                        </span>
                        
                        {/* Quick Status Select */}
                        <select
                          value={t.status}
                          onChange={(e) => handleQuickUpdate(t, { status: e.target.value })}
                          className="text-[10px] bg-zinc-50 border border-zinc-200/60 rounded-lg px-2 py-0.5 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 font-bold cursor-pointer outline-none transition focus:border-zinc-500"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
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
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition duration-150"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="flex h-24 items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800/60 rounded-xl">
                      <span className="text-[11px] text-zinc-400 font-medium">No tasks in this column</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
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
                        <select
                          value={t.status}
                          onChange={(e) => handleQuickUpdate(t, { status: e.target.value })}
                          className="text-xs bg-zinc-50 border border-zinc-200/60 rounded-lg px-2 py-0.5 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300 font-bold cursor-pointer"
                        >
                          <option value="open">Open</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.title}</span>
                        <span className="text-xs text-zinc-555 dark:text-zinc-400 line-clamp-1">{t.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={t.priority}
                        onChange={(e) => handleQuickUpdate(t, { priority: e.target.value })}
                        className={`text-xs border rounded-lg px-2.5 py-0.5 font-bold cursor-pointer outline-none ${
                          t.priority === 'high' 
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50' 
                            : 'bg-zinc-100 text-zinc-650 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-805'
                        }`}
                      >
                        <option value="low">Low</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-550 dark:text-zinc-400">
                      {formatTime(t.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setDeletingTaskId(t.ticketId)}
                        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-650 dark:text-zinc-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs" />
          
          {/* Card */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-zinc-550" /> Create Task
              </h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  <MessageSquareWarning className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the core task..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Include extra details and requirements..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Priority</label>
                <div className="grid grid-cols-2 gap-4">
                  {['low', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex items-center justify-center rounded-xl border py-2.5 text-xs font-bold uppercase transition ${
                        formData.priority === p 
                          ? 'border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950 shadow-sm'
                          : 'border-zinc-200 bg-white text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900/60'
                      }`}
                    >
                      {p} Priority
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div onClick={() => setEditingTask(null)} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs" />
          
          {/* Card */}
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-zinc-400 animate-spin-slow" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Edit Task</h2>
              </div>
              <button 
                onClick={() => setEditingTask(null)}
                className="rounded-lg p-1.5 text-zinc-550 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditTask} className="mt-4 space-y-4">
              {formError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 dark:bg-red-950/20 dark:text-red-400">
                  <MessageSquareWarning className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Summarize the core task..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-955 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Detailed Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the task details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-950 dark:focus:ring-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white cursor-pointer font-semibold"
                  >
                    <option value="low">Low Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {/* Status Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white cursor-pointer font-semibold"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Created Date Info */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-150 p-3 flex items-center justify-between dark:bg-zinc-900 dark:border-zinc-800 mt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <CalendarDays className="h-4 w-4" />
                  <span>Created Date:</span>
                </div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  {formatTime(editingTask.createdAt)}
                </span>
              </div>

              {/* Transcript ID Info (if present) */}
              {editingTask.transcriptId && (
                <Link
                  href={`/transcriptions?open=${editingTask.transcriptId}`}
                  className="rounded-xl bg-zinc-50 border border-zinc-150 p-3 flex items-center justify-between hover:bg-zinc-100 hover:border-zinc-300 transition duration-150 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-850 mt-2 cursor-pointer group shadow-2xs"
                >
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <FileAudio className="h-4 w-4 text-zinc-400 group-hover:text-zinc-650 dark:group-hover:text-zinc-300 transition-colors" />
                    <span className="font-semibold text-zinc-550 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">Associated Transcript:</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:underline truncate max-w-[200px]" title={editingTask.transcriptId}>
                    {editingTask.transcriptId}
                  </span>
                </Link>
              )}

              <div className="flex justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-zinc-900 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 transition disabled:opacity-50 dark:bg-white dark:text-zinc-955 dark:hover:bg-zinc-100"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setDeletingTaskId(null)} className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xs" />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 text-red-650">
              <ShieldAlert className="h-6 w-6 shrink-0" />
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">Delete Task Permanently?</h2>
            </div>
            
            <p className="mt-3 text-sm text-zinc-550 leading-relaxed">
              This support task will be permanently deleted. This action is irreversible.
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingTaskId(null)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
              >
                No, Keep Task
              </button>
              <button
                type="button"
                disabled={formLoading}
                onClick={handleDeleteTask}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition disabled:opacity-50"
              >
                {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Yes, Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
