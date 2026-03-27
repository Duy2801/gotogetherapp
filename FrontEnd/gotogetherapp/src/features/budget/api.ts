import { ApiError, api } from '../../api';

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

export const budgetApi = {
  getBudget: async (month?: number, year?: number): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month.toString());
      if (year) params.append('year', year.toString());

      const response = await api.get(
        `/budgets${params.toString() ? `?${params.toString()}` : ''}`,
      );
      return response.data || response;
    } catch (error) {
      throw error as ApiError;
    }
  },

  createBudget: async (dto: CreateBudgetDto): Promise<any> => {
    try {
      const response = await api.post('/budgets', dto);
      return response.data || response;
    } catch (error) {
      throw error as ApiError;
    }
  },

  updateBudget: async (
    budgetId: string,
    dto: UpdateBudgetDto,
  ): Promise<any> => {
    try {
      const response = await api.put(`/budgets/${budgetId}`, dto);
      return response.data || response;
    } catch (error) {
      throw error as ApiError;
    }
  },
};
