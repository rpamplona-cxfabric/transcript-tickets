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
}

export interface SelectOption {
  value: string;
  label: string;
}
