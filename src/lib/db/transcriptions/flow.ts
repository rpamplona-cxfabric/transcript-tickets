import { executeCxfFlow } from "../flow";

const transcriptsFlow = {
  flowId: "25bffe69-38a9-497c-b4cf-8d0432ca4373",
  params: {
    draft: true,
  },
} as const;

export const executeTranscriptsFlow = async <T>({
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
    flow: transcriptsFlow,
    payload,
    tenantId,
  });
