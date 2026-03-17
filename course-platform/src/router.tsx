import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores';
import { MainLayout } from '@/components/layout';
import { getDefaultRouteForRole, isRoleAllowed, type AppRole } from '@/utils/auth';
import {
  Login,
  Register,
  AdminDashboard,
  AgentDashboard,
  TraineeDashboard,
  Courses,
  CourseEditor,
  CreateCourseWizard,
  Students,
  Reports,
  Settings,
} from '@/pages';

function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: AppRole[] }) {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isRoleAllowed(user?.role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  return !isAuthenticated ? <>{children}</> : <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
}

function RoleHomeRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={getDefaultRouteForRole(user?.role)} replace />;
}

export const router = createBrowserRouter([
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
        <div>Password recovery is coming soon.</div>
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RoleHomeRedirect />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AdminDashboard /> },
      {
        path: 'courses',
        children: [
          { index: true, element: <Courses /> },
          { path: 'new', element: <CreateCourseWizard /> },
          {
            path: ':courseId',
            children: [
              { index: true, element: <div>Course detail is coming soon.</div> },
              { path: 'edit', element: <CourseEditor /> },
            ],
          },
        ],
      },
      {
        path: 'students',
        children: [
          { index: true, element: <Students /> },
          { path: ':studentId', element: <div>Student detail is coming soon.</div> },
          { path: 'new', element: <div>New student flow is coming soon.</div> },
          { path: 'import', element: <div>Student import is coming soon.</div> },
        ],
      },
      { path: 'reports', element: <Reports /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  {
    path: '/agent',
    element: (
      <ProtectedRoute allowedRoles={['agent']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <AgentDashboard /> },
      { path: 'courses', element: <Courses /> },
    ],
  },
  {
    path: '/learn',
    element: (
      <ProtectedRoute allowedRoles={['trainee']}>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <TraineeDashboard /> },
      { path: 'courses', element: <Courses /> },
    ],
  },
  {
    path: '/help',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <div>Help center is coming soon.</div>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <div>Profile is coming soon.</div>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <div>404 - Page not found</div>,
  },
]);
