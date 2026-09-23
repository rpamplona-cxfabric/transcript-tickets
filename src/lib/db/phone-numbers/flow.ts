import axios from "axios";

export const phoneNumbersFlow = {
  endpoint: "https://cxf-executor-qa.cxfabric.io/restendpoint",
  flowId: "ce66ccf8-8a3b-478d-affc-d5ae5b73facd",
  params: {
    displayExecutionLogs: false,
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
  const { data } = await axios.post<T>(
    phoneNumbersFlow.endpoint,
    { tenantId, ...payload },
    {
      params: {
        ...phoneNumbersFlow.params,
        action,
        flow_id: phoneNumbersFlow.flowId,
        tenant_id: tenantId,
        targetUserId: "auth0_6a58fa6f7d004d7b0c57bac3",
        displayExecutionLogs: true,
      },
    },
  );

  return data;
};
