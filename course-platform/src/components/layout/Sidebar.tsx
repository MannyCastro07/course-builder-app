import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { useUIStore } from '@/stores';
import { useIsMobile } from '@/hooks';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cursos', href: '/courses', icon: BookOpen },
  { label: 'Estudiantes', href: '/students', icon: Users },
  { label: 'Reportes', href: '/reports', icon: BarChart3 },
];

const secondaryNavItems: NavItem[] = [
  { label: 'Configuración', href: '/settings', icon: Settings },
  { label: 'Ayuda', href: '/help', icon: HelpCircle },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Close mobile sidebar when route changes
  React.useEffect(() => {
    if (isMobile) {
      setSidebarMobileOpen(false);
    }
  }, [location.pathname, isMobile, setSidebarMobileOpen]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold">EduPlatform</span>
          )}
        </div>
        {isMobile && (
          <button
            onClick={() => setSidebarMobileOpen(false)}
            className="p-2 rounded-md hover:bg-accent"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {!isMobile && !sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {!isMobile && sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm hover:bg-accent"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    sidebarCollapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', sidebarCollapsed && 'h-6 w-6')} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className={cn('my-4 border-t', sidebarCollapsed && 'mx-2')} />

        <ul className="space-y-1">
          {secondaryNavItems.map((item) => (
            <li key={item.href}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    sidebarCollapsed && 'justify-center px-2',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )
                }
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', sidebarCollapsed && 'h-6 w-6')} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      {!sidebarCollapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {sidebarMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSidebarMobileOpen(false)}
          />
        )}
        {/* Mobile sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-background border-r flex flex-col transition-transform duration-300',
            sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 bg-background border-r flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {sidebarContent}
    </aside>
  );
}
