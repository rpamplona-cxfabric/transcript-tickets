import { executeCxfFlow } from "../flow";

const leadsFlow = {
  flowId: "c276db63-834c-4306-9888-a3597860e686",
  params: {
    draft: true,
  },
} as const;

export const executeCreateLeadFlow = async <T>({
  payload,
  tenantId,
}: {
  payload: Record<string, unknown>;
  tenantId: string;
}): Promise<T> =>
  executeCxfFlow<T>({
    action: "createOrUpdateLead",
    flow: leadsFlow,
    payload,
    tenantId,
  });
