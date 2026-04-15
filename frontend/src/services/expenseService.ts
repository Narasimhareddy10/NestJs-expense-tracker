import api from './api';
import type {
  Expense,
  PaginatedResult,
  FilterExpenseParams,
  CreateExpenseDto,
  UpdateExpenseDto,
} from '../types';

export const expenseService = {
  getExpenses: async (
    params: FilterExpenseParams = {},
  ): Promise<PaginatedResult<Expense>> => {
    const response = await api.get<PaginatedResult<Expense>>('/expenses', {
      params,
    });
    return response.data;
  },

  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (data: CreateExpenseDto): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  updateExpense: async (
    id: string,
    data: UpdateExpenseDto,
  ): Promise<Expense> => {
    const response = await api.patch<Expense>(`/expenses/${id}/update`, data);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<string> => {
    const response = await api.delete<string>(`/expenses/${id}/delete`);
    return response.data;
  },
};
