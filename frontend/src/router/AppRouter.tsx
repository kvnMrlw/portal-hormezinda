import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { ModulePlaceholder } from '../pages/ModulePlaceholder';
import { Notices } from '../pages/Notices';
import { PlatformHome } from '../pages/PlatformHome';
import { Profile } from '../pages/Profile';
import { Register } from '../pages/Register';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import { schoolModules } from '../data/schoolModules';

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
  ...schoolModules.filter((module) => module.href !== '/avisos').map((module) => ({
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
