import api from "@/lib/axios";
import type {
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

export const updateBusinessHours = async ({
  businessHours,
  timezone,
}: Pick<WorkspaceSettings, "businessHours" | "timezone">) => {
  const { data } = await api.put<WorkspaceSettings>("/settings", {
    businessHours,
    timezone,
  });
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
