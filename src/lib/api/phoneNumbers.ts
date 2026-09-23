import api from "@/lib/axios";

export interface PhoneNumber {
  phoneNumber: string;
  routing: string;
  sid: string;
  tenantId: string;
  status: "active" | "inactive";
}

export interface AvailablePhoneNumber {
  capabilities: {
    MMS: boolean;
    SMS: boolean;
    voice: boolean;
  };
  friendlyName: string;
  isoCountry: string;
  locality: string;
  phoneNumber: string;
  region: string;
}

export interface PhoneNumbersResponse {
  success: boolean;
  items: PhoneNumber[];
  count: number;
}

export interface PurchasePhoneNumberResponse {
  item: PhoneNumber;
  success: boolean;
  phoneNumber: string;
  sid: string;
  message: unknown;
}

export interface AvailablePhoneNumbersResponse {
  phoneNumbers: AvailablePhoneNumber[];
  success: boolean;
}

export interface AssignPhoneNumberResponse {
  phoneNumber: string;
  success: boolean;
  userId: string;
}

export interface DeletePhoneNumberResponse {
  phoneNumber: string;
  sid: string;
  success: boolean;
}

export const fetchPhoneNumbers = async (): Promise<PhoneNumbersResponse> => {
  const { data } = await api.get<PhoneNumbersResponse>("/phone-numbers");
  return data;
};

export const purchasePhoneNumber = async (
  phoneNumber: string,
): Promise<PurchasePhoneNumberResponse> => {
  const { data } = await api.post<PurchasePhoneNumberResponse>(
    "/phone-numbers",
    {
      phoneNumber,
    },
  );
  return data;
};

export const assignPhoneNumber = async ({
  phoneNumber,
  userId,
}: {
  phoneNumber: string;
  userId: string;
}): Promise<AssignPhoneNumberResponse> => {
  const { data } = await api.put<AssignPhoneNumberResponse>("/phone-numbers", {
    phoneNumber,
    userId,
  });
  return data;
};

export const deletePhoneNumber = async ({
  phoneNumber,
  sid,
}: {
  phoneNumber: string;
  sid: string;
}): Promise<DeletePhoneNumberResponse> => {
  const { data } = await api.delete<DeletePhoneNumberResponse>(
    "/phone-numbers",
    { data: { phoneNumber, sid } },
  );
  return data;
};

export const fetchAvailablePhoneNumbers =
  async (): Promise<AvailablePhoneNumbersResponse> => {
    const { data } = await api.get<AvailablePhoneNumbersResponse>(
      "/phone-numbers/available",
    );
    return data;
  };
