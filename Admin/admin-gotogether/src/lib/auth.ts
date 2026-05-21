import type { AuthSession, SessionUser } from "./types";

const STORAGE_KEY = "gotogether-admin-session";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function getAuthToken() {
  return getSession()?.accessToken ?? null;
}

export function normalizeSessionUser(user: Partial<SessionUser>): SessionUser {
  return {
    id: user.id ?? "",
    email: user.email ?? "",
    fullName: user.fullName ?? null,
    avatar: user.avatar ?? null,
    roles: user.roles ?? [],
    permissions: user.permissions ?? [],
  };
}