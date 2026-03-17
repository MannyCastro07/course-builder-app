import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/utils';
import { useUIStore, useAuthStore } from '@/stores';
import { useIsMobile } from '@/hooks';
import { getRoleLabel, getUserInitials, normalizeUserRole, type AppRole } from '@/utils/auth';
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

const navByRole: Record<AppRole, { main: NavItem[]; secondary: NavItem[] }> = {
  super_admin: {
    main: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Students', href: '/admin/students', icon: Users },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
    secondary: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Help', href: '/help', icon: HelpCircle },
    ],
  },
  admin: {
    main: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Courses', href: '/admin/courses', icon: BookOpen },
      { label: 'Students', href: '/admin/students', icon: Users },
      { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ],
    secondary: [
      { label: 'Settings', href: '/admin/settings', icon: Settings },
      { label: 'Help', href: '/help', icon: HelpCircle },
    ],
  },
  agent: {
    main: [
      { label: 'Dashboard', href: '/agent/dashboard', icon: LayoutDashboard },
      { label: 'Courses', href: '/agent/courses', icon: BookOpen },
    ],
    secondary: [{ label: 'Help', href: '/help', icon: HelpCircle }],
  },
  trainee: {
    main: [
      { label: 'Dashboard', href: '/learn/dashboard', icon: LayoutDashboard },
      { label: 'My Learning', href: '/learn/courses', icon: BookOpen },
    ],
    secondary: [{ label: 'Help', href: '/help', icon: HelpCircle }],
  },
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const location = useLocation();
  const role = normalizeUserRole(user?.role);
  const navigation = navByRole[role];

  React.useEffect(() => {
    if (isMobile) {
      setSidebarMobileOpen(false);
    }
  }, [location.pathname, isMobile, setSidebarMobileOpen]);

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b px-4">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center w-full')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          {!sidebarCollapsed && <span className="text-lg font-bold">EduPlatform</span>}
        </div>
        {isMobile && (
          <button onClick={() => setSidebarMobileOpen(false)} className="rounded-md p-2 hover:bg-accent">
            <X className="h-5 w-5" />
          </button>
        )}
        {!isMobile && !sidebarCollapsed && (
          <button onClick={toggleSidebar} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent">
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

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navigation.main.map((item) => (
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
          {navigation.secondary.map((item) => (
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

      {!sidebarCollapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium text-primary">{getUserInitials(user)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{getRoleLabel(role)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <>
        {sidebarMobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarMobileOpen(false)} />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background transition-transform duration-300',
            sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r bg-background transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {sidebarContent}
    </aside>
  );
}
