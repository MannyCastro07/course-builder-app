import React from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/utils';
import { useUIStore } from '@/stores';
import { useIsMobile } from '@/hooks';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from 'react-hot-toast';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed, breadcrumbs } = useUIStore();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div
        className={cn(
          'transition-all duration-300',
          !isMobile && (sidebarCollapsed ? 'ml-16' : 'ml-64')
        )}
      >
        <Header breadcrumbs={breadcrumbs} />

        <main className="p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">{children || <Outlet />}</div>
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
          success: {
            iconTheme: {
              primary: 'hsl(var(--primary))',
              secondary: 'hsl(var(--primary-foreground))',
            },
          },
          error: {
            iconTheme: {
              primary: 'hsl(var(--destructive))',
              secondary: 'hsl(var(--destructive-foreground))',
            },
          },
        }}
      />
    </div>
  );
}
