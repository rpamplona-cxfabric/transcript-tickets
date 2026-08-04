import axios, { AxiosError } from 'axios';

interface GraphQlError {
  message?: string;
}

interface GraphQlResponse<T> {
  data?: T;
  errors?: GraphQlError[];
}

interface UdasRequest {
  query: string;
  variables?: Record<string, unknown>;
}

interface UdasRequestOptions {
  accessToken: string;
  signal?: AbortSignal;
}

const MAX_GET_ATTEMPTS = 3;

export class UdasRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'UdasRequestError';
    this.status = status;
  }
}

const makeRequest = async <T>(
  request: UdasRequest,
  { accessToken, signal }: UdasRequestOptions
): Promise<T> => {
  const udasApiUrl = process.env.NEXT_PUBLIC_UDAS_API;

  if (!udasApiUrl) {
    throw new UdasRequestError('NEXT_PUBLIC_UDAS_API is not configured.', 500);
  }

  if (!accessToken) {
    throw new UdasRequestError('An Auth0 access token is required.', 401);
  }

  let payload: GraphQlResponse<T> | null = null;
  let status = 0;

  try {
    const response = await axios.post<GraphQlResponse<T>>(udasApiUrl, request, {
      headers: {
        'Apollo-Require-Preflight': 'true',
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal,
    });
    payload = response.data;
    status = response.status;
  } catch (err) {
    const axiosErr = err as AxiosError<GraphQlResponse<T>>;
    if (axiosErr.response) {
      payload = axiosErr.response.data ?? null;
      status = axiosErr.response.status;
      throw new UdasRequestError(
        payload?.errors?.[0]?.message || `UDAS request failed with status ${status}.`,
        status
      );
    }
    // network error or abort
    throw err;
  }

  if (payload?.errors?.length) {
    throw new UdasRequestError(
      payload.errors.map((error) => error.message).filter(Boolean).join(' ') ||
        'UDAS returned a GraphQL error.',
      400
    );
  }

  if (!payload?.data) {
    throw new UdasRequestError('UDAS returned an empty response.', 502);
  }

  return payload.data;
};

export const getQuery = async <T>(
  request: UdasRequest,
  options: UdasRequestOptions
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_GET_ATTEMPTS; attempt += 1) {
    try {
      return await makeRequest<T>(request, options);
    } catch (error) {
      lastError = error;

      if (
        options.signal?.aborted ||
        !(error instanceof UdasRequestError) ||
        error.status !== 502 ||
        attempt === MAX_GET_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw lastError;
};
