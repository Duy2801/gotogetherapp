import { ApiError, api } from '../../api';
import { tripApi } from '../home/api';
import { tripDetailApi, Expense } from '../tripdetail/api';

const GLOBAL_TRIP_SCOPE = 'all';

type NumberApiResponse = {
  status: boolean;
  data: number;
};

export interface SpendingPaymentSummary {
  totalSpent: number;
  totalDebt: number;
  totalReceived: number;
}

export interface SpendingBudgetSummary {
  quantity: number;
  totalBudget: number;
}

export interface PaymentTimelineItem {
  splitId: string;
  expenseId: string;
  tripId: string;
  tripName: string;
  counterpartyId: string;
  counterpartyName: string;
  counterpartyAvatar?: string;
  amount: number;
  description: string;
  date: string;
  direction: 'debt' | 'receivable';
  isPaid: boolean;
  confirmed: boolean;
  paidAt?: string;
  confirmedAt?: string;
}

export interface SpendingStatisticsTrip {
  tripId: string;
  tripName: string;
  totalAmount: number;
  expenseCount: number;
}

export interface SpendingStatisticsCategory {
  categoryId: string;
  categoryName: string;
  color: string | null;
  icon: string | null;
  totalAmount: number;
  expenseCount: number;
  percentage: number;
}

export interface SpendingStatisticsResponse {
  month?: number;
  year?: number;
  monthLabel?: string;
  totalAcrossTrips: number;
  selectedTripId: string | null;
  trips: SpendingStatisticsTrip[];
  categories: SpendingStatisticsCategory[];
}

type SplitActionResponse = {
  status: boolean;
  data?: any;
  message?: string;
};

const buildPaymentItemsFromExpense = (
  expense: Expense,
  tripId: string,
  tripName: string,
  userId: string,
): PaymentTimelineItem[] => {
  if (!expense.splits?.length) {
    return [];
  }

  const baseDescription =
    expense.description || expense.category?.name || 'Khoản thanh toán';

  if (expense.paidBy?.id === userId) {
    return expense.splits
      .filter(split => split.userId !== userId && !split.confirmed)
      .map(split => ({
        splitId: split.id,
        expenseId: expense.id,
        tripId,
        tripName,
        counterpartyId: split.user.id,
        counterpartyName: split.user.fullName,
        counterpartyAvatar: split.user.avatar,
        amount: Number(split.amount),
        description: baseDescription,
        date: expense.date,
        direction: 'receivable' as const,
        isPaid: Boolean(split.isPaid),
        confirmed: Boolean(split.confirmed),
        paidAt: split.paidAt,
        confirmedAt: split.confirmedAt,
      }));
  }

  return expense.splits
    .filter(split => split.userId === userId && !split.confirmed)
    .map(split => ({
      splitId: split.id,
      expenseId: expense.id,
      tripId,
      tripName,
      counterpartyId: expense.paidBy.id,
      counterpartyName: expense.paidBy.fullName,
      counterpartyAvatar: expense.paidBy.avatar,
      amount: Number(split.amount),
      description: baseDescription,
      date: expense.date,
      direction: 'debt' as const,
      isPaid: Boolean(split.isPaid),
      confirmed: Boolean(split.confirmed),
      paidAt: split.paidAt,
      confirmedAt: split.confirmedAt,
    }));
};

const groupPaymentItems = (items: PaymentTimelineItem[]) => {
  const grouped = new Map<string, PaymentTimelineItem[]>();

  items.forEach(item => {
    const key = `${item.direction}:${item.counterpartyId}`;
    const existing = grouped.get(key) || [];
    existing.push(item);
    grouped.set(key, existing);
  });

  return Array.from(grouped.entries()).map(([key, groupItems]) => {
    const [direction] = key.split(':');
    const first = groupItems[0];
    const totalAmount = groupItems.reduce((sum, item) => sum + item.amount, 0);

    return {
      id: key,
      direction: direction as 'debt' | 'receivable',
      counterpartyId: first.counterpartyId,
      counterpartyName: first.counterpartyName,
      counterpartyAvatar: first.counterpartyAvatar,
      totalAmount,
      items: groupItems.sort(
        (left, right) =>
          new Date(right.date).getTime() - new Date(left.date).getTime(),
      ),
    };
  });
};

export const spendingApi = {
  getPaymentSummary: async (): Promise<SpendingPaymentSummary> => {
    try {
      const [spentRes, debtRes, receivedRes] = await Promise.all([
        api.get(
          `/trips/${GLOBAL_TRIP_SCOPE}/expenses/total-spent`,
        ) as Promise<NumberApiResponse>,
        api.get(
          `/trips/${GLOBAL_TRIP_SCOPE}/expenses/total-debt`,
        ) as Promise<NumberApiResponse>,
        api.get(
          `/trips/${GLOBAL_TRIP_SCOPE}/expenses/total-received`,
        ) as Promise<NumberApiResponse>,
      ]);

      return {
        totalSpent: Number(spentRes.data ?? 0),
        totalDebt: Number(debtRes.data ?? 0),
        totalReceived: Number(receivedRes.data ?? 0),
      };
    } catch (error) {
      throw error as ApiError;
    }
  },

  getBudgetSummary: async (): Promise<SpendingBudgetSummary> => {
    try {
      const firstPage = await tripApi.getTrips({ page: 1, limit: 1 });
      const totalTrips = Number(firstPage.data.total ?? 0);

      if (!totalTrips) {
        return {
          quantity: 0,
          totalBudget: 0,
        };
      }

      const allTripsRes = await tripApi.getTrips({
        page: 1,
        limit: totalTrips,
      });
      const totalBudget = allTripsRes.data.trips.reduce((sum, trip) => {
        const rawBudget = trip.totalBudget;
        const budget = Number(rawBudget ?? 0);
        return sum + (Number.isFinite(budget) ? budget : 0);
      }, 0);

      return {
        quantity: totalTrips,
        totalBudget,
      };
    } catch (error) {
      throw error as ApiError;
    }
  },

  getPaymentDetailGroups: async (userId: string) => {
    try {
      const firstPage = await tripApi.getTrips({ page: 1, limit: 1 });
      const totalTrips = Number(firstPage.data.total ?? 0);

      if (!totalTrips) {
        return {
          debtGroups: [],
          receivableGroups: [],
        };
      }

      const tripsResponse = await tripApi.getTrips({
        page: 1,
        limit: totalTrips,
      });
      const trips = tripsResponse.data.trips || [];

      const expenseResponses = await Promise.all(
        trips.map(async trip => {
          const response = await tripDetailApi.getTripExpenses(trip.id, {
            page: 1,
            limit: 200,
          });

          return {
            tripId: trip.id,
            tripName: trip.name,
            expenses: response.data.expenses || [],
          };
        }),
      );

      const items = expenseResponses.flatMap(entry =>
        entry.expenses.flatMap(expense =>
          buildPaymentItemsFromExpense(
            expense,
            entry.tripId,
            entry.tripName,
            userId,
          ),
        ),
      );

      const groups = groupPaymentItems(items);

      return {
        debtGroups: groups.filter(group => group.direction === 'debt'),
        receivableGroups: groups.filter(
          group => group.direction === 'receivable',
        ),
      };
    } catch (error) {
      throw error as ApiError;
    }
  },

  getSpendingStatistics: async (
    tripId?: string,
    month?: number,
    year?: number,
  ): Promise<SpendingStatisticsResponse> => {
    try {
      const response = await api.get('/statistics/spending', {
        params: {
          ...(tripId ? { tripId } : {}),
          ...(month ? { month } : {}),
          ...(year ? { year } : {}),
        },
      });

      const data = (response as any)?.data ?? response;

      return {
        month: Number(data?.month ?? 0) || undefined,
        year: Number(data?.year ?? 0) || undefined,
        monthLabel: data?.monthLabel ?? undefined,
        totalAcrossTrips: Number(data?.totalAcrossTrips ?? 0),
        selectedTripId: data?.selectedTripId ?? null,
        trips: Array.isArray(data?.trips) ? data.trips : [],
        categories: Array.isArray(data?.categories) ? data.categories : [],
      };
    } catch (error) {
      throw error as ApiError;
    }
  },

  markSplitAsPaid: async (splitId: string): Promise<SplitActionResponse> => {
    try {
      const response = await api.post(`/expense-split/${splitId}/pay`);
      return response as unknown as SplitActionResponse;
    } catch (error) {
      throw error as ApiError;
    }
  },

  confirmSplitReceived: async (
    splitId: string,
  ): Promise<SplitActionResponse> => {
    try {
      const response = await api.post(`/expense-split/${splitId}/confirm`);
      return response as unknown as SplitActionResponse;
    } catch (error) {
      throw error as ApiError;
    }
  },

  sendReminder: async (
    toUserId: string,
    message: string,
    splitId?: string,
  ): Promise<{ message: string }> => {
    try {
      const response = await api.post(`/notification/remind/${toUserId}`, {
        message,
        splitId,
      });
      return response as unknown as { message: string };
    } catch (error) {
      throw error as ApiError;
    }
  },
};
