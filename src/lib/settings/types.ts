export interface BusinessDayHours {
  enabled: boolean;
  end: string;
  start: string;
}

export type BusinessHours = Record<string, BusinessDayHours>;

export interface WorkspaceSettings {
  businessHours: BusinessHours;
  spamHandling: SpamHandlingSettings;
  timezone: string;
}

export type SpamCallTreatment = "block" | "silence" | "voicemail";

export interface SpamHandlingSettings {
  allowList: string[];
  blockList: string[];
  blockUnknownCallers: boolean;
  enabled: boolean;
  notifyOnScreenedCalls: boolean;
  treatment: SpamCallTreatment;
}
