export const queryKeys = {
  transcriptions: ['transcriptions'] as const,
  transcriptionsList: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    tenant?: string;
  }) => ['transcriptions', params] as const,
  leads: ['leads', 'all'] as const,
  leadById: (leadId: string) => ['leads', 'byId', leadId] as const,
  leadExists: (firstName: string, lastName: string) => ['leads', 'exists', firstName, lastName] as const,
};
