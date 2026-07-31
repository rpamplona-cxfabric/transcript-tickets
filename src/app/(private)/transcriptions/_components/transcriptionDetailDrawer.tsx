'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileAudio, X, Clock, Plus, CheckSquare, Download, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { useTaskStore } from '@/lib/store/tasks';
import { Select } from '@/components/select';
import { Transcript, LeadObject, SelectOption } from '@/types';

export const TranscriptionDetailDrawer = () => {
  const {
    activeTranscript,
    setActiveTranscript,
    tasks,
    updateTranscript
  } = useTranscriptionStore();
  const [leadFirstName, setLeadFirstName] = useState('');
  const [leadLastName, setLeadLastName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [creatingLead, setCreatingLead] = useState(false);
  const [generatingTasks, setGeneratingTasks] = useState(false);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTranscript) return;
    if (!leadFirstName.trim()) {
      toast.error('First Name is required');
      return;
    }
    setCreatingLead(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: leadFirstName.trim(),
          lastname: leadLastName.trim(),
          phoneNumber: leadPhone.trim(),
          email: leadEmail.trim(),
          transcriptId: activeTranscript.transcriptId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit lead');
      }

      toast.success('Lead created and associated successfully!');
      
      if (data.updatedTranscript) {
        updateTranscript(data.updatedTranscript);
      }

      setLeadFirstName('');
      setLeadLastName('');
      setLeadPhone('');
      setLeadEmail('');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit lead details');
    } finally {
      setCreatingLead(false);
    }
  };

  const handleMapSpeaker = async (speaker: string, mappedName: string) => {
    if (!activeTranscript) return;
    try {
      const updatedSpeakerNames = {
        ...(activeTranscript.speakerNames || {}),
        [speaker]: mappedName
      };

      const response = await fetch('/api/transcriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcriptId: activeTranscript.transcriptId,
          speakerNames: updatedSpeakerNames
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update speaker mapping');
      }

      const updatedTranscript = await response.json();
      updateTranscript(updatedTranscript);
      toast.success(`Mapped ${speaker} to ${mappedName}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update speaker mapping');
    }
  };
  const handleGenerateTasks = async () => {
    if (!activeTranscript) return;
    setGeneratingTasks(true);
    try {
      const response = await fetch('/api/transcriptions/generate-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcriptId: activeTranscript.transcriptId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate tasks');
      }

      toast.success('Task generation triggered successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to trigger task generation');
    } finally {
      setGeneratingTasks(false);
    }
  };
  useEffect(() => {
    if (!activeTranscript || activeTranscript.isProcessed) return;

    const interval = setInterval(async () => {
      try {
        const [transcriptsRes, tasksRes] = await Promise.all([
          fetch('/api/transcriptions', { cache: 'no-store' }),
          fetch('/api/tasks', { cache: 'no-store' }),
        ]);

        if (transcriptsRes.ok && tasksRes.ok) {
          const transcripts = await transcriptsRes.json();
          const tasksList = await tasksRes.json();

          // Find updated version of the current active transcript
          const updated = transcripts.find((t: any) => t.transcriptId === activeTranscript.transcriptId);
          if (updated) {
            updateTranscript(updated);
          }

          // Sync tasks in stores
          useTaskStore.setState({ tasks: tasksList });
          useTranscriptionStore.setState({ transcripts, tasks: tasksList });
        }
      } catch (e) {
        console.error('Error polling workspace status:', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTranscript, updateTranscript]);

  if (!activeTranscript) return null;

  const getSpeakersFromTranscript = (text: string | undefined): string[] => {
    if (!text) return [];
    const speakers = new Set<string>();
    const lines = text.split('\n');
    lines.forEach(line => {
      const speakerMatch = line.match(/^(\[.*?\])?\s*(Speaker\s*\d+|[^:]+):(.*)$/);
      if (speakerMatch) {
        const name = speakerMatch[2].trim();
        if (name.toLowerCase() !== 'transcript') {
          speakers.add(name);
        }
      }
    });
    return Array.from(speakers).sort();
  };

  const downloadTextFile = (transcript: Transcript) => {
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
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${transcript.transcriptId.slice(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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

  const renderFormattedTranscript = (text: string | undefined) => {
    if (!text) return <p className="text-zinc-500 italic">No transcript text available.</p>;

    const lines = text.split('\n');
    return (
      <div className="space-y-4">
        {lines.map((line, idx) => {
          if (!line.trim()) return null;

          const speakerMatch = line.match(/^(\[.*?\])?\s*(Speaker\s*\d+|[^:]+):(.*)$/);

          if (speakerMatch) {
            const timeTag = speakerMatch[1] || '';
            const speakerName = speakerMatch[2] || '';
            const speakerText = speakerMatch[3] || '';
            const displayName = activeTranscript?.speakerNames?.[speakerName] || speakerName;

            return (
              <div key={idx} className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <span className="text-zinc-900 dark:text-white">{displayName}</span>
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

  const relatedTasks = tasks.filter(t => t.transcriptId === activeTranscript.transcriptId);

  const speakers = getSpeakersFromTranscript(activeTranscript.transcript);
  const hasGenericSpeakers = speakers.length > 0;
  const allSpeakersMapped = hasGenericSpeakers && speakers.every(
    speaker => activeTranscript.speakerNames?.[speaker] && activeTranscript.speakerNames[speaker].trim() !== ''
  );
  const hasLeadMapped = speakers.some(
    speaker => activeTranscript.speakerNames?.[speaker] && activeTranscript.speakerNames[speaker] !== 'Seth'
  );
  const canGenerateTasks = !hasGenericSpeakers || (allSpeakersMapped && hasLeadMapped);

  return (
    <>
      <div
        onClick={() => setActiveTranscript(null)}
        className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-zinc-900 dark:text-white" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Transcription Details</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => downloadTextFile(activeTranscript)}
              title="Download Report"
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer animate-fade-in"
            >
              <Download className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveTranscript(null)}
              className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-xs text-zinc-500 font-medium">Recording Date & Time:</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                {formatTime(activeTranscript.timestamp)}
              </span>
            </div>
            <div>
              {activeTranscript.isProcessed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Processed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Pending Tasks
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">AI Summary</h3>
            <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 dark:bg-zinc-900 dark:border-zinc-800">
              <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
                {activeTranscript.transcriptSummary || 'Summary not available.'}
              </p>
            </div>
          </div>

          {!activeTranscript.isProcessed && (
            <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400 flex items-center gap-1.5">
                  <UserPlus className="h-4.5 w-4.5 text-zinc-500" />
                  Identify Contact / Create Lead
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Create a new lead in Lofty for this transcription.</p>
              </div>

              <form onSubmit={handleCreateLead} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">First Name *</label>
                    <input
                      type="text"
                      required
                      value={leadFirstName}
                      onChange={(e) => setLeadFirstName(e.target.value)}
                      placeholder="e.g. John"
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-650"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500">Last Name</label>
                    <input
                      type="text"
                      value={leadLastName}
                      onChange={(e) => setLeadLastName(e.target.value)}
                      placeholder="e.g. Doe"
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-650"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Phone Number</label>
                  <input
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="e.g. +1 555 123 4567"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-650"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase text-zinc-500">Email Address</label>
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="e.g. john.doe@example.com"
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:placeholder-zinc-650"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={creatingLead || !leadFirstName.trim()}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    {creatingLead ? 'Creating...' : 'Create Lead'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Speaker Mapping</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Map generic speakers to their real names.</p>
            </div>

            {getSpeakersFromTranscript(activeTranscript.transcript).length > 0 ? (
              <div className="space-y-3">
                {getSpeakersFromTranscript(activeTranscript.transcript).map((speaker) => {
                  let leadOptions: SelectOption[] = [];
                  if (activeTranscript.leads) {
                    try {
                      const parsed = JSON.parse(activeTranscript.leads) as LeadObject[];
                      if (Array.isArray(parsed)) {
                        leadOptions = parsed.map(lead => ({
                          value: lead.name,
                          label: lead.name
                        }));
                      }
                    } catch (e) {
                      console.error(e);
                    }
                  }

                  const mappedValue = activeTranscript.speakerNames?.[speaker] || '';

                  // Find what other speakers have selected
                  const otherMappedValues = Object.entries(activeTranscript.speakerNames || {})
                    .filter(([otherSpeaker, val]) => otherSpeaker !== speaker && val !== '')
                    .map(([_, val]) => val);

                  const selectOptions: SelectOption[] = [
                    { value: 'Seth', label: 'Seth' },
                    ...leadOptions
                  ].filter(option => !otherMappedValues.includes(option.value));

                  return (
                    <div key={speaker} className="flex items-center justify-between gap-4 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0 text-sm">
                      <span className="text-xs font-bold text-zinc-650 dark:text-zinc-400">{speaker}</span>
                      <Select
                        value={mappedValue}
                        onChange={(val) => handleMapSpeaker(speaker, val)}
                        options={selectOptions}
                        placeholder="Select Lead or Agent"
                        className="w-60"
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs italic text-zinc-500 dark:text-zinc-400 font-medium">No speakers identified in this transcript.</p>
            )}
          </div>

          {activeTranscript.leads && (() => {
            try {
              const leadsArray = JSON.parse(activeTranscript.leads);
              if (Array.isArray(leadsArray) && leadsArray.length > 0) {
                return (
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Associated Leads</h3>
                    <div className="flex flex-wrap gap-2">
                      {leadsArray.map((lead: LeadObject) => (
                        <div
                          key={lead.leadId}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 border border-indigo-100 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-400"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                          {lead.name}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
            } catch (e) {
              console.error('Failed to parse leads array:', e);
            }
            return null;
          })()}

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Full Audio Transcript</h3>
            <div>
              {renderFormattedTranscript(activeTranscript.transcript)}
            </div>
          </div>

          {relatedTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-450 flex items-center gap-1.5"> {/* wait text-zinc-450 */}
                <CheckSquare className="h-4.5 w-4.5 text-zinc-500" />
                Identified Tasks
              </h3>
              <div className="rounded-xl border border-zinc-150 p-4 bg-zinc-50/50 dark:bg-zinc-900 dark:border-zinc-800 space-y-2.5">
                {relatedTasks.map(task => (
                  <Link
                    key={task.ticketId}
                    href={`/tasks?open=${task.ticketId}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-200/60 bg-white p-3 hover:border-zinc-350 hover:shadow-xs transition duration-150 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 group cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1"> {/* wait text-zinc-450 */}
                        {task.description}
                      </span>
                    </div>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full whitespace-nowrap ${task.priority === 'high'
                      ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      : 'bg-zinc-100 text-zinc-650 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}>
                      {task.priority}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {!activeTranscript.isProcessed && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/80 flex flex-col gap-2">
            <div className="flex flex-col gap-1.5 pb-2">
              <button
                disabled={generatingTasks || !canGenerateTasks}
                onClick={handleGenerateTasks}
                className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold shadow transition duration-150 disabled:cursor-not-allowed cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none dark:disabled:bg-zinc-900 dark:disabled:text-zinc-600"
              >
                <CheckSquare className="h-4 w-4" />
                {generatingTasks ? 'Generating Tasks...' : 'Generate Tasks'}
              </button>
              {!canGenerateTasks && (
                <p className="text-[10px] font-medium text-center text-red-550 dark:text-red-400 leading-normal animate-fade-in">
                  {!allSpeakersMapped 
                    ? '* Map all generic speakers (e.g. Speaker 1) above to enable task generation.'
                    : '* Map at least one speaker to a lead (not Seth) to enable task generation.'}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
