import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';

import { Home } from '../pages/Home';
import { Catalogs } from '../pages/Catalogs';
import { Courses } from '../pages/Courses';
import { Login } from '../pages/Login';
import { ModulePlaceholder } from '../pages/ModulePlaceholder';
import { Menu } from '../pages/Menu';
import { Notices } from '../pages/Notices';
import { Ideas } from '../pages/Ideas';
import { Notifications } from '../pages/Notifications';
import { MySubjects } from '../pages/MySubjects';
import { MyTasks } from '../pages/MyTasks';
import { People } from '../pages/People';
import { PlatformHome } from '../pages/PlatformHome';
import { Profile } from '../pages/Profile';
import { PublicProfile } from '../pages/PublicProfile';
import { Register } from '../pages/Register';
import { Schedules } from '../pages/Schedules';
import { Settings } from '../pages/Settings';
import { TeacherDiary } from '../pages/TeacherDiary';
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
    path: '/notificacoes',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    )
  },
  {
    path: '/configuracoes',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    )
  },
  {
    path: '/cardapio',
    element: (
      <ProtectedRoute>
        <Menu />
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
    path: '/horarios/turma/:classId',
    element: (
      <ProtectedRoute allowedRoles={[Cargo.ADMIN]}>
        <Schedules />
      </ProtectedRoute>
    )
  },
  {
    path: '/cursos',
    element: (
      <ProtectedRoute>
        <Courses />
      </ProtectedRoute>
    )
  },
  {
    path: '/ideias',
    element: (
      <ProtectedRoute>
        <Ideas />
      </ProtectedRoute>
    )
  },
  {
    path: '/disciplinas',
    element: (
      <ProtectedRoute>
        <MySubjects />
      </ProtectedRoute>
    )
  },
  {
    path: '/tarefas',
    element: (
      <ProtectedRoute>
        <MyTasks />
      </ProtectedRoute>
    )
  },
  {
    path: '/diario',
    element: (
      <ProtectedRoute allowedRoles={[Cargo.ADMIN, Cargo.DIRETOR, Cargo.COORDENADOR, Cargo.PROFESSOR]}>
        <TeacherDiary />
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
  ...schoolModules.filter((module) => !['/avisos', '/horarios', '/cardapio', '/cursos', '/ideias', '/disciplinas', '/tarefas', '/diario'].includes(module.href)).map((module) => ({
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
