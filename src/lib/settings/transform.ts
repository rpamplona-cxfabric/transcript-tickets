import { defaultWorkspaceSettings } from "./defaults";
import { workspaceSettingsSchema } from "./schemas";
import type {
  BusinessDayHours,
  BusinessHours,
  CallRoutingSettings,
  SpamHandlingSettings,
  WorkspaceSettings,
} from "./types";

interface BusinessHoursFlowValue {
  dates: Array<Record<string, BusinessDayHours>>;
  timezone: string;
}

interface BusinessSettingsFlowValue {
  businessHours: BusinessHoursFlowValue;
  callRouting?: CallRoutingSettings;
  spamHandling?: SpamHandlingSettings;
}

const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

export const normalizeBusinessHours = (
  settings: BusinessSettingsFlowValue,
): WorkspaceSettings => {
  const dates = settings.businessHours.dates.reduce<BusinessHours>(
    (normalizedDates, date) => ({ ...normalizedDates, ...date }),
    {},
  );
  const mergedBusinessHours: BusinessHours = {
    ...defaultWorkspaceSettings.businessHours,
    ...dates,
  };

  return workspaceSettingsSchema.parse({
    businessHours: mergedBusinessHours,
    callRouting: settings.callRouting ?? defaultWorkspaceSettings.callRouting,
    spamHandling:
      settings.spamHandling ?? defaultWorkspaceSettings.spamHandling,
    timezone: settings.businessHours.timezone,
  });
};

export const toBusinessHoursPayload = ({
  businessHours,
  timezone,
}: WorkspaceSettings): BusinessHoursFlowValue => ({
  dates: weekdays.map((day) => ({
    [day]: businessHours[day] ?? defaultWorkspaceSettings.businessHours[day],
  })),
  timezone,
});
