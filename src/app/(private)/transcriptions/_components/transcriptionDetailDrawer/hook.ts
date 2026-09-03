import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { associateLead, fetchLeadById } from '@/lib/api/leads';
import { ignoreTranscript, recoverTranscript, patchSpeakerNames, generateTasks, pollUntilProcessed } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queries/queryKeys';
import { ComboboxLead } from '@/components/combobox';
import { Transcript } from '@/types';
import { parseTranscriptLine } from './transcriptParser';

export const useTranscriptionDetailDrawer = () => {
  const qc = useQueryClient();
  const { activeTranscript, setActiveTranscript, updateTranscript } = useTranscriptionStore();

  const [selectedLeadState, setSelectedLeadState] = useState<{
    transcriptId: string;
    lead: ComboboxLead;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollingLeadName, setPollingLeadName] = useState<string>('');
  const pollingTranscriptIdRef = useRef<string | null>(null);
  const activeTranscriptRef = useRef(activeTranscript);

  useEffect(() => {
    activeTranscriptRef.current = activeTranscript;
  }, [activeTranscript]);

  const selectedLead =
    activeTranscript && selectedLeadState?.transcriptId === activeTranscript.transcriptId
      ? selectedLeadState.lead
      : null;

  const associatedLeadId: string | null = (() => {
    if (!activeTranscript?.leads) return null;
    try {
      const parsed = JSON.parse(activeTranscript.leads);
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      const leadId = `${parsed[0]}`.trim();
      return leadId || null;
    } catch {
      return null;
    }
  })();

  const { data: associatedLead = null } = useQuery({
    queryKey: queryKeys.leadById(associatedLeadId || ''),
    queryFn: () => fetchLeadById(associatedLeadId!),
    enabled: Boolean(associatedLeadId),
    staleTime: 30_000,
  });

  const displayedLead = selectedLead ?? associatedLead;

  const startPolling = async (transcriptId: string, leadName: string) => {
    pollingTranscriptIdRef.current = transcriptId;
    setPollingLeadName(leadName);
    setIsPolling(true);
    try {
      const processed = await pollUntilProcessed(transcriptId);
      if (pollingTranscriptIdRef.current !== transcriptId) return;
      if (processed) {
        const current = activeTranscriptRef.current;
        if (current && current.transcriptId === transcriptId) {
          updateTranscript({ ...current, isProcessed: true });
        }
        qc.invalidateQueries({ queryKey: queryKeys.transcriptions });
        toast.success('Tasks created successfully!');
      } else {
        toast.error('Task processing timed out. Please check back later.');
      }
    } finally {
      if (pollingTranscriptIdRef.current === transcriptId) {
        setIsPolling(false);
        setPollingLeadName('');
        pollingTranscriptIdRef.current = null;
      }
    }
  };

  const generateMutation = useMutation({
    mutationFn: generateTasks,
    onSuccess: (_data, { transcriptId, leadName }) => {
      void startPolling(transcriptId, leadName || '');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to trigger task generation'),
  });

  const associateMutation = useMutation({
    mutationFn: associateLead,
    onSuccess: (data, { transcriptId, firstname, lastname, leadId }) => {
      if (data.updatedTranscript) updateTranscript(data.updatedTranscript);
      qc.invalidateQueries({ queryKey: queryKeys.transcriptions });

      const leadName = `${firstname} ${lastname}`.trim();
      generateMutation.mutate({ transcriptId, leadName, leadId });
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to associate lead'),
  });

  const speakerMutation = useMutation({
    mutationFn: patchSpeakerNames,
    onSuccess: (updated, { speakerNames }) => {
      const current = activeTranscriptRef.current;
      if (current?.transcriptId === updated.transcriptId) {
        updateTranscript({ ...current, speakerNames: updated.speakerNames });
      }
      qc.invalidateQueries({ queryKey: queryKeys.transcriptions });
      const entries = Object.entries(speakerNames);
      const last = entries[entries.length - 1];
      if (last) toast.success(last[1] ? `Mapped ${last[0]} to ${last[1]}` : `Removed ${last[0]} mapped name`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const ignoreMutation = useMutation({
    mutationFn: ignoreTranscript,
    onSuccess: (updated) => {
      const current = activeTranscriptRef.current;
      if (current?.transcriptId === updated.transcriptId) {
        updateTranscript({ ...current, isIgnored: true });
        setActiveTranscript(null);
      }
      qc.invalidateQueries({ queryKey: queryKeys.transcriptions });
      toast.success('Transcription ignored');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to ignore transcription'),
  });

  const recoverMutation = useMutation({
    mutationFn: recoverTranscript,
    onSuccess: (updated) => {
      const current = activeTranscriptRef.current;
      if (current?.transcriptId === updated.transcriptId) {
        updateTranscript({ ...current, isIgnored: false });
      }
      qc.invalidateQueries({ queryKey: queryKeys.transcriptions });
      toast.success('Transcription recovered');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to recover transcription'),
  });

  const handleSelectLead = (lead: ComboboxLead) => {
    if (!activeTranscript) return;
    setSelectedLeadState({ transcriptId: activeTranscript.transcriptId, lead });
  };

  const handleModalSuccess = (updatedTranscript: Transcript, leadName: string, leadId: string) => {
    updateTranscript(updatedTranscript);
    const parts = leadName.trim().split(/\s+/);
    const lead: ComboboxLead = {
      leadId,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
    setSelectedLeadState({ transcriptId: updatedTranscript.transcriptId, lead });
  };

  const isSubmitting = associateMutation.isPending || generateMutation.isPending || isPolling;

  const handleSubmit = () => {
    const lead = displayedLead;
    if (!activeTranscript || !lead || activeTranscript.isProcessed || isSubmitting) return;

    associateMutation.mutate({
      leadId: lead.leadId,
      firstname: lead.firstName,
      lastname: lead.lastName,
      transcriptId: activeTranscript.transcriptId,
    });
  };

  const handleMapSpeaker = (speaker: string, mappedName: string) => {
    if (!activeTranscript) return;
    const updatedSpeakerNames = { ...(activeTranscript.speakerNames || {}), [speaker]: mappedName };
    speakerMutation.mutate({ transcriptId: activeTranscript.transcriptId, speakerNames: updatedSpeakerNames });
  };

  const handleIgnore = () => {
    if (activeTranscript && !activeTranscript.isIgnored) {
      ignoreMutation.mutate(activeTranscript.transcriptId);
    }
  };

  const handleRecover = () => {
    if (activeTranscript?.isIgnored) {
      recoverMutation.mutate(activeTranscript.transcriptId);
    }
  };

  const getSpeakers = (text: string | undefined): string[] => {
    if (!text) return [];
    const speakers = new Set<string>();
    text.split('\n').forEach((line) => {
      const parsedLine = parseTranscriptLine(line);
      if (parsedLine && parsedLine.speakerName.toLowerCase() !== 'transcript') {
        speakers.add(parsedLine.speakerName);
      }
    });
    return Array.from(speakers).sort();
  };

  const getSpeakerOptions = (speaker: string): string[] => {
    const associatedLeadName = associatedLead
      ? `${associatedLead.firstName || ''} ${associatedLead.lastName || ''}`.trim()
      : '';
    const leadNames = associatedLeadName ? [associatedLeadName] : [];

    const otherMapped = Object.entries(activeTranscript?.speakerNames || {})
      .filter(([k, v]) => k !== speaker && v !== '')
      .map(([, v]) => v);

    return ['Seth', ...leadNames].filter(
      (name, idx, arr) => arr.indexOf(name) === idx && !otherMapped.includes(name)
    );
  };

  const downloadTextFile = (transcript: Transcript) => {
    const text = `CXF Transcription Report\n------------------------\nTenant ID: ${transcript.tenantId}\nTranscript ID: ${transcript.transcriptId}\nDate: ${transcript.timestamp || 'N/A'}\n\n--- Summary ---\n${transcript.transcriptSummary || 'No summary available.'}\n\n--- Transcript ---\n${transcript.transcript || 'No transcript text.'}`;
    const el = document.createElement('a');
    el.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    el.download = `transcript-${transcript.transcriptId.slice(0, 8)}.txt`;
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  };

  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return 'N/A';
    try {
      return new Date(timeStr).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return timeStr;
    }
  };

  const speakers = getSpeakers(activeTranscript?.transcript);
  const canChangeLead = !activeTranscript?.isProcessed && !isSubmitting;

  return {
    activeTranscript,
    setActiveTranscript,
    selectedLead: displayedLead,
    modalOpen,
    setModalOpen,
    modalPrefill,
    setModalPrefill,
    associatedLead,
    speakers,
    isPolling,
    isSubmitting,
    canChangeLead,
    isIgnoring: ignoreMutation.isPending,
    isRecovering: recoverMutation.isPending,
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
  };
};
