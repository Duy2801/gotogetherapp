import { ApiError, api } from '../../api';

export interface Budget {
  id: string;
  userId: string;
  amount: number;
  spent: number;
  month: number;
  year: number;
  warningAt: number;
  percentage: number;
  remaining: number;
  isOverBudget: boolean;
  isWarning: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  categoryId?: string;
  amount: number;
  month?: number;
  year?: number;
  warningAt?: number;
}

export interface UpdateBudgetDto {
  amount?: number;
  warningAt?: number;
}

const unwrapResponse = <T>(response: any): T => {
  return (response?.data ?? response) as T;
};

export const budgetApi = {
  getBudget: async (month?: number, year?: number): Promise<Budget> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      const response = await api.get(
        `/budgets${params.toString() ? `?${params.toString()}` : ''}`,
      );
      return unwrapResponse<Budget>(response);
    } catch (error) {
      throw error as ApiError;
    }
  },

  createBudget: async (dto: CreateBudgetDto): Promise<Budget> => {
    try {
      const response = await api.post('/budgets', dto);
      return unwrapResponse<Budget>(response);
    } catch (error) {
      throw error as ApiError;
    }
  },

  updateBudget: async (
    budgetId: string,
    dto: UpdateBudgetDto,
  ): Promise<Budget> => {
    try {
      const response = await api.put(`/budgets/${budgetId}`, dto);
      return unwrapResponse<Budget>(response);
    } catch (error) {
      throw error as ApiError;
    }
  },
};
