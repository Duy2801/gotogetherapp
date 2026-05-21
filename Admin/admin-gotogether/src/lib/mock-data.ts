import type {
  AppSettings,
  CategoryItem,
  DashboardSummary,
  DestinationItem,
  TripDetail,
  TripListItem,
  UserDetail,
  UserListItem,
} from "./types";

export const mockSession = {
  accessToken: "mock-admin-token",
  user: {
    id: "admin-001",
    email: "admin@gotogether.app",
    fullName: "GoTogether Admin",
    roles: ["ADMIN"],
    permissions: ["MANAGE_USERS", "MANAGE_TRIPS", "VIEW_ANALYTICS"],
  },
};

export const mockDashboard: DashboardSummary = {
  month: 5,
  year: 2026,
  totalUsers: 1260,
  activeUsers: 842,
  totalTrips: 312,
  ongoingTrips: 48,
  totalExpenses: 128400000,
  totalBudget: 152000000,
  topTrips: [
    { id: "trip-da-lat", name: "Da Lat Spring Ride", status: "ONGOING", members: 12, expenseTotal: 18400000 },
    { id: "trip-phu-quoc", name: "Phu Quoc Escape", status: "COMPLETED", members: 9, expenseTotal: 16200000 },
    { id: "trip-sapa", name: "Sapa Summit", status: "UPCOMING", members: 7, expenseTotal: 7400000 },
  ],
  topCategories: [
    { id: "food", name: "Food", color: "#F59E0B", totalAmount: 39800000 },
    { id: "stay", name: "Accommodation", color: "#3B82F6", totalAmount: 32200000 },
    { id: "move", name: "Transportation", color: "#10B981", totalAmount: 20800000 },
  ],
  destinations: [
    { id: "da-lat", label: "Da Lat", tripCount: 18, totalExpense: 32400000, latestTripAt: "2026-05-18T12:00:00.000Z" },
    { id: "phu-quoc", label: "Phu Quoc", tripCount: 12, totalExpense: 28100000, latestTripAt: "2026-05-15T12:00:00.000Z" },
    { id: "sapa", label: "Sapa", tripCount: 8, totalExpense: 19400000, latestTripAt: "2026-05-12T12:00:00.000Z" },
  ],
};

export const mockUsers: UserListItem[] = [
  { id: "user-1", email: "linh@gotogether.app", fullName: "Linh Nguyen", status: "ACTIVE", isVerified: true, roles: ["USER"], tripCount: 7, expenseTotal: 5400000, createdAt: "2026-01-12T08:00:00.000Z" },
  { id: "user-2", email: "minh@gotogether.app", fullName: "Minh Tran", status: "ACTIVE", isVerified: true, roles: ["USER"], tripCount: 11, expenseTotal: 8200000, createdAt: "2025-12-21T08:00:00.000Z" },
  { id: "user-3", email: "huy@gotogether.app", fullName: "Huy Pham", status: "BANNED", isVerified: false, roles: ["USER"], tripCount: 2, expenseTotal: 430000, createdAt: "2026-03-02T08:00:00.000Z" },
];

export const mockUserDetail: UserDetail = {
  ...mockUsers[0],
  dateOfBirth: "1998-03-10T00:00:00.000Z",
  gender: 1,
  joinedTrips: [
    { id: "tm-1", tripId: "trip-da-lat", tripName: "Da Lat Spring Ride", role: "MEMBER", inviteStatus: "ACCEPTED" },
    { id: "tm-2", tripId: "trip-phu-quoc", tripName: "Phu Quoc Escape", role: "OWNER", inviteStatus: "ACCEPTED" },
  ],
  recentExpenses: [
    { id: "expense-1", tripName: "Da Lat Spring Ride", amount: 680000, description: "Airport pickup", date: "2026-05-20T09:00:00.000Z" },
    { id: "expense-2", tripName: "Phu Quoc Escape", amount: 1150000, description: "Seafood dinner", date: "2026-05-19T18:30:00.000Z" },
  ],
};

export const mockTrips: TripListItem[] = [
  { id: "trip-da-lat", name: "Da Lat Spring Ride", startDate: "2026-05-22T00:00:00.000Z", endDate: "2026-05-26T00:00:00.000Z", status: "ONGOING", memberCount: 12, expenseTotal: 18400000, totalBudget: 25000000, createdAt: "2026-04-15T10:00:00.000Z" },
  { id: "trip-phu-quoc", name: "Phu Quoc Escape", startDate: "2026-03-12T00:00:00.000Z", endDate: "2026-03-18T00:00:00.000Z", status: "COMPLETED", memberCount: 9, expenseTotal: 16200000, totalBudget: 20000000, createdAt: "2026-02-03T10:00:00.000Z" },
  { id: "trip-sapa", name: "Sapa Summit", startDate: "2026-06-10T00:00:00.000Z", endDate: "2026-06-15T00:00:00.000Z", status: "UPCOMING", memberCount: 7, expenseTotal: 7400000, totalBudget: 15000000, createdAt: "2026-05-01T10:00:00.000Z" },
];

export const mockTripDetail: TripDetail = {
  ...mockTrips[0],
  images: null,
  members: [
    { id: "tm-1", userId: "user-1", fullName: "Linh Nguyen", avatar: null, role: "OWNER", inviteStatus: "ACCEPTED" },
    { id: "tm-2", userId: "user-2", fullName: "Minh Tran", avatar: null, role: "MEMBER", inviteStatus: "ACCEPTED" },
  ],
  expenses: [
    { id: "expense-1", amount: 680000, description: "Airport pickup", categoryName: "Transportation", paidByName: "Linh Nguyen", date: "2026-05-20T09:00:00.000Z" },
    { id: "expense-2", amount: 1150000, description: "Seafood dinner", categoryName: "Food", paidByName: "Minh Tran", date: "2026-05-19T18:30:00.000Z" },
  ],
};

export const mockCategories: CategoryItem[] = [
  { id: "food", name: "Food", icon: "🍜", color: "#F59E0B", isDefault: true, expenseCount: 58, totalAmount: 39800000 },
  { id: "stay", name: "Accommodation", icon: "🏨", color: "#3B82F6", isDefault: true, expenseCount: 43, totalAmount: 32200000 },
  { id: "move", name: "Transportation", icon: "🚗", color: "#10B981", isDefault: true, expenseCount: 39, totalAmount: 20800000 },
];

export const mockDestinations: DestinationItem[] = [
  { id: "da-lat", label: "Da Lat", tripCount: 18, totalExpense: 32400000, latestTripAt: "2026-05-18T12:00:00.000Z", topTrips: [{ id: "trip-da-lat", name: "Da Lat Spring Ride", status: "ONGOING", totalExpense: 18400000 }, { id: "trip-da-lat-2", name: "Cloud Garden Weekend", status: "COMPLETED", totalExpense: 10400000 }] },
  { id: "phu-quoc", label: "Phu Quoc", tripCount: 12, totalExpense: 28100000, latestTripAt: "2026-05-15T12:00:00.000Z", topTrips: [{ id: "trip-phu-quoc", name: "Phu Quoc Escape", status: "COMPLETED", totalExpense: 16200000 }] },
  { id: "sapa", label: "Sapa", tripCount: 8, totalExpense: 19400000, latestTripAt: "2026-05-12T12:00:00.000Z", topTrips: [{ id: "trip-sapa", name: "Sapa Summit", status: "UPCOMING", totalExpense: 7400000 }] },
];

export const mockSettings: AppSettings = {
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  reportMode: "monthly",
  notificationsEnabled: true,
  autoLockMinutes: 15,
  currency: "VND",
};