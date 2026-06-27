import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Loading } from '../components/ui/Loading';
import { useAuth } from '../contexts/useAuth';

type ProtectedRouteProps = {
  children: ReactNode;
};

// Protege paginas que exigem JWT valido no contexto de autenticacao.
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children;
}
