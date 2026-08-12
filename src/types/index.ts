export interface Task {
  ticketId: string;
  title: string;
  description: string;
  priority: 'low' | 'high';
  status: 'open' | 'in-progress' | 'resolved';
  transcriptId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Transcript {
  transcriptId: string;
  transcript: string;
  transcriptSummary: string;
  timestamp: string;
  tenantId: string;
  speakerNames?: Record<string, string>;
  leads?: string;
  isProcessed?: boolean;
  isIgnored?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface LeadObject {
  leadId: string | number;
  name: string;
  phoneNumber?: string;
  email?: string;
}
