import axios from "axios";

const CXF_EXECUTOR_URL = "https://cxf-executor-qa.cxfabric.io/restendpoint";
const DEVELOPMENT_TARGET_USER_ID = "auth0_6a58fa6f7d004d7b0c57bac3";

export interface CxfFlowConfig {
  endpoint?: string;
  flowId: string;
  includeTenantIdInPayload?: boolean;
  params?: Record<string, string | boolean | number>;
}

interface ExecuteCxfFlowOptions {
  action: string;
  flow: CxfFlowConfig;
  payload?: Record<string, unknown>;
  tenantId: string;
}

export const executeCxfFlow = async <T>({
  action,
  flow,
  payload,
  tenantId,
}: ExecuteCxfFlowOptions): Promise<T> => {
  const developmentParams =
    process.env.NODE_ENV === "development"
      ? {
          displayExecutionLogs: true,
          targetUserId: DEVELOPMENT_TARGET_USER_ID,
        }
      : {};
  const requestPayload = flow.includeTenantIdInPayload
    ? { tenantId, ...payload }
    : payload;
  const { data } = await axios.post<T>(
    flow.endpoint ?? CXF_EXECUTOR_URL,
    requestPayload,
    {
      params: {
        ...flow.params,
        ...developmentParams,
        action,
        flow_id: flow.flowId,
        tenant_id: tenantId,
      },
    },
  );

  return data;
};
