import { clearSession, getAuthToken, normalizeSessionUser, setSession } from "../lib/auth";
import type {
  AppSettings,
  AuthSession,
  CategoryItem,
  DashboardSummary,
  ExpenseItem,
  TripDetail,
  TripListItem,
  UserDetail,
  UserListItem,
} from "../lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";
const GET_CACHE_TTL_MS = 120_000;

type RequestOptions = RequestInit & { auth?: boolean; cacheResponse?: boolean; ttlMs?: number };
type Paginated<T> = { items: T[]; total: number; page: number; limit: number };
type CacheEntry = {
  expiresAt: number;
  data?: unknown;
  promise?: Promise<unknown>;
};

const getCache = new Map<string, CacheEntry>();

export function clearApiCache() {
  getCache.clear();
}

async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isGet = method === "GET";
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  let token = "";
  if (options.auth !== false) {
    token = getAuthToken() ?? "";
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const cacheEnabled = isGet && options.cacheResponse !== false;
  const cacheKey = cacheEnabled ? `${token}:${path}` : "";
  const cached = cacheKey ? getCache.get(cacheKey) : undefined;

  if (cached) {
    if (cached.data !== undefined && cached.expiresAt > Date.now()) return cached.data as T;
    if (cached.promise) return cached.promise as Promise<T>;
  }

  const requestPromise = (async () => {
    const { cacheResponse: _cacheResponse, ttlMs: _ttlMs, ...fetchOptions } = options;
    const response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      const message = payload?.message ?? payload?.data?.message ?? response.statusText ?? "Request failed";
      throw new Error(Array.isArray(message) ? message.join(", ") : message);
    }

    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    const data = (payload && typeof payload === "object" && "data" in payload ? payload.data : payload) as T;

    if (!isGet) clearApiCache();
    return data;
  })();

  if (cacheKey) {
    getCache.set(cacheKey, { expiresAt: Date.now() + (options.ttlMs ?? GET_CACHE_TTL_MS), promise: requestPromise });
  }

  try {
    const data = await requestPromise;
    if (cacheKey) getCache.set(cacheKey, { expiresAt: Date.now() + (options.ttlMs ?? GET_CACHE_TTL_MS), data });
    return data;
  } catch (error) {
    if (cacheKey) getCache.delete(cacheKey);
    throw error;
  }
}

function queryString(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function loginAdmin(email: string, password: string): Promise<AuthSession> {
  const result = await requestJson<AuthSession>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email, password }),
  });

  const session = { ...result, user: normalizeSessionUser(result.user) };
  setSession(session);
  return session;
}

export function fetchMe() {
  return requestJson<AuthSession["user"]>("/admin/me");
}

export function fetchDashboard(month?: number, year?: number) {
  return requestJson<DashboardSummary>(`/admin/dashboard${queryString({ month, year })}`);
}

export function fetchUsers(query = "", page = 1, limit = 10, status = "") {
  return requestJson<Paginated<UserListItem>>(`/admin/users${queryString({ query, page, limit, status })}`);
}

export function fetchUserDetail(id: string) {
  return requestJson<UserDetail>(`/admin/users/${id}`);
}

export function createUser(payload: Partial<UserListItem> & { dateOfBirth?: string | null; gender?: number | string | null }) {
  return requestJson<UserListItem>("/admin/users", { method: "POST", body: JSON.stringify(payload) });
}

export function updateUser(id: string, payload: Partial<UserListItem> & { dateOfBirth?: string | null; gender?: number | string | null }) {
  return requestJson<UserListItem>(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function updateUserStatus(id: string, status: string) {
  return requestJson<{ id: string; status: string }>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteUser(id: string) {
  return requestJson<{ message: string }>(`/admin/users/${id}`, { method: "DELETE" });
}

export function fetchTrips(query = "", status = "", page = 1, limit = 10) {
  return requestJson<Paginated<TripListItem>>(`/admin/trips${queryString({ query, status, page, limit })}`);
}

export function fetchTripDetail(id: string) {
  return requestJson<TripDetail>(`/admin/trips/${id}`);
}

export function createTrip(payload: Partial<TripListItem>) {
  return requestJson<TripListItem>("/admin/trips", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTrip(id: string, payload: Partial<TripListItem>) {
  return requestJson<TripListItem>(`/admin/trips/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteTrip(id: string) {
  return requestJson<{ message: string }>(`/admin/trips/${id}`, { method: "DELETE" });
}

export function fetchCategories() {
  return requestJson<CategoryItem[]>("/admin/categories");
}

export function createCategory(payload: Partial<CategoryItem>) {
  return requestJson<CategoryItem>("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
}

export function updateCategory(id: string, payload: Partial<CategoryItem>) {
  return requestJson<CategoryItem>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteCategory(id: string) {
  return requestJson<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" });
}

export function fetchExpenses(query = "", tripId = "", categoryId = "", page = 1, limit = 10) {
  return requestJson<Paginated<ExpenseItem>>(`/admin/expenses${queryString({ query, tripId, categoryId, page, limit })}`);
}

export function createExpense(payload: Partial<ExpenseItem>) {
  return requestJson<ExpenseItem>("/admin/expenses", { method: "POST", body: JSON.stringify(payload) });
}

export function updateExpense(id: string, payload: Partial<ExpenseItem>) {
  return requestJson<ExpenseItem>(`/admin/expenses/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deleteExpense(id: string) {
  return requestJson<{ message: string }>(`/admin/expenses/${id}`, { method: "DELETE" });
}

export function fetchSettings() {
  return requestJson<AppSettings>("/admin/settings");
}

export function saveSettings(payload: AppSettings) {
  return requestJson<AppSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(payload) });
}

export function signOut() {
  clearApiCache();
  clearSession();
}
