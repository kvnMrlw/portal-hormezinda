import { type ReactNode, useEffect, useMemo, useState } from 'react';

import { AUTH_SESSION_EXPIRED_EVENT, api } from '../services/api';
import type { ApiResponse, AuthResponse, User } from '../types/auth';
import { AuthContext, type LoginCredentials, type RegisterPayload } from './auth-context';

const TOKEN_KEY = 'portal_hormezinda_token';
const USER_KEY = 'portal_hormezinda_user';

function persistSession(authResponse: AuthResponse): void {
  localStorage.setItem(TOKEN_KEY, authResponse.token);
  localStorage.setItem(USER_KEY, JSON.stringify(authResponse.usuario));
}

function readStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

// Provedor global do estado de autenticacao do frontend.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiResponse<{ usuario: User }>>('/auth/me');
        setUser(response.data.data.usuario);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.data.usuario));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    void loadCurrentUser();
  }, [token]);

  useEffect(() => {
    function clearSession() {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, clearSession);

    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, clearSession);
  }, []);

  async function login(credentials: LoginCredentials): Promise<void> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    persistSession(response.data.data);
    setToken(response.data.data.token);
    setUser(response.data.data.usuario);
  }

  async function register(payload: RegisterPayload): Promise<void> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    persistSession(response.data.data);
    setToken(response.data.data.token);
    setUser(response.data.data.usuario);
  }

  function logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
