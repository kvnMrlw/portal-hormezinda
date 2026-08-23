import axios, { type InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'portal_hormezinda_token';
const REFRESH_TOKEN_KEY = 'portal_hormezinda_refresh_token';
const USER_KEY = 'portal_hormezinda_user';
export const AUTH_SESSION_EXPIRED_EVENT = 'portal-hormezinda:session-expired';
export { REFRESH_TOKEN_KEY, TOKEN_KEY, USER_KEY };

// Em desenvolvimento usamos /api e deixamos o Vite fazer proxy para o backend.
// Isso evita CORS quando o portal e acessado por IP da rede (ex.: 10.x.x.x:5173).
// Em producao, VITE_API_URL continua tendo prioridade.
const apiBaseUrl = import.meta.env.VITE_API_URL?.trim() || '/api';
const apiTimeout = import.meta.env.PROD ? 60000 : 20000;

export const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: apiTimeout,
});

type RefreshResponse = {
  success: boolean;
  message: string;
  data: {
    refreshToken: string;
    token: string;
    usuario: unknown;
  };
};

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _transientRetry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

const retryableMethods = new Set(['get', 'head', 'options']);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function isTransientRequestFailure(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  return error.response.status >= 500 && error.response.status <= 599;
}

export function clearStoredSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function persistRefreshedSession(data: RefreshResponse['data']): void {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.usuario));
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const response = await axios.post<RefreshResponse>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
    persistRefreshedSession(response.data.data);
    return response.data.data.token;
  } catch {
    clearStoredSession();
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      const originalRequest = error.config as RetryableRequest | undefined;
      const method = originalRequest?.method?.toLowerCase() ?? '';

      if (
        originalRequest &&
        !originalRequest._transientRetry &&
        retryableMethods.has(method) &&
        isTransientRequestFailure(error)
      ) {
        originalRequest._transientRetry = true;
        await wait(900);
        return api(originalRequest);
      }
    }

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const originalRequest = error.config as RetryableRequest | undefined;
      const requestUrl = originalRequest?.url ?? '';
      const canRetry = originalRequest && !originalRequest._retry && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/refresh');

      if (canRetry) {
        originalRequest._retry = true;
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const nextToken = await refreshPromise;
        if (nextToken) {
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return api(originalRequest);
        }
      }

      clearStoredSession();
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);
