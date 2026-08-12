import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { associateLead, fetchLeadsByIds } from '@/lib/api/leads';
import { ignoreTranscript, recoverTranscript, patchSpeakerNames, generateTasks, pollUntilProcessed } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queries/queryKeys';
import { ComboboxLead } from '@/components/combobox';
import { Transcript } from '@/types';

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

  const leadIds: string[] = (() => {
    if (!activeTranscript?.leads) return [];
    try {
      const parsed = JSON.parse(activeTranscript.leads);
      return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  })();

  const { data: associatedLeads = [] } = useQuery({
    queryKey: queryKeys.leadsByIds(leadIds),
    queryFn: () => fetchLeadsByIds(leadIds),
    enabled: leadIds.length > 0,
    staleTime: 30_000,
  });

  const displayedLead = selectedLead ?? associatedLeads[0] ?? null;

  const associateMutation = useMutation({
    mutationFn: associateLead,
    onSuccess: (data) => {
      if (data.updatedTranscript) updateTranscript(data.updatedTranscript);
      qc.invalidateQueries({ queryKey: queryKeys.transcriptions });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const generateMutation = useMutation({
    mutationFn: generateTasks,
    onError: (err: Error) => toast.error(err.message || 'Failed to trigger task generation'),
  });

  const speakerMutation = useMutation({
    mutationFn: patchSpeakerNames,
    onSuccess: (updated, { speakerNames }) => {
      updateTranscript(updated);
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
      toast.success('Transcription recovered');
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to recover transcription'),
  });

  const startPolling = async (transcriptId: string, leadName: string) => {
    pollingTranscriptIdRef.current = transcriptId;
    setPollingLeadName(leadName);
    setIsPolling(true);
    try {
      const processed = await pollUntilProcessed(transcriptId);
      if (pollingTranscriptIdRef.current !== transcriptId) return;
      if (processed) {
        setSelectedLeadState(null);
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

  const triggerTaskGeneration = async (transcriptId: string, lead: ComboboxLead) => {
    if (generateMutation.isPending || isPolling) return;

    const leadName = `${lead.firstName} ${lead.lastName}`.trim();
    try {
      await generateMutation.mutateAsync({
        transcriptId,
        leadName,
        leadId: lead.leadId,
      });
      void startPolling(transcriptId, leadName);
    } catch {
      // The mutation's onError callback already shows the failure message.
    }
  };

  const handleSelectLead = async (lead: ComboboxLead) => {
    if (!activeTranscript) return;

    try {
      await associateMutation.mutateAsync({
        leadId: lead.leadId,
        firstname: lead.firstName,
        lastname: lead.lastName,
        transcriptId: activeTranscript.transcriptId,
      });
    } catch {
      return;
    }

    setSelectedLeadState({ transcriptId: activeTranscript.transcriptId, lead });
    if (!activeTranscript.isProcessed) {
      void triggerTaskGeneration(activeTranscript.transcriptId, lead);
    }
  };

  const handleModalSuccess = (updatedTranscript: Transcript, leadName: string, leadId: string) => {
    updateTranscript(updatedTranscript);
    const parts = leadName.trim().split(/\s+/);
    const lead: ComboboxLead = {
      leadId: Number(leadId),
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
    };
    setSelectedLeadState({ transcriptId: updatedTranscript.transcriptId, lead });

    if (!updatedTranscript.isProcessed) {
      void triggerTaskGeneration(updatedTranscript.transcriptId, lead);
    }
  };

  const handleRegenerateTasks = () => {
    const lead = displayedLead;
    if (!activeTranscript || !lead || activeTranscript.isProcessed) return;
    void triggerTaskGeneration(activeTranscript.transcriptId, lead);
  };

  const handleMapSpeaker = (speaker: string, mappedName: string) => {
    if (!activeTranscript) return;
    const updatedSpeakerNames = { ...(activeTranscript.speakerNames || {}), [speaker]: mappedName };
    speakerMutation.mutate({ transcriptId: activeTranscript.transcriptId, speakerNames: updatedSpeakerNames });
  };

  const handleIgnore = () => {
    if (activeTranscript && !activeTranscript.isProcessed && !activeTranscript.isIgnored) {
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
      const m = line.match(/^(\[.*?\])?\s*(Speaker\s*\d+|[^:]+):(.*)$/);
      if (m) {
        const name = m[2].trim();
        if (name.toLowerCase() !== 'transcript') speakers.add(name);
      }
    });
    return Array.from(speakers).sort();
  };

  const getSpeakerOptions = (speaker: string): string[] => {
    const leadNames = associatedLeads
      .map((lead) => `${lead.firstName || ''} ${lead.lastName || ''}`.trim())
      .filter(Boolean);

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

  return {
    activeTranscript,
    setActiveTranscript,
    selectedLead: displayedLead,
    modalOpen,
    setModalOpen,
    modalPrefill,
    setModalPrefill,
    associatedLeads,
    speakers,
    isPolling,
    isGeneratingTasks: generateMutation.isPending,
    isIgnoring: ignoreMutation.isPending,
    isRecovering: recoverMutation.isPending,
    pollingLeadName,
    handleSelectLead,
    handleModalSuccess,
    handleRegenerateTasks,
    handleMapSpeaker,
    handleIgnore,
    handleRecover,
    getSpeakerOptions,
    downloadTextFile,
    formatTime,
  };
};
