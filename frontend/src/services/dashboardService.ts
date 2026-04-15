import api from './api';
import type { DashboardStats, SpendingTrend } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getTrends: async (): Promise<{ months: SpendingTrend[] }> => {
    const response = await api.get<{ months: SpendingTrend[] }>(
      '/dashboard/trends',
    );
    return response.data;
  },
};
