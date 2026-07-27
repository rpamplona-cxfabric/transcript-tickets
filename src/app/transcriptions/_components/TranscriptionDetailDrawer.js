'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileAudio, X, Clock, Plus, CheckSquare, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranscriptionStore } from '../../../lib/store';
import Select from '../../../components/Select';

export default function TranscriptionDetailDrawer() {
  const {
    activeTranscript,
    setActiveTranscript,
    tasks,
    updateTranscript
  } = useTranscriptionStore();

  const [speakerMappings, setSpeakerMappings] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTranscript) {
      const initialMappings = Object.entries(activeTranscript.speakerNames || {}).map(([speaker, mappedName]) => ({
        speaker,
        mappedName
      }));
      setSpeakerMappings(initialMappings);
    } else {
      setSpeakerMappings([]);
    }
  }, [activeTranscript]);

  if (!activeTranscript) return null;

  const getSpeakersFromTranscript = (text) => {
    if (!text) return [];
    const speakers = new Set();
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

  const getAvailableSpeakers = (currentIndex) => {
    const allSpeakers = getSpeakersFromTranscript(activeTranscript.transcript);
    const selectedOtherSpeakers = speakerMappings
      .filter((_, idx) => idx !== currentIndex)
      .map(m => m.speaker)
      .filter(Boolean);
    return allSpeakers.filter(s => !selectedOtherSpeakers.includes(s));
  };

  const handleAddMapping = () => {
    const allSpeakers = getSpeakersFromTranscript(activeTranscript.transcript);
    if (speakerMappings.length >= allSpeakers.length) return;
    setSpeakerMappings([...speakerMappings, { speaker: '', mappedName: '' }]);
  };

  const handleSpeakerChange = (idx, value) => {
    const newMappings = [...speakerMappings];
    newMappings[idx].speaker = value;
    if (!value) {
      newMappings[idx].mappedName = '';
    }
    setSpeakerMappings(newMappings);
  };

  const handleMappedNameChange = (idx, value) => {
    const newMappings = [...speakerMappings];
    newMappings[idx].mappedName = value;
    setSpeakerMappings(newMappings);
  };

  const handleRemoveMapping = (idx) => {
    setSpeakerMappings(speakerMappings.filter((_, i) => i !== idx));
  };

  // Check if mapping forms have changed compared to database values
  const getHasChanges = () => {
    const currentObj = {};
    speakerMappings.forEach(({ speaker, mappedName }) => {
      if (speaker && mappedName.trim()) {
        currentObj[speaker] = mappedName.trim();
      }
    });

    const originalObj = activeTranscript.speakerNames || {};

    const currentKeys = Object.keys(currentObj);
    const originalKeys = Object.keys(originalObj);

    if (currentKeys.length !== originalKeys.length) return true;

    for (const key of currentKeys) {
      if (currentObj[key] !== originalObj[key]) {
        return true;
      }
    }

    return false;
  };

  const handleSaveSpeakerNames = async () => {
    setSaving(true);
    try {
      const speakerNamesObj = {};
      speakerMappings.forEach(({ speaker, mappedName }) => {
        if (speaker && mappedName.trim()) {
          speakerNamesObj[speaker] = mappedName.trim();
        }
      });

      const response = await fetch('/api/transcriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcriptId: activeTranscript.transcriptId,
          speakerNames: speakerNamesObj
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save speaker names');
      }

      const updatedTranscript = await response.json();
      updateTranscript(updatedTranscript);
      toast.success('Speaker mappings updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update speaker names');
    } finally {
      setSaving(false);
    }
  };

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
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${transcript.transcriptId.slice(0, 8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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

  const renderFormattedTranscript = (text) => {
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

  return (
    <>
      <div
        onClick={() => setActiveTranscript(null)}
        className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <FileAudio className="h-5 w-5 text-zinc-900 dark:text-white" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Transcription Details</h2>
          </div>
          <button
            onClick={() => setActiveTranscript(null)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
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
              <span className="text-xs text-zinc-555">Recording Date & Time</span>
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

          {/* Speaker Mapping Block */}
          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Speaker Mapping</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Map generic speakers to their real names.</p>
              </div>
              {speakerMappings.length < getSpeakersFromTranscript(activeTranscript.transcript).length && (
                <button
                  onClick={handleAddMapping}
                  className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-955 dark:hover:bg-zinc-100 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Map
                </button>
              )}
            </div>

            {speakerMappings.length > 0 ? (
              <div className="space-y-3">
                {speakerMappings.map((mapping, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Select
                      value={mapping.speaker}
                      onChange={(val) => handleSpeakerChange(idx, val)}
                      options={getAvailableSpeakers(idx).map((s) => ({ value: s, label: s }))}
                      placeholder="Select Speaker"
                      className="w-40"
                    />

                    <input
                      type="text"
                      placeholder="Real Name"
                      disabled={!mapping.speaker}
                      value={mapping.mappedName}
                      onChange={(e) => handleMappedNameChange(idx, e.target.value)}
                      className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-hidden disabled:bg-zinc-50 disabled:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-955 dark:text-white dark:placeholder-zinc-650 dark:disabled:bg-zinc-900/50"
                    />

                    <button
                      onClick={() => handleRemoveMapping(idx)}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={handleSaveSpeakerNames}
                    disabled={saving || !getHasChanges() || speakerMappings.some(m => !m.speaker || !m.mappedName.trim())}
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Speaker Map'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs italic text-zinc-500 dark:text-zinc-400 font-medium">No speaker mapping configured.</p>
            )}
          </div>

          {/* Full Transcript Block */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Full Audio Transcript</h3>
            <div>
              {renderFormattedTranscript(activeTranscript.transcript)}
            </div>
          </div>

          {/* Identified Tasks Block (if any) */}
          {relatedTasks.length > 0 && (
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
                    className="flex items-center justify-between rounded-lg border border-zinc-200/60 bg-white p-3 hover:border-zinc-350 hover:shadow-xs transition duration-150 dark:border-zinc-800 dark:bg-zinc-955 dark:hover:border-zinc-700 group cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {task.title}
                      </span>
                      <span className="text-[10px] text-zinc-450 line-clamp-1">{task.description}</span>
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

        {/* Footer Actions */}
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-955/80 flex flex-col gap-2">
          <button
            onClick={() => downloadTextFile(activeTranscript)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-zinc-800 transition dark:bg-white dark:text-zinc-955 dark:hover:bg-zinc-100 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download Transcription Report
          </button>

          <Link
            href={`/tasks?createFrom=${activeTranscript.transcriptId}`}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 hover:border-zinc-450 transition dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-250 dark:hover:bg-zinc-800/80 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create Task from Transcript
          </Link>
        </div>
      </div>
    </>
  );
}
