import api from './api';

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category_id: number;
  category: {
    id: number;
    name: string;
    icon: string;
    type: string;
  };
  created_at: string;
}

export interface TransactionInput {
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category_id: number;
}

export interface TransactionFilter {
  page?: number;
  limit?: number;
  type?: string;
  category_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface TransactionResponse {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const transactionService = {
  getTransactions: async (filter?: TransactionFilter): Promise<TransactionResponse> => {
    const params = new URLSearchParams();
    
    if (filter?.page) params.append('page', filter.page.toString());
    if (filter?.limit) params.append('limit', filter.limit.toString());
    if (filter?.type) params.append('type', filter.type);
    if (filter?.category_id) params.append('category_id', filter.category_id.toString());
    if (filter?.start_date) params.append('start_date', filter.start_date);
    if (filter?.end_date) params.append('end_date', filter.end_date);

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  getTransaction: async (id: number): Promise<Transaction> => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data: TransactionInput): Promise<Transaction> => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  updateTransaction: async (id: number, data: TransactionInput): Promise<Transaction> => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id: number): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },
};