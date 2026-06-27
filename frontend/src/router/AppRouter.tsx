import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { PlatformHome } from '../pages/PlatformHome';
import { Profile } from '../pages/Profile';
import { Register } from '../pages/Register';
import { ProtectedRoute } from '../routes/ProtectedRoute';

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
    path: '*',
    element: <Navigate replace to="/home" />
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
