import type { User } from '@/types';

export const APP_ROLES = ['super_admin', 'admin', 'trainee', 'agent'] as const;

export type AppRole = (typeof APP_ROLES)[number];

const LEGACY_ROLE_MAP: Record<string, AppRole> = {
  super_admin: 'super_admin',
  admin: 'admin',
  trainee: 'trainee',
  agent: 'agent',
  instructor: 'admin',
  student: 'trainee',
};

export function normalizeUserRole(role?: string | null): AppRole {
  // Temporary local-MVP bridge:
  // if a legacy profile does not have a role set yet, treat the user as admin
  // so the course-builder backoffice remains testable. Explicit trainee/student
  // values still route to the learner space.
  if (!role) return 'admin';

  return LEGACY_ROLE_MAP[role] ?? 'admin';
}

export function getDefaultRouteForRole(role?: string | null): string {
  switch (normalizeUserRole(role)) {
    case 'super_admin':
    case 'admin':
      return '/admin/dashboard';
    case 'agent':
      return '/agent/dashboard';
    case 'trainee':
    default:
      return '/learn/dashboard';
  }
}

export function getRoleLabel(role?: string | null): string {
  switch (normalizeUserRole(role)) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'agent':
      return 'Agent';
    case 'trainee':
    default:
      return 'Trainee';
  }
}

export function isRoleAllowed(userRole: string | null | undefined, allowedRoles?: AppRole[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.includes(normalizeUserRole(userRole));
}

export function isBackofficeRole(role?: string | null): boolean {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === 'super_admin' || normalizedRole === 'admin' || normalizedRole === 'agent';
}

export function isLearnerRole(role?: string | null): boolean {
  return normalizeUserRole(role) === 'trainee';
}

export function getUserInitials(user?: Pick<User, 'firstName' | 'lastName'> | null): string {
  if (!user) return 'U';

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.trim();
  return initials || 'U';
}
