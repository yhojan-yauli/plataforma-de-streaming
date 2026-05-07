import axios from "axios";

export interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data?.fieldErrors?.length) {
      return data.fieldErrors[0].message;
    }

    if (data?.message) {
      return data.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export const getApiErrorStatus = (error: unknown): number | undefined => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.status;
  }

  return undefined;
};
