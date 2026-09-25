import { executeCxfFlow } from "../flow";

export const businessSettingsFlow = {
  flowId: "b494b8ba-e4e2-446a-baae-723ad296a346",
  includeTenantIdInPayload: true,
  params: {
    draft: true,
  },
} as const;

export const executeBusinessSettingsFlow = async <T>({
  action,
  payload = {},
  tenantId,
}: {
  action: string;
  payload?: Record<string, unknown>;
  tenantId: string;
}): Promise<T> =>
  executeCxfFlow<T>({
    action,
    flow: businessSettingsFlow,
    payload,
    tenantId,
  });
