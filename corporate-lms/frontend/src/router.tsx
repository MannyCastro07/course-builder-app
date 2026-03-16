import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Courses } from '@/pages/Courses';
import { CourseBuilder } from '@/pages/CourseBuilder';
import { MyCourses } from '@/pages/MyCourses';
import { LearnCourse } from '@/pages/LearnCourse';
import { useAuth } from '@/hooks/useAuth';

// Protected Route Component
function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Public Route (redirect if authenticated)
function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: '/',
            element: <Dashboard />,
          },
          {
            path: '/courses',
            element: <Courses />,
          },
          {
            path: '/my-courses',
            element: <MyCourses />,
          },
          {
            path: '/learn/:courseId',
            element: <LearnCourse />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['instructor', 'admin']} />,
    children: [
      {
        path: '/builder',
        element: <CourseBuilder />,
      },
      {
        path: '/builder/:courseId',
        element: <CourseBuilder />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
