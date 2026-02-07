import { API_BASE_URL } from '@/config/api.config';
import { getStoredToken, isTokenExpired } from '@/utils/helpers';

const API_URL = API_BASE_URL;

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}
function checkTokenExpiration(): void {
  const token = getStoredToken();
  if (token && isTokenExpired(token)) {
    console.warn('[API] Token has expired');
    const error: ApiError = {
      message: 'Your session has expired. Please login again.',
      status: 401,
    };
    throw error;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  checkTokenExpiration();

  const url = `${API_URL}${endpoint}`;

  console.log(`[API] ${options.method || 'GET'} ${url}`);

  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
    mode: 'cors',
  };

  try {
    const response = await fetch(url, config);

    console.log(`[API] Response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      const error: ApiError = {
        message: errorMessage,
        status: response.status,
      };
      console.error('[API] Error:', error);
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('api-error', { detail: error }));
      }
      throw error;
    }

    const data = await response.json();
    console.log('[API] Success:', data);

    return data;
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error) {
      throw error;
    }
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Network error occurred',
    };
    console.error('[API] Network error:', apiError);
    throw apiError;
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;

