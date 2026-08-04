import api from '@/lib/axios';
import { ComboboxLead } from '@/components/combobox';
import { Transcript } from '@/types';

export const searchLeads = async (q: string): Promise<ComboboxLead[]> => {
  const { data } = await api.get<{ leads: ComboboxLead[] }>('/leads/search', { params: { q } });
  return data.leads;
};

export const fetchLeadsByIds = async (ids: string[]): Promise<ComboboxLead[]> => {
  const params = new URLSearchParams();
  ids.forEach((id) => params.append('leadId', id));
  const { data } = await api.get<{ leads: ComboboxLead[] }>(`/leads/search?${params.toString()}`);
  return data.leads;
};

export const checkLeadExists = async (firstName: string, lastName: string): Promise<boolean> => {
  const { data } = await api.get<{ exists: boolean }>('/leads/search/check', {
    params: { firstName, lastName },
  });
  return data.exists;
};

export const associateLead = async (body: {
  leadId: number;
  firstname: string;
  lastname: string;
  transcriptId: string;
}): Promise<{ updatedTranscript: Transcript }> => {
  const { data } = await api.post('/leads', body);
  return data;
};

export const createLead = async (body: {
  firstname: string;
  lastname: string;
  phoneNumber?: string;
  email?: string;
  transcriptId: string;
}): Promise<{ updatedTranscript: Transcript; leadId: string }> => {
  const { data } = await api.post('/leads', body);
  return data;
};
