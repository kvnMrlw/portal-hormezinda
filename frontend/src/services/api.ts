import axios from 'axios';

const TOKEN_KEY = 'portal_hormezinda_token';
const USER_KEY = 'portal_hormezinda_user';
export const AUTH_SESSION_EXPIRED_EVENT = 'portal-hormezinda:session-expired';

// Cliente HTTP compartilhado para comunicar o frontend com a API do backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  }
);
