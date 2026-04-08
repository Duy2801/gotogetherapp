import { api, ApiError } from '../../../api';

export interface Member {
  id: string;
  userId: string;
  fullName: string;
  avatar?: string;
  role: 'OWNER' | 'MEMBER';
  inviteStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ExpenseSplit {
  id: string;
  userId: string;
  amount: number;
  percentage?: number;
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
  isPaid: boolean;
  paidAt?: string;
  confirmed: boolean;
  confirmedAt?: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  currency: string;
  categoryId: string;
  description?: string;
  paidById: string;
  type: 'SHARED' | 'PERSONAL';
  date: string;
  receipt?: string;
  isConfirmed: boolean;
  createdAt: string;
  category: Category;
  paidBy: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  splits?: ExpenseSplit[];
}

export interface TripDetail {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalBudget?: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ARCHIVED';
  images?: string;
  createdAt: string;
  updatedAt: string;
  members: Member[];
  expenses?: Expense[];
  totalExpense?: number;
  memberCount: number;
}

export interface CreateExpenseDto {
  amount: number;
  currency?: string;
  categoryId: string;
  description?: string;
  paidById: string;
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
  participants: string[];
  date?: string;
  receipt?: string;
  customSplits?: {
    userId: string;
    amount: number;
  }[];
}
export interface InviteMemberPayload {
  email: string;
}

export interface InviteMemberResponse {
  status: boolean;
  data: {
    id: string;
    tripId: string;
    userId: string;
    role: string;
    inviteStatus: 'PENDING';
    user: {
      id: string;
      fullName: string;
      email: string;
      avatar: string;
    };
  };
}

export interface TripMemberActionResponse {
  status: boolean;
  data?: any;
  message?: string;
}

export const tripDetailApi = {
  getTripDetail: async (
    tripId: string,
  ): Promise<{
    status: boolean;
    data: TripDetail;
  }> => {
    try {
      const response = await api.get(`/trips/${tripId}/detail`);
      return response as any;
    } catch (error) {
      throw error as ApiError;
    }
  },

  getTripMembers: async (
    tripId: string,
  ): Promise<{
    status: boolean;
    data: { members: Member[] };
  }> => {
    try {
      const response = await api.get(`/trips/${tripId}/members`);
      return response as any;
    } catch (error) {
      throw error as ApiError;
    }
  },

  getExpenseCategories: async (
    tripId: string,
  ): Promise<{
    status: boolean;
    data: Category[];
  }> => {
    try {
      const response = await api.get(`/trips/${tripId}/expenses/categories`);
      return response as any;
    } catch (error) {
      throw error as ApiError;
    }
  },

  // Get trip expenses
  getTripExpenses: async (
    tripId: string,
    params?: {
      categoryId?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{
    status: boolean;
    data: { expenses: Expense[]; total: number };
  }> => {
    try {
      const response = await api.get(`/trips/${tripId}/expenses`, { params });
      return response as any;
    } catch (error) {
      throw error as ApiError;
    }
  },

  inviteMember: async (
    tripId: string,
    payload: InviteMemberPayload,
  ): Promise<InviteMemberResponse> => {
    try {
      const response = await api.post(`/tripMember/${tripId}/invite`, payload);
      return response as unknown as InviteMemberResponse;
    } catch (error) {
      throw error as ApiError;
    }
  },

  leaveTrip: async (tripId: string): Promise<TripMemberActionResponse> => {
    try {
      const response = await api.post(`/tripMember/${tripId}/leave`);
      return response as unknown as TripMemberActionResponse;
    } catch (error: any) {
      // Keep compatibility in case backend uses an alternative route.
      const statusCode = error?.statusCode || error?.status;
      if (statusCode === 404) {
        const fallback = await api.post(`/trips/${tripId}/leave`);
        return fallback as unknown as TripMemberActionResponse;
      }
      throw error as ApiError;
    }
  },

  transferOwner: async (
    tripId: string,
    newOwnerId: string,
  ): Promise<TripMemberActionResponse> => {
    try {
      const response = await api.post(
        `/tripMember/${tripId}/transfer-ower/${newOwnerId}`,
      );
      return response as unknown as TripMemberActionResponse;
    } catch (error) {
      throw error as ApiError;
    }
  },

  deleteTrip: async (tripId: string): Promise<TripMemberActionResponse> => {
    try {
      const response = await api.delete(`/trips/${tripId}`);
      return response as unknown as TripMemberActionResponse;
    } catch (error) {
      throw error as ApiError;
    }
  },

  createExpense: async (
    tripId: string,
    payload: CreateExpenseDto,
  ): Promise<{
    status: boolean;
    data: Expense;
  }> => {
    try {
      const response = await api.post(`/trips/${tripId}/expenses`, payload);
      return response as any;
    } catch (error) {
      throw error as ApiError;
    }
  },
};
