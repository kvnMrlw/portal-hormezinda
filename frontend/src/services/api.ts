import axios, { type InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'portal_hormezinda_token';
const REFRESH_TOKEN_KEY = 'portal_hormezinda_refresh_token';
const USER_KEY = 'portal_hormezinda_user';
export const AUTH_SESSION_EXPIRED_EVENT = 'portal-hormezinda:session-expired';
export { REFRESH_TOKEN_KEY, TOKEN_KEY, USER_KEY };

// Cliente HTTP compartilhado para comunicar o frontend com a API do backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
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

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

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

  if (!refreshToken) {
    return null;
  }

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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
  }
);
