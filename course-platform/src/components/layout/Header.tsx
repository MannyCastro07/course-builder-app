import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils';
import { useUIStore, useAuthStore } from '@/stores';
import { useIsMobile } from '@/hooks';
import { Button } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getDefaultRouteForRole, getRoleLabel, getUserInitials, isBackofficeRole } from '@/utils/auth';
import { Bell, Menu, Search, User, Settings, LogOut, Moon, Sun, HelpCircle } from 'lucide-react';

interface HeaderProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function Header({ breadcrumbs }: HeaderProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setSidebarMobileOpen, theme, setTheme } = useUIStore();
  const { logout, user } = useAuthStore();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const roleLabel = getRoleLabel(user?.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {breadcrumbs && breadcrumbs.length > 0 && !isMobile && (
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  {crumb.href ? (
                    <button onClick={() => navigate(crumb.href!)} className="transition-colors hover:text-foreground">
                      {crumb.label}
                    </button>
                  ) : (
                    <span className="font-medium text-foreground">{crumb.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className={cn('relative', searchOpen ? 'w-64' : 'w-auto')}>
            {searchOpen ? (
              <div className="flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-9 w-full rounded-md border bg-transparent pl-9 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)} className="absolute right-2 text-muted-foreground hover:text-foreground">
                  ×
                </button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {isBackofficeRole(user?.role) && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
                    3
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <p className="text-sm font-medium">
                    {isBackofficeRole(user?.role) ? 'New learner enrolled' : 'Keep going'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isBackofficeRole(user?.role)
                      ? 'A new learner joined one of your active courses.'
                      : 'Your next lesson is ready when you are.'}
                  </p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-sm font-medium text-primary">{getUserInitials(user)}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(getDefaultRouteForRole(user?.role))}>
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </DropdownMenuItem>
              {isBackofficeRole(user?.role) && (
                <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/help')}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Help
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
