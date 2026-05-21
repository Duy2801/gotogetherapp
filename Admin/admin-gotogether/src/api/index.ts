import { clearSession, getAuthToken, normalizeSessionUser, setSession } from "../lib/auth";
import {
  mockSession,
  mockSettings,
  mockTripDetail,
  mockUserDetail,
} from "../lib/mock-data";
import type {
  AppSettings,
  AuthSession,
  CategoryItem,
  DashboardSummary,
  DestinationItem,
  TripDetail,
  TripListItem,
  UserDetail,
  UserListItem,
} from "../lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

type RequestOptions = RequestInit & { auth?: boolean };

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (options.auth !== false) {
    const token = getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message ?? payload?.data?.message ?? response.statusText ?? "Request failed";
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  const payload = await response.json();
  return ((payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T);
}

export async function loginAdmin(email: string, password: string): Promise<AuthSession> {
  const result = await requestJson<AuthSession>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  const session = {
    ...result,
    user: normalizeSessionUser(result.user),
  };
  setSession(session);
  return session;
}

export async function fetchMe() {
  try {
    return await requestJson<AuthSession["user"]>("/admin/me");
  } catch {
    return normalizeSessionUser(mockSession.user);
  }
}

export async function fetchDashboard(month?: number, year?: number): Promise<DashboardSummary> {
  const params = new URLSearchParams();
  if (month) params.set("month", String(month));
  if (year) params.set("year", String(year));
  return requestJson<DashboardSummary>(`/admin/dashboard${params.size ? `?${params.toString()}` : ""}`);
}

export async function fetchUsers(query = "", page = 1, limit = 10, status = "") {
  const params = new URLSearchParams({ query, page: String(page), limit: String(limit), status });
  return requestJson<{ items: UserListItem[]; total: number; page: number; limit: number }>(`/admin/users?${params.toString()}`);
}

export async function fetchUserDetail(id: string): Promise<UserDetail> {
  try {
    return await requestJson<UserDetail>(`/admin/users/${id}`);
  } catch {
    return mockUserDetail;
  }
}

export async function updateUserStatus(id: string, status: string) {
  try {
    return await requestJson<{ message: string }>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  } catch {
    return { message: `mock:${id}:${status}` };
  }
}

export async function fetchTrips(status = "", page = 1, limit = 10) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit), status });
  return requestJson<{ items: TripListItem[]; total: number; page: number; limit: number }>(`/admin/trips?${params.toString()}`);
}

export async function fetchTripDetail(id: string): Promise<TripDetail> {
  try {
    return await requestJson<TripDetail>(`/admin/trips/${id}`);
  } catch {
    return mockTripDetail;
  }
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  return requestJson<CategoryItem[]>("/admin/categories");
}

export async function createCategory(payload: Partial<CategoryItem>) {
  try {
    return await requestJson<CategoryItem>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id: crypto.randomUUID(),
      name: payload.name ?? "Untitled",
      icon: payload.icon ?? null,
      color: payload.color ?? null,
      isDefault: payload.isDefault ?? false,
      expenseCount: 0,
      totalAmount: 0,
    };
  }
}

export async function updateCategory(id: string, payload: Partial<CategoryItem>) {
  try {
    return await requestJson<CategoryItem>(`/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id,
      name: payload.name ?? "Updated category",
      icon: payload.icon ?? null,
      color: payload.color ?? null,
      isDefault: payload.isDefault ?? false,
      expenseCount: 0,
      totalAmount: 0,
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    return await requestJson<{ message: string }>(`/admin/categories/${id}`, {
      method: "DELETE",
    });
  } catch {
    return { message: `mock:${id}:deleted` };
  }
}

export async function fetchDestinations(): Promise<DestinationItem[]> {
  return requestJson<DestinationItem[]>("/admin/destinations");
}

export async function fetchDestinationDetail(id: string): Promise<DestinationItem> {
  try {
    return await requestJson<DestinationItem>(`/admin/destinations/${id}`);
  } catch {
    const fallback = mockDestinations.find((destination) => destination.id === id);
    return fallback ?? mockDestinations[0];
  }
}

export async function fetchSettings(): Promise<AppSettings> {
  try {
    return await requestJson<AppSettings>("/admin/settings");
  } catch {
    return mockSettings;
  }
}

export async function saveSettings(payload: AppSettings): Promise<AppSettings> {
  try {
    return await requestJson<AppSettings>("/admin/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch {
    return payload;
  }
}

export function signOut() {
  clearSession();
}