export interface BusinessDayHours {
  enabled: boolean;
  end: string;
  start: string;
}

export type BusinessHours = Record<string, BusinessDayHours>;

export interface WorkspaceSettings {
  businessHours: BusinessHours;
  timezone: string;
}
