import { createContext } from 'react';

import type { ProfileUpdatePayload, User } from '../types/auth';

export type LoginCredentials = {
  usuario: string;
  senha: string;
};

export type RegisterPayload = {
  nomeCompleto: string;
  usuario: string;
  senha: string;
  dataNascimento: string;
  turno: string;
  turma: string;
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>;
  logout: () => void;
};

// Contexto base consumido pelo provider e pelo hook useAuth.
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
