'use client';

import { useState } from 'react';
import { FileAudio, X, Clock, Download, User, Loader2, AlertTriangle } from 'lucide-react';
import { Combobox } from '@/components/combobox';
import { LeadModal } from '../leadModal';
import { SpeakerCombobox } from './speakerCombobox';
import { useTranscriptionDetailDrawer } from './hook';
import { parseTranscriptLine } from './transcriptParser';

export const TranscriptionDetailDrawer = () => {
  const {
    activeTranscript,
    setActiveTranscript,
    selectedLead: selectedLeadFromHook,
    modalOpen,
    setModalOpen,
    modalPrefill,
    setModalPrefill,
    associatedLead,
    speakers,
    isPolling,
    isSubmitting,
    canChangeLead,
    isIgnoring,
    isRecovering,
    pollingLeadName,
    handleSelectLead,
    handleModalSuccess,
    handleSubmit,
    handleMapSpeaker,
    handleIgnore,
    handleRecover,
    getSpeakerOptions,
    downloadTextFile,
    formatTime,
  } = useTranscriptionDetailDrawer();
  const [isIgnoreDialogOpen, setIsIgnoreDialogOpen] = useState(false);

  if (!activeTranscript) return null;

  const selectedLead = selectedLeadFromHook ?? associatedLead;

  const renderFormattedTranscript = (text: string | undefined) => {
    if (!text) return <p className="text-zinc-500 italic">No transcript text available.</p>;
    return (
      <div className="space-y-4">
        {text.split('\n').map((line, idx) => {
          if (!line.trim()) return null;
          const parsedLine = parseTranscriptLine(line);
          if (parsedLine) {
            const { timeTag, speakerName, speakerText } = parsedLine;
            const displayName = activeTranscript.speakerNames?.[speakerName] || speakerName;
            return (
              <div key={idx} className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
                  <span className="text-zinc-900 dark:text-white">{displayName}</span>
                  {timeTag && <span className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">{timeTag}</span>}
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-300">{speakerText.trim()}</p>
              </div>
            );
          }
          return <p key={idx} className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 p-2 bg-zinc-50/50 rounded dark:bg-zinc-900/20">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <>
      <div onClick={() => setActiveTranscript(null)} className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-xs transition-opacity duration-300 cursor-pointer" />

      <div className="fixed inset-y-0 right-0 z-50 flex h-[100svh] w-full flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 md:max-w-3xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 px-4 sm:px-6 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-2">
            <FileAudio className="h-5 w-5 text-zinc-900 dark:text-white" />
            <div className="min-w-0">
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Transcription Details</h2>
              <p className="truncate font-mono text-[11px] font-medium text-zinc-500 dark:text-zinc-400" title={activeTranscript.transcriptId}>
                {activeTranscript.transcriptId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => downloadTextFile(activeTranscript)} title="Download Transcript" className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer animate-fade-in">
              <Download className="h-5 w-5" />
            </button>
            <button onClick={() => setActiveTranscript(null)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-900 dark:bg-zinc-900/30 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
              <Clock className="h-4.5 w-4.5 text-zinc-400" />
              <span className="text-xs text-zinc-500 font-medium">Recording Date & Time:</span>
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{formatTime(activeTranscript.timestamp)}</span>
            </div>
            <div>
              {activeTranscript.isIgnored ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" /> Ignored
                </span>
              ) : activeTranscript.isProcessed ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Processed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Pending
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">AI Summary</h3>
            <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 dark:bg-zinc-900 dark:border-zinc-800">
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 font-medium">
                {activeTranscript.transcriptSummary || 'Summary not available.'}
              </pre>
            </div>
          </div>

          {!activeTranscript.isProcessed && !activeTranscript.isIgnored && (
            <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Identify Contact</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Search for an existing lead or create a new one.</p>
              </div>

              {isPolling ? (
                <div className="animate-fade-in flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50/60 px-4 py-3 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-indigo-500" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                      Processing tasks for {pollingLeadName}&hellip;
                    </p>
                    <p className="text-[10px] font-medium text-indigo-500 dark:text-indigo-400">Waiting for AI to generate tasks from this transcript. This may take a moment.</p>
                  </div>
                </div>
              ) : (
                <>
                  {selectedLead && (
                    <div className="animate-fade-in flex items-center gap-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 px-3 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950/40">
                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-zinc-900 dark:text-white">{selectedLead.firstName} {selectedLead.lastName}</p>
                        {(selectedLead.phones?.[0] || selectedLead.emails?.[0]) && (
                          <p className="truncate text-[10px] font-medium text-zinc-450 dark:text-zinc-500">{selectedLead.phones?.[0] || selectedLead.emails?.[0]}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {canChangeLead && (
                    <Combobox
                      onSelect={handleSelectLead}
                      onCreateNew={(text) => { setModalPrefill(text); setModalOpen(true); }}
                      placeholder={selectedLead ? 'Search a different lead...' : 'Search leads by name...'}
                    />
                  )}

                  {selectedLead && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer transition-colors"
                    >
                      <Loader2 className={`h-3.5 w-3.5 ${isSubmitting ? 'animate-spin' : 'hidden'}`} />
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                  )}
                </>
              )}

            </div>
          )}
          <LeadModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            prefillName={modalPrefill}
            transcriptId={activeTranscript.transcriptId}
            onSuccess={handleModalSuccess}
          />

          <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Speaker Mapping</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Map generic speakers to their real names.</p>
            </div>
            {speakers.length > 0 ? (
              <div className="space-y-3">
                {speakers.map((speaker) => (
                  <div key={speaker} className="flex flex-col gap-2 border-b border-zinc-100 py-2 text-sm last:border-0 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-xs font-bold text-zinc-650 dark:text-zinc-400">{speaker}</span>
                    <SpeakerCombobox
                      speaker={speaker}
                      value={activeTranscript.speakerNames?.[speaker] || ''}
                      options={getSpeakerOptions(speaker)}
                      onChange={handleMapSpeaker}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-zinc-500 dark:text-zinc-400 font-medium">No speakers identified in this transcript.</p>
            )}
          </div>

          {associatedLead && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Associated Lead</h3>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 px-3 py-1.5 border border-indigo-100 dark:border-indigo-900 text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                  <User className="h-3.5 w-3.5" />
                  {`${associatedLead.firstName || ''} ${associatedLead.lastName || ''}`.trim() || 'Unknown Lead'}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-950 dark:text-zinc-400">Full Audio Transcript</h3>
            <div>{renderFormattedTranscript(activeTranscript.transcript)}</div>
          </div>

          {activeTranscript.isIgnored && (
            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleRecover}
                disabled={isRecovering}
                className="rounded-lg border border-indigo-200 px-3 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/70 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
              >
                {isRecovering ? 'Recovering...' : 'Recover transcription'}
              </button>
            </div>
          )}

          {!activeTranscript.isIgnored && (
            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsIgnoreDialogOpen(true)}
                disabled={isSubmitting}
                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/30"
              >
                Ignore transcription
              </button>
            </div>
          )}

        </div>
      </div>

      {isIgnoreDialogOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close ignore confirmation"
            onClick={() => setIsIgnoreDialogOpen(false)}
            className="absolute inset-0 bg-zinc-950/40"
          />
          <div role="dialog" aria-modal="true" aria-labelledby="ignore-transcription-title" className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 id="ignore-transcription-title" className="mt-4 text-lg font-bold text-zinc-900 dark:text-white">Ignore this transcription?</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">This transcription will be marked as ignored and hidden from the default list. You can find it later using the Ignored filter.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsIgnoreDialogOpen(false)} disabled={isIgnoring} className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:opacity-60 dark:text-zinc-300 dark:hover:bg-zinc-900">Cancel</button>
              <button type="button" onClick={handleIgnore} disabled={isIgnoring} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{isIgnoring ? 'Ignoring...' : 'Ignore transcription'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
