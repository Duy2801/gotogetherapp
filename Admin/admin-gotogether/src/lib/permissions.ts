import type { SessionUser } from "./types";

export function hasRole(user: SessionUser | null | undefined, role: string) {
  return Boolean(user?.roles?.includes(role));
}

export function canManageUsers(user: SessionUser | null | undefined) {
  return hasRole(user, "ADMIN") || hasRole(user, "SUPER_ADMIN");
}

export function canViewAnalytics(user: SessionUser | null | undefined) {
  return canManageUsers(user) || hasRole(user, "ANALYST");
}
