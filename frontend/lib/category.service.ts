import api from './api';

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  user_id?: number;
  created_at: string;
}

export const categoryService = {

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategoriesByType: async (type: 'income' | 'expense'): Promise<Category[]> => {
    const response = await api.get(`/categories?type=${type}`);
    return response.data;
  },
};