'use client';

import { useEffect, useState } from 'react';
import DashboardWrapper from '../dashboard/DashboardWrapper';
import TransactionModal from '@/components/TransactionModal';
import {
  transactionService,
  Transaction,
  TransactionInput,
  TransactionFilter,
} from '@/lib/transaction.service';
import { Category, categoryService } from '@/lib/category.service';
import {
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filter, setFilter] = useState<TransactionFilter>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [filter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await transactionService.getTransactions(filter);
      setTransactions(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(undefined);
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setModalOpen(true);
  };

  const handleSubmitTransaction = async (data: TransactionInput) => {
    if (editingTransaction) {
      await transactionService.updateTransaction(editingTransaction.id, data);
    } else {
      await transactionService.createTransaction(data);
    }
    fetchTransactions();
  };

  const handleDeleteTransaction = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        fetchTransactions();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilter((prev) => ({ ...prev, page: newPage }));
  };

  const hasActiveFilters = filter.type || filter.category_id || filter.start_date || filter.end_date;

  return (
    <DashboardWrapper>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Transactions
            </h1>
            <p className="text-gray-600 mt-1">Manage your income and expenses</p>
          </div>
          <button
            onClick={handleAddTransaction}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Add Transaction</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
          <div className="flex items-center space-x-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={filter.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filter.category_id || ''}
                onChange={(e) =>
                  handleFilterChange('category_id', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <input
                type="date"
                value={filter.start_date || ''}
                onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <input
                type="date"
                value={filter.end_date || ''}
                onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => setFilter({ page: 1, limit: 10 })}
              className="mt-4 flex items-center space-x-2 text-sm text-green-600 hover:text-green-700 font-medium group"
            >
              <XMarkIcon className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>Clear all filters</span>
            </button>
          )}
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading transactions...</p>
              </div>
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">No transactions found</p>
              <p className="text-sm mt-2">Add your first transaction to get started!</p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-green-700 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-green-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gradient-to-r hover:from-green-50/50 hover:to-emerald-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg">
                            <span className="text-lg">{transaction.category.icon}</span>
                            <span>{transaction.category.name}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'income'
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span
                            className={`font-bold ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            Rp {transaction.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-green-600 hover:text-green-700 font-semibold transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-700 font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold text-green-700">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-semibold text-green-700">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                  <span className="font-semibold text-green-700">{pagination.total}</span> transactions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitTransaction}
        transaction={editingTransaction}
      />
    </DashboardWrapper>
  );
}