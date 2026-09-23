import { executeCxfFlow } from "../flow";

const sethLeadsFlow = {
  flowId: "25bffe69-38a9-497c-b4cf-8d0432ca4373",
  params: {
    draft: true,
  },
} as const;

export const executeSethLeadsFlow = async <T>({
  action,
  payload,
  tenantId,
}: {
  action: string;
  payload?: Record<string, unknown>;
  tenantId: string;
}): Promise<T> =>
  executeCxfFlow<T>({
    action,
    flow: sethLeadsFlow,
    payload,
    tenantId,
  });
