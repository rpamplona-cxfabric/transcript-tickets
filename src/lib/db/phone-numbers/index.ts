import axios from "axios";
import type { PhoneNumber } from "@/lib/api/phoneNumbers";

const PHONE_NUMBERS_EXECUTOR_URL =
  "https://cxf-executor-qa.cxfabric.io/restendpoint";
const PHONE_NUMBERS_FLOW_ID = "ce66ccf8-8a3b-478d-affc-d5ae5b73facd";

interface GetPhoneNumbersExecutorResponse {
  success: boolean;
  items: PhoneNumber[];
  count?: number;
}

interface GeneratePhoneNumberResponse {
  success: boolean;
  phoneNumber: string;
  sid: string;
  message: unknown;
}

export async function getPhoneNumbers(
  tenantId: string,
): Promise<PhoneNumber[]> {
  try {
    console.log("Fetching phone numbers for tenant:", tenantId);
    console.log("Request URL:", PHONE_NUMBERS_EXECUTOR_URL);
    console.log("Flow ID:", PHONE_NUMBERS_FLOW_ID);

    const { data: result } = await axios.post<GetPhoneNumbersExecutorResponse>(
      PHONE_NUMBERS_EXECUTOR_URL,
      {
        tenantId: tenantId,
      },
      {
        params: {
          tenant_id: tenantId,
          flow_id: PHONE_NUMBERS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: "getPhoneNumbers",
        },
      },
    );

    console.log("Response from CXFabric:", JSON.stringify(result, null, 2));

    if (!result.success || !Array.isArray(result.items)) {
      console.error("Invalid response structure:", result);
      throw new Error("CXFabric returned an invalid phone numbers response");
    }

    return result.items;
  } catch (error: unknown) {
    console.error("Error fetching phone numbers:", error);
    const response = axios.isAxiosError(error) ? error.response : undefined;
    console.error("Error response data:", response?.data);
    console.error("Error response status:", response?.status);
    throw error;
  }
}

export async function generatePhoneNumber(
  tenantId: string,
): Promise<GeneratePhoneNumberResponse> {
  try {
    console.log("Generating phone number for tenant:", tenantId);

    const { data: result } = await axios.post<GeneratePhoneNumberResponse>(
      PHONE_NUMBERS_EXECUTOR_URL,
      {
        tenantId: tenantId,
      },
      {
        params: {
          tenant_id: tenantId,
          flow_id: PHONE_NUMBERS_FLOW_ID,
          draft: true,
          displayExecutionLogs: false,
          action: "generatePhoneNumber",
        },
      },
    );

    console.log(
      "Generate phone number response:",
      JSON.stringify(result, null, 2),
    );

    if (!result.success) {
      throw new Error("CXFabric failed to generate phone number");
    }

    return result;
  } catch (error: unknown) {
    console.error("Error generating phone number:", error);
    const response = axios.isAxiosError(error) ? error.response : undefined;
    console.error("Error response data:", response?.data);
    console.error("Error response status:", response?.status);
    throw error;
  }
}
