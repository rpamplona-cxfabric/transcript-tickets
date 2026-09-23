import axios from "axios";
import { NextResponse } from "next/server";

const getErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (responseData && typeof responseData === "object") {
      const { error: errorMessage, message } = responseData as {
        error?: unknown;
        message?: unknown;
      };

      if (typeof errorMessage === "string" && errorMessage.trim()) {
        return errorMessage;
      }

      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
};

export const errorResponse = (
  error: unknown,
  fallbackMessage: string,
  status = 500,
) =>
  NextResponse.json(
    {
      error: getErrorMessage(error, fallbackMessage),
    },
    { status },
  );

export const tenantUnavailable = () =>
  NextResponse.json(
    { error: "Tenant ID is unavailable for this user." },
    { status: 403 },
  );
