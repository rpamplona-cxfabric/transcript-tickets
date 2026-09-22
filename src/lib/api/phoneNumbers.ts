import api from "@/lib/axios";

export interface PhoneNumber {
  phoneNumber: string;
  tenantId: string;
  status: "active" | "inactive";
}

export interface PhoneNumbersResponse {
  success: boolean;
  items: PhoneNumber[];
  count: number;
}

export interface GeneratePhoneNumberResponse {
  success: boolean;
  phoneNumber: string;
  sid: string;
  message: unknown;
}

export const fetchPhoneNumbers = async (): Promise<PhoneNumbersResponse> => {
  const { data } = await api.get<PhoneNumbersResponse>("/phone-numbers");
  return data;
};

export const createPhoneNumber =
  async (): Promise<GeneratePhoneNumberResponse> => {
    const { data } =
      await api.post<GeneratePhoneNumberResponse>("/phone-numbers");
    return data;
  };
