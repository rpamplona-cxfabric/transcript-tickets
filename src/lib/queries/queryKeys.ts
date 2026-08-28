export const queryKeys = {
  transcriptions: ['transcriptions'] as const,
  transcriptionsList: (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    tenant?: string;
  }) => ['transcriptions', params] as const,
  leadSearch: (q: string) => ['leads', 'search', q] as const,
  leadsByIds: (ids: string[]) => ['leads', 'byIds', ...ids] as const,
  leadExists: (firstName: string, lastName: string) => ['leads', 'exists', firstName, lastName] as const,
};
