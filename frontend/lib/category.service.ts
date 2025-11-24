import api from './api';

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  user_id?: number;
  created_at: string;
}

export interface CategoryInput {
  name: string;
  type: 'income' | 'expense';
  icon: string;
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

  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CategoryInput): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: CategoryInput): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};