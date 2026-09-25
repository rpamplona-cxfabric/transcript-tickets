import axios from "axios";
import { defaultWorkspaceSettings } from "@/lib/settings/defaults";
import { businessSettingsFlowItemSchema } from "@/lib/settings/schemas";
import {
  normalizeBusinessHours,
  toBusinessHoursPayload,
} from "@/lib/settings/transform";
import type {
  CallRoutingSettings,
  SpamHandlingSettings,
  WorkspaceSettings,
} from "@/lib/settings/types";
import { executeBusinessSettingsFlow } from "./flow";

interface GetBusinessSettingsFlowResponse {
  item?: unknown;
  success: boolean;
}

interface UpdateBusinessHoursFlowResponse {
  success: boolean;
}

const logExecutorError = (message: string, error: unknown) => {
  console.error(message, error);
  const response = axios.isAxiosError(error) ? error.response : undefined;
  console.error("Executor response data:", response?.data);
  console.error("Executor response status:", response?.status);
};

const isEmptyObject = (value: unknown) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.keys(value).length === 0;

export const createBusinessSettings = async (
  tenantId: string,
  settings: WorkspaceSettings,
): Promise<void> => {
  const result =
    await executeBusinessSettingsFlow<UpdateBusinessHoursFlowResponse>({
      action: "createBusinessSettings",
      payload: {
        businessHours: toBusinessHoursPayload(settings),
        callRouting: settings.callRouting,
        spamHandling: settings.spamHandling,
      },
      tenantId,
    });

  if (!result.success) {
    throw new Error("CXFabric failed to create business settings.");
  }
};

export const getBusinessSettings = async (
  tenantId: string,
): Promise<WorkspaceSettings> => {
  try {
    const result =
      await executeBusinessSettingsFlow<GetBusinessSettingsFlowResponse>({
        action: "getBusinessSettings",
        tenantId,
      });

    if (!result.success || !result.item) {
      throw new Error("CXFabric returned invalid business settings.");
    }

    if (isEmptyObject(result.item)) {
      await createBusinessSettings(tenantId, defaultWorkspaceSettings);
      return defaultWorkspaceSettings;
    }

    const item = businessSettingsFlowItemSchema.parse(result.item);
    return normalizeBusinessHours(item);
  } catch (error: unknown) {
    logExecutorError("Error fetching business settings:", error);
    throw error;
  }
};

export const updateBusinessHours = async (
  tenantId: string,
  settings: WorkspaceSettings,
): Promise<WorkspaceSettings> => {
  try {
    const result =
      await executeBusinessSettingsFlow<UpdateBusinessHoursFlowResponse>({
        action: "updateBusinessHours",
        payload: {
          businessHours: toBusinessHoursPayload(settings),
        },
        tenantId,
      });

    if (!result.success) {
      throw new Error("CXFabric failed to update business hours.");
    }

    return settings;
  } catch (error: unknown) {
    logExecutorError("Error updating business hours:", error);
    throw error;
  }
};

export const updateSpamHandling = async (
  tenantId: string,
  spamHandling: SpamHandlingSettings,
): Promise<SpamHandlingSettings> => {
  try {
    const result =
      await executeBusinessSettingsFlow<UpdateBusinessHoursFlowResponse>({
        action: "updateSpamHandling",
        payload: { spamHandling },
        tenantId,
      });

    if (!result.success) {
      throw new Error("CXFabric failed to update spam handling.");
    }

    return spamHandling;
  } catch (error: unknown) {
    logExecutorError("Error updating spam handling:", error);
    throw error;
  }
};

export const updateCallRouting = async (
  tenantId: string,
  callRouting: CallRoutingSettings,
): Promise<CallRoutingSettings> => {
  try {
    const result =
      await executeBusinessSettingsFlow<UpdateBusinessHoursFlowResponse>({
        action: "updateCallRouting",
        payload: { callRouting },
        tenantId,
      });

    if (!result.success) {
      throw new Error("CXFabric failed to update call routing.");
    }

    return callRouting;
  } catch (error: unknown) {
    logExecutorError("Error updating call routing:", error);
    throw error;
  }
};
