import api from './api';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types';

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post<Category>('/categories', data);
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: UpdateCategoryDto,
  ): Promise<Category> => {
    const response = await api.patch<Category>(
      `/categories/${id}/update`,
      data,
    );
    return response.data;
  },

  deleteCategory: async (id: string): Promise<string> => {
    const response = await api.delete<string>(`/categories/${id}/delete`);
    return response.data;
  },
};
