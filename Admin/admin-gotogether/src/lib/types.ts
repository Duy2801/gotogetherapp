export type SessionUser = {
  id: string;
  email: string;
  fullName?: string | null;
  avatar?: string | null;
  roles?: string[];
  permissions?: string[];
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: SessionUser;
};

export type DashboardSummary = {
  month: number;
  year: number;
  totalUsers: number;
  activeUsers: number;
  totalTrips: number;
  ongoingTrips: number;
  totalExpenses: number;
  totalBudget: number;
  topTrips: Array<{
    id: string;
    name: string;
    status: string;
    members: number;
    expenseTotal: number;
  }>;
  topCategories: Array<{
    id: string;
    name: string;
    color?: string | null;
    totalAmount: number;
  }>;
  destinations?: Array<{
    id: string;
    label: string;
    tripCount: number;
    totalExpense: number;
    latestTripAt?: string | null;
  }>;
};

export type UserListItem = {
  id: string;
  email: string;
  fullName?: string | null;
  avatar?: string | null;
  status: string;
  isVerified: boolean;
  roles: string[];
  tripCount: number;
  expenseTotal: number;
  createdAt: string;
};

export type UserDetail = UserListItem & {
  dateOfBirth?: string | null;
  gender?: number | null;
  joinedTrips: Array<{
    id: string;
    tripId: string;
    tripName: string;
    role: string;
    inviteStatus: string;
  }>;
  recentExpenses: Array<{
    id: string;
    tripName: string;
    amount: number;
    description?: string | null;
    date: string;
  }>;
};

export type TripListItem = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  memberCount: number;
  expenseTotal: number;
  totalBudget?: number | null;
  createdAt: string;
  images?: string | null;
};

export type TripDetail = TripListItem & {
  images?: string | null;
  members: Array<{
    id: string;
    userId: string;
    fullName: string;
    avatar?: string | null;
    role: string;
    inviteStatus: string;
  }>;
  expenses: Array<{
    id: string;
    amount: number;
    description?: string | null;
    categoryName: string;
    paidByName: string;
    date: string;
  }>;
};

export type CategoryItem = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  isDefault: boolean;
  expenseCount: number;
  totalAmount: number;
};

export type DestinationItem = {
  id: string;
  label: string;
  tripCount: number;
  totalExpense: number;
  latestTripAt?: string | null;
  topTrips: Array<{
    id: string;
    name: string;
    status: string;
    totalExpense: number;
  }>;
};

export type AppSettings = {
  language: string;
  timezone: string;
  reportMode: string;
  notificationsEnabled: boolean;
  autoLockMinutes: number;
  currency: string;
};

export type ExpenseItem = {
  id: string;
  tripId: string;
  tripName: string;
  tripImage?: string | null;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  categoryIcon?: string | null;
  categoryColor?: string | null;
  description?: string | null;
  paidById: string;
  paidByName: string;
  paidByAvatar?: string | null;
  type: string;
  date: string;
  receipt?: string | null;
  isConfirmed: boolean;
  createdAt: string;
};
