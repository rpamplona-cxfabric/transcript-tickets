'use client';

import { Plus, Search, Kanban, List } from 'lucide-react';
import { Select } from '@/components/select';
import { TaskModal } from './taskModal';
import { DeleteConfirmationModal } from './deleteConfirmationModal';
import { BoardView } from './boardView';
import { ListView } from './listView';
import { useTasksClient } from './hook';

export const TasksClient = () => {
  const {
    isReady,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    editingTask,
    setDeletingTaskId,
    isCreateModalOpen,
    setIsCreateModalOpen,
    openEditModal,
    handleQuickUpdate,
    filteredTasks
  } = useTasksClient();

  if (!isReady) {
    return null;
  }

  return (
    <div className="workspace-canvas relative flex flex-1">
      <div className="flex min-w-0 flex-1 flex-col px-4 pb-24 pt-4 sm:px-6 sm:pb-28 sm:pt-6 md:px-8 md:pb-32 md:pt-8">
        
        <div className="mb-6 flex flex-col justify-between gap-4 md:mb-8 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Support Tickets
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
              Create and manage support tickets identified from call recordings.
            </p>
          </div>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-zinc-800 sm:w-auto dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Create Ticket
          </button>
        </div>

        <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="flex flex-1 flex-col gap-3 lg:flex-row">
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
            
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'low', label: 'Low Priority' },
                { value: 'high', label: 'High Priority' }
              ]}
            />

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

          <div className="flex w-full items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 sm:w-fit dark:border-zinc-800 dark:bg-zinc-950">
            <button
              onClick={() => {
                setViewMode('kanban');
                localStorage.setItem('cxf_task_view_mode', 'kanban');
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none cursor-pointer ${
                viewMode === 'kanban' 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Kanban className="h-4 w-4" /> Board
            </button>
            <button
              onClick={() => {
                setViewMode('list');
                localStorage.setItem('cxf_task_view_mode', 'list');
              }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors sm:flex-none cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <List className="h-4 w-4" /> List
            </button>
          </div>
        </div>

        {viewMode === 'kanban' ? (
          <BoardView
            filteredTasks={filteredTasks}
            handleQuickUpdate={handleQuickUpdate}
            openEditModal={openEditModal}
            setDeletingTaskId={setDeletingTaskId}
          />
        ) : (
          <ListView
            filteredTasks={filteredTasks}
            handleQuickUpdate={handleQuickUpdate}
            openEditModal={openEditModal}
            setDeletingTaskId={setDeletingTaskId}
          />
        )}
      </div>

      <TaskModal key={editingTask ? editingTask.ticketId : (isCreateModalOpen ? 'create' : 'closed')} />
      <DeleteConfirmationModal />
    </div>
  );
};
