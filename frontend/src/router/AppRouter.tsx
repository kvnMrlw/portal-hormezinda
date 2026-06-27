import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';

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
  }
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
