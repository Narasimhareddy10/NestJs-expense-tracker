import api from './api';
import type {
  BudgetSummary,
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
} from '../types';

export const budgetService = {
  getBudgets: async (): Promise<BudgetSummary[]> => {
    const response = await api.get<BudgetSummary[]>('/budgets');
    return response.data;
  },

  getBudgetById: async (id: string): Promise<Budget> => {
    const response = await api.get<Budget>(`/budgets/${id}`);
    return response.data;
  },

  createBudget: async (data: CreateBudgetDto): Promise<Budget> => {
    const response = await api.post<Budget>('/budgets', data);
    return response.data;
  },

  updateBudget: async (id: string, data: UpdateBudgetDto): Promise<Budget> => {
    const response = await api.patch<Budget>(`/budgets/${id}/update`, data);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<string> => {
    const response = await api.delete<string>(`/budgets/${id}/delete`);
    return response.data;
  },
};
