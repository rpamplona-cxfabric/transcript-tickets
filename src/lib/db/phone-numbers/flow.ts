import { executeCxfFlow } from "../flow";

export const phoneNumbersFlow = {
  flowId: "ce66ccf8-8a3b-478d-affc-d5ae5b73facd",
  includeTenantIdInPayload: true,
  params: {
    draft: true,
  },
} as const;

export const executePhoneNumbersFlow = async <T>({
  action,
  payload = {},
  tenantId,
}: {
  action: string;
  payload?: Record<string, unknown>;
  tenantId: string;
}): Promise<T> => {
  return executeCxfFlow<T>({
    action,
    flow: phoneNumbersFlow,
    payload,
    tenantId,
  });
};
