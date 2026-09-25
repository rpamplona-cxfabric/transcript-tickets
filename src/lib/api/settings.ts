import api from "@/lib/axios";
import type {
  CallRoutingSettings,
  SpamHandlingSettings,
  WorkspaceSettings,
} from "@/lib/settings/types";

export type {
  BusinessDayHours,
  BusinessHours,
  SpamHandlingSettings,
  WorkspaceSettings,
} from "@/lib/settings/types";

export const fetchWorkspaceSettings = async (): Promise<WorkspaceSettings> => {
  const { data } = await api.get<WorkspaceSettings>("/settings");
  return data;
};

export const updateBusinessHours = async (settings: WorkspaceSettings) => {
  const { data } = await api.put<WorkspaceSettings>("/settings", settings);
  return data;
};

export const updateSpamHandling = async (
  spamHandling: SpamHandlingSettings,
): Promise<SpamHandlingSettings> => {
  const { data } = await api.put<SpamHandlingSettings>(
    "/settings/spam-handling",
    { spamHandling },
  );
  return data;
};

export const updateCallRouting = async (
  callRouting: CallRoutingSettings,
): Promise<CallRoutingSettings> => {
  const { data } = await api.put<CallRoutingSettings>(
    "/settings/call-routing",
    { callRouting },
  );
  return data;
};
