import api from '@/lib/axios';
import { ComboboxLead } from '@/components/combobox';
import { Transcript } from '@/types';

export const fetchLeads = async (): Promise<ComboboxLead[]> => {
  const { data } = await api.get<{ leads: ComboboxLead[] }>('/leads/search');
  return data.leads;
};

export const fetchLeadById = async (leadId: string): Promise<ComboboxLead | null> => {
  const { data } = await api.get<{ lead: ComboboxLead | null }>('/leads/search', {
    params: { leadId },
  });
  return data.lead;
};

export const checkLeadExists = async (firstName: string, lastName: string): Promise<boolean> => {
  const { data } = await api.get<{ exists: boolean }>('/leads/search/check', {
    params: { firstName, lastName },
  });
  return data.exists;
};

export const associateLead = async (body: {
  leadId: string;
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
