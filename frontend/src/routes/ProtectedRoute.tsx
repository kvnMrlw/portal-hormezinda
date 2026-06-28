import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { Loading } from '../components/ui/Loading';
import { useAuth } from '../contexts/useAuth';
import type { Cargo } from '../types/auth';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: Cargo[];
};

// Protege paginas que exigem JWT valido no contexto de autenticacao.
export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <Loading className="min-h-screen" />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (allowedRoles?.length && (!user || !allowedRoles.includes(user.cargo))) {
    return <Navigate replace to="/home" />;
  }

  return children;
}
