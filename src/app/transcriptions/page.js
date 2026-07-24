'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileAudio, 
  Search, 
  Clock, 
  Filter, 
  AlertCircle, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  X, 
  Download,
  Building,
  Hash,
  CheckSquare,
  Plus
} from 'lucide-react';

export default function TranscriptionsPage() {
  const [transcripts, setTranscripts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  // Details slide-over state
  const [activeTranscript, setActiveTranscript] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [transRes, tasksRes] = await Promise.all([
          fetch('/api/transcriptions'),
          fetch('/api/tasks')
        ]);
        if (!transRes.ok) {
          throw new Error('Failed to load transcriptions');
        }
        const transData = await transRes.json();
        setTranscripts(transData);

        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (transcripts.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const openId = params.get('open');
      if (openId) {
        const matchedTranscript = transcripts.find(t => t.transcriptId === openId);
        if (matchedTranscript) {
          setActiveTranscript(matchedTranscript);
        }
      }
    }
  }, [transcripts]);

  // Reset to first page when search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTenant]);

  // Extract unique tenantIds for filtering
  const tenants = ['all', ...new Set(transcripts.map(t => t.tenantId).filter(Boolean))];

  // Filter logic
  const filteredTranscripts = transcripts.filter(t => {
    const matchesSearch = 
      (t.transcript && t.transcript.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.transcriptSummary && t.transcriptSummary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.transcriptId && t.transcriptId.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesTenant = selectedTenant === 'all' || t.tenantId === selectedTenant;
    
    return matchesSearch && matchesTenant;
  });

  // Paginated items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTranscripts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTranscripts.length / itemsPerPage);

  const downloadTextFile = (transcript) => {
    const text = `CXF Transcription Report
------------------------
Tenant ID: ${transcript.tenantId}
Transcript ID: ${transcript.transcriptId}
Date: ${transcript.timestamp || 'N/A'}

--- Summary ---
${transcript.transcriptSummary || 'No summary available.'}

--- Transcript ---
${transcript.transcript || 'No transcript text.'}
`;
    const element = document.createElement("a");
    const file = new Blob([text], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${transcript.transcriptId.slice(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Helper to format timestamps neatly
  const formatTime = (timeStr) => {
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

  // Render raw transcript with speaker cues formatted
  const renderFormattedTranscript = (text) => {
    if (!text) return <p className="text-zinc-500 italic">No transcript text available.</p>;
    
    // Split by bracket speaker markers, e.g., [00:14 - 00:19] Speaker 1: or Speaker 1:
    const lines = text.split('\n');
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;
          
          // Match speaker lines, e.g. [00:00] Speaker or Speaker 1: or [00:00 - 00:30]
          const speakerMatch = line.match(/^(\[.*?\])?\s*(Speaker\s*\d+|[^:]+):(.*)$/);
          
          if (speakerMatch) {
            const timeTag = speakerMatch[1] || '';
            const speakerName = speakerMatch[2] || '';
            const speakerText = speakerMatch[3] || '';
            
            return (
              <div key={idx} className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <span className="text-zinc-900 dark:text-white">{speakerName}</span>
                  {timeTag && (
                    <span className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">
                      {timeTag}
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-300">{speakerText.trim()}</p>
              </div>
            );
          }
          
          return (
            <p key={idx} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 p-2 bg-zinc-50/50 rounded dark:bg-zinc-900/20">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative flex flex-1 bg-zinc-50 dark:bg-zinc-900">
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 p-6 md:p-8 pb-32 min-w-0">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
              Call Transcriptions
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              View and search through your recent call transcriptions.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search transcript keyword or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-white"
            />
          </div>
          <div className="relative w-full sm:w-60 flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3">
            <Filter className="h-4.5 w-4.5 text-zinc-400 mr-2" />
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full bg-transparent py-2.5 text-sm outline-none dark:text-white cursor-pointer"
            >
              <option value="all">All Tenants</option>
              {tenants.filter(t => t !== 'all').map(tenantId => (
                <option key={tenantId} value={tenantId}>
                  {tenantId.length > 15 ? `${tenantId.slice(0, 15)}...` : tenantId}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500 mb-2" />
            <span className="text-sm text-zinc-500">Loading call recordings...</span>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">Failed to load transcripts</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-md">{error}</p>
          </div>
        ) : filteredTranscripts.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950/20">
            <FileAudio className="h-10 w-10 text-zinc-400 mb-3" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white">No transcriptions found</h3>
            <p className="text-sm text-zinc-500 mt-1">Try resetting your search query or selecting a different tenant filter.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-zinc-500 dark:text-zinc-400">
                <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  <tr>
                    <th scope="col" className="px-6 py-4">Tenant ID</th>
                    <th scope="col" className="px-6 py-4">Transcript ID</th>
                    <th scope="col" className="px-6 py-4">Timestamp</th>
                    <th scope="col" className="px-6 py-4">Preview Summary</th>
                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {currentItems.map((t) => (
                    <tr 
                      key={t.transcriptId}
                      onClick={() => setActiveTranscript(t)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition-colors dark:hover:bg-zinc-900/40"
                    >
                      <td className="px-6 py-4.5 font-medium text-zinc-900 dark:text-zinc-200">
                        <span className="truncate max-w-[120px] block" title={t.tenantId}>
                          {t.tenantId}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="font-mono text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                          {t.transcriptId.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{formatTime(t.timestamp)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 max-w-sm">
                        <p className="truncate text-zinc-600 dark:text-zinc-400">
                          {t.transcriptSummary || t.transcript || 'No summary text.'}
                        </p>
                      </td>
                      <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => downloadTextFile(t)}
                            title="Download transcript"
                            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
                          >
                            <Download className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => setActiveTranscript(t)}
                            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-6 py-4 rounded-b-2xl">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-zinc-500">
                      Showing <span className="font-semibold text-zinc-900 dark:text-white">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        {Math.min(indexOfLastItem, filteredTranscripts.length)}
                      </span>{' '}
                      of <span className="font-semibold text-zinc-900 dark:text-white">{filteredTranscripts.length}</span> transcripts
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-xl shadow-xs gap-1" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            currentPage === page
                              ? 'z-10 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                              : 'text-zinc-500 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center rounded-lg border border-zinc-200 bg-white p-2 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-over Transcription Detail Panel */}
      {activeTranscript && (
        <>
          {/* Overlay Background */}
          <div 
            onClick={() => setActiveTranscript(null)}
            className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileAudio className="h-5 w-5 text-zinc-900 dark:text-white" />
                <h2 className="text-base font-bold text-zinc-900 dark:text-white">Transcription Details</h2>
              </div>
              <button
                onClick={() => setActiveTranscript(null)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              


              {/* Timestamp Card */}
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4.5 w-4.5 text-zinc-400" />
                  <span className="text-xs text-zinc-500">Recording Date & Time</span>
                </div>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatTime(activeTranscript.timestamp)}
                </span>
              </div>

              {/* Summary Block */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">AI Summary</h3>
                <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 dark:bg-zinc-900 dark:border-zinc-800">
                  <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
                    {activeTranscript.transcriptSummary || 'Summary not available.'}
                  </p>
                </div>
              </div>

              {/* Full Transcript Block */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Full Audio Transcript</h3>
                <div>
                  {renderFormattedTranscript(activeTranscript.transcript)}
                </div>
              </div>

              {/* Identified Tasks Block (if any) */}
              {(() => {
                const relatedTasks = tasks.filter(t => t.transcriptId === activeTranscript.transcriptId);
                if (relatedTasks.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-450 flex items-center gap-1.5">
                      <CheckSquare className="h-4.5 w-4.5 text-zinc-500" />
                      Identified Tasks
                    </h3>
                    <div className="rounded-xl border border-zinc-150 p-4 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800 space-y-2.5">
                      {relatedTasks.map(task => (
                        <Link
                          key={task.ticketId}
                          href={`/tasks?open=${task.ticketId}`}
                          className="flex items-center justify-between rounded-lg border border-zinc-200/60 bg-white p-3 hover:border-zinc-350 hover:shadow-xs transition duration-150 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 group"
                        >
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                              {task.title}
                            </span>
                            <span className="text-[10px] text-zinc-450 line-clamp-1">{task.description}</span>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${
                            task.priority === 'high' 
                              ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                              : 'bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400'
                          }`}>
                            {task.priority}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Footer Actions */}
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex flex-col gap-2">
              <button
                onClick={() => downloadTextFile(activeTranscript)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-zinc-800 transition dark:bg-white dark:text-zinc-955 dark:hover:bg-zinc-100"
              >
                <Download className="h-4 w-4" />
                Download Transcription Report
              </button>
              
              <Link
                href={`/tasks?createFrom=${activeTranscript.transcriptId}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 hover:border-zinc-450 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-250 dark:hover:bg-zinc-800/80"
              >
                <Plus className="h-4 w-4" />
                Create Task from Transcript
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
