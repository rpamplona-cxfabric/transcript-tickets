import { useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranscriptionStore } from '@/lib/store/transcriptions';
import { associateLead, fetchLeadsByIds } from '@/lib/api/leads';
import { patchSpeakerNames, generateTasks } from '@/lib/api/transcriptions';
import { queryKeys } from '@/lib/queryKeys';
import { ComboboxLead } from '@/components/combobox';
import { Transcript, SelectOption } from '@/types';

export const useTranscriptionDetailDrawer = () => {
  const qc = useQueryClient();
  const { activeTranscript, setActiveTranscript, tasks, updateTranscript } = useTranscriptionStore();

  const [selectedLead, setSelectedLead] = useState<ComboboxLead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPrefill, setModalPrefill] = useState('');

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
    onSuccess: () => toast.success('Task generation triggered successfully!'),
    onError: (err: Error) => toast.error(err.message),
  });

  const speakerMutation = useMutation({
    mutationFn: patchSpeakerNames,
    onSuccess: (updated, { speakerNames }) => {
      updateTranscript(updated);
      qc.invalidateQueries({ queryKey: queryKeys.transcriptions });
      const entries = Object.entries(speakerNames);
      const last = entries[entries.length - 1];
      if (last) toast.success(last[1] ? `Mapped ${last[0]} to ${last[1]}` : `Removed ${last[0]} mapped name`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSelectLead = async (lead: ComboboxLead) => {
    if (!activeTranscript) return;
    setSelectedLead(lead);
    await associateMutation.mutateAsync({
      leadId: lead.leadId,
      firstname: lead.firstName,
      lastname: lead.lastName,
      transcriptId: activeTranscript.transcriptId,
    });
    if (!activeTranscript.isProcessed) {
      generateMutation.mutate({
        transcriptId: activeTranscript.transcriptId,
        leadName: `${lead.firstName} ${lead.lastName}`.trim(),
        leadId: lead.leadId,
      });
    }
  };

  const handleModalSuccess = (updatedTranscript: Transcript, leadName: string, leadId: string) => {
    updateTranscript(updatedTranscript);
    const parts = leadName.trim().split(/\s+/);
    setSelectedLead({ leadId: Number(leadId), firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' });
    if (!updatedTranscript.isProcessed) {
      generateMutation.mutate({ transcriptId: updatedTranscript.transcriptId, leadName, leadId: Number(leadId) });
    }
  };

  const handleMapSpeaker = (speaker: string, mappedName: string) => {
    if (!activeTranscript) return;
    const updatedSpeakerNames = { ...(activeTranscript.speakerNames || {}), [speaker]: mappedName };
    speakerMutation.mutate({ transcriptId: activeTranscript.transcriptId, speakerNames: updatedSpeakerNames });
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

  const getSpeakerSelectOptions = (speaker: string): SelectOption[] => {
    const leadOptions: SelectOption[] = associatedLeads
      .map((lead) => ({
        value: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
        label: `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
      }))
      .filter((o) => o.value);

    const otherMapped = Object.entries(activeTranscript?.speakerNames || {})
      .filter(([k, v]) => k !== speaker && v !== '')
      .map(([, v]) => v);

    return [
      { value: '', label: 'None' },
      { value: 'Seth', label: 'Seth' },
      ...leadOptions,
    ].filter((o) => o.value === '' || !otherMapped.includes(o.value));
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

  const relatedTasks = tasks.filter((t) => t.transcriptId === activeTranscript?.transcriptId);
  const speakers = getSpeakers(activeTranscript?.transcript);

  return {
    activeTranscript,
    setActiveTranscript,
    selectedLead,
    setSelectedLead,
    modalOpen,
    setModalOpen,
    modalPrefill,
    setModalPrefill,
    associatedLeads,
    relatedTasks,
    speakers,
    handleSelectLead,
    handleModalSuccess,
    handleMapSpeaker,
    getSpeakerSelectOptions,
    downloadTextFile,
    formatTime,
  };
};
