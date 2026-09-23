import axios from "axios";
import type { AvailablePhoneNumber, PhoneNumber } from "@/lib/api/phoneNumbers";
import { executePhoneNumbersFlow } from "./flow";

interface GetPhoneNumbersExecutorResponse {
  count?: number;
  items: PhoneNumber[];
  success: boolean;
}

interface PurchasePhoneNumberResponse {
  message: unknown;
  phoneNumber: string;
  sid: string;
  success: boolean;
}

interface AvailablePhoneNumbersExecutorResponse {
  phoneNumbers: AvailablePhoneNumber[];
  success: boolean;
}

const logExecutorError = (message: string, error: unknown) => {
  console.error(message, error);
  const response = axios.isAxiosError(error) ? error.response : undefined;
  console.error("Executor response data:", response?.data);
  console.error("Executor response status:", response?.status);
};

export const getPhoneNumbers = async (
  tenantId: string,
): Promise<PhoneNumber[]> => {
  try {
    const result =
      await executePhoneNumbersFlow<GetPhoneNumbersExecutorResponse>({
        action: "getPhoneNumbers",
        tenantId,
      });

    if (!result.success || !Array.isArray(result.items)) {
      throw new Error("CXFabric returned an invalid phone numbers response.");
    }

    return result.items;
  } catch (error: unknown) {
    logExecutorError("Error fetching phone numbers:", error);
    throw error;
  }
};

export const purchasePhoneNumber = async (
  tenantId: string,
  phoneNumber: string,
): Promise<PurchasePhoneNumberResponse> => {
  try {
    const result = await executePhoneNumbersFlow<PurchasePhoneNumberResponse>({
      action: "purchasePhoneNumber",
      payload: { phoneNumber },
      tenantId,
    });

    if (!result.success) {
      throw new Error("CXFabric failed to purchase the phone number.");
    }

    return result;
  } catch (error: unknown) {
    logExecutorError("Error purchasing phone number:", error);
    throw error;
  }
};

export const getAvailablePhoneNumbers = async (
  tenantId: string,
): Promise<AvailablePhoneNumber[]> => {
  try {
    const result =
      await executePhoneNumbersFlow<AvailablePhoneNumbersExecutorResponse>({
        action: "getAvailablePhoneNumbers",
        tenantId,
      });

    if (!result.success || !Array.isArray(result.phoneNumbers)) {
      throw new Error("CXFabric returned invalid available phone numbers.");
    }

    return result.phoneNumbers;
  } catch (error: unknown) {
    logExecutorError("Error fetching available phone numbers:", error);
    throw error;
  }
};
