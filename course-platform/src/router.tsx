import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { MainLayout } from '@/components/layout';
import {
  Login,
  Register,
  Dashboard,
  Courses,
  CourseEditor,
  CreateCourseWizard,
  Students,
  Reports,
  Settings,
} from '@/pages';

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Public route wrapper (redirects to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: '/forgot-password',
    element: (
      <PublicRoute>
        <div>Recuperar contraseña (pendiente)</div>
      </PublicRoute>
    ),
  },

  // Protected routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'courses',
        children: [
          {
            index: true,
            element: <Courses />,
          },
          {
            path: 'new',
            element: <CreateCourseWizard />,
          },
          {
            path: ':courseId',
            children: [
              {
                index: true,
                element: <div>Detalle del curso (pendiente)</div>,
              },
              {
                path: 'edit',
                element: <CourseEditor />,
              },
            ],
          },
        ],
      },
      {
        path: 'students',
        children: [
          {
            index: true,
            element: <Students />,
          },
          {
            path: ':studentId',
            element: <div>Detalle del estudiante (pendiente)</div>,
          },
          {
            path: 'new',
            element: <div>Nuevo estudiante (pendiente)</div>,
          },
          {
            path: 'import',
            element: <div>Importar estudiantes (pendiente)</div>,
          },
        ],
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'profile',
        element: <div>Perfil (pendiente)</div>,
      },
      {
        path: 'help',
        element: <div>Ayuda (pendiente)</div>,
      },
    ],
  },

  // Catch all
  {
    path: '*',
    element: <div>404 - Página no encontrada</div>,
  },
]);
