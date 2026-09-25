export interface BusinessDayHours {
  enabled: boolean;
  end: string;
  start: string;
}

export type BusinessHours = Record<string, BusinessDayHours>;

export interface WorkspaceSettings {
  businessHours: BusinessHours;
  callRouting: CallRoutingSettings;
  spamHandling: SpamHandlingSettings;
  timezone: string;
}

export type RoutingDestinationType =
  "flow" | "reject" | "team" | "unassigned" | "user" | "voicemail";

export interface RoutingDestination {
  flowId?: string;
  teamId?: string;
  type: RoutingDestinationType;
  userId?: string;
}

export interface CallRoutingSettings {
  afterHours: {
    destination: RoutingDestination;
    enabled: boolean;
  };
  defaultDestination: RoutingDestination;
  fallbackDestination: RoutingDestination;
  noAnswer: {
    destination: RoutingDestination;
    enabled: boolean;
    ringTimeoutSeconds: number;
  };
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
