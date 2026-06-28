import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { Home } from '../pages/Home';
import { Catalogs } from '../pages/Catalogs';
import { Login } from '../pages/Login';
import { ModulePlaceholder } from '../pages/ModulePlaceholder';
import { Notices } from '../pages/Notices';
import { People } from '../pages/People';
import { PlatformHome } from '../pages/PlatformHome';
import { Profile } from '../pages/Profile';
import { PublicProfile } from '../pages/PublicProfile';
import { Register } from '../pages/Register';
import { Schedules } from '../pages/Schedules';
import { Users } from '../pages/Users';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { schoolModules } from '../data/schoolModules';
import { Cargo } from '../types/auth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/cadastro',
    element: <Register />
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <PlatformHome />
      </ProtectedRoute>
    )
  },
  {
    path: '/perfil',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  {
    path: '/avisos',
    element: (
      <ProtectedRoute>
        <Notices />
      </ProtectedRoute>
    )
  },
  {
    path: '/pessoas',
    element: (
      <ProtectedRoute>
        <People />
      </ProtectedRoute>
    )
  },
  {
    path: '/pessoas/:id',
    element: (
      <ProtectedRoute>
        <PublicProfile />
      </ProtectedRoute>
    )
  },
  {
    path: '/horarios',
    element: (
      <ProtectedRoute>
        <Schedules />
      </ProtectedRoute>
    )
  },
  {
    path: '/usuarios',
    element: (
      <ProtectedRoute allowedRoles={[Cargo.ADMIN]}>
        <Users />
      </ProtectedRoute>
    )
  },
  {
    path: '/cadastros',
    element: (
      <ProtectedRoute allowedRoles={[Cargo.ADMIN]}>
        <Catalogs />
      </ProtectedRoute>
    )
  },
  ...schoolModules.filter((module) => module.href !== '/avisos' && module.href !== '/horarios').map((module) => ({
    path: module.href,
    element: (
      <ProtectedRoute>
        <ModulePlaceholder module={module} />
      </ProtectedRoute>
    )
  })),
  {
    path: '*',
    element: <Navigate replace to="/home" />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
