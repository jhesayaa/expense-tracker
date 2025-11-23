'use client';

import { useState, useEffect } from 'react';
import { TransactionInput, Transaction } from '@/lib/transaction.service';
import { Category, categoryService } from '@/lib/category.service';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionInput) => Promise<void>;
  transaction?: Transaction;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
}: TransactionModalProps) {
  const [formData, setFormData] = useState<TransactionInput>({
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    category_id: 0,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setFormData({
          amount: transaction.amount,
          description: transaction.description,
          date: transaction.date.split('T')[0],
          type: transaction.type,
          category_id: transaction.category_id,
        });
      } else {
        setFormData({
          amount: 0,
          description: '',
          date: new Date().toISOString().split('T')[0],
          type: 'expense',
          category_id: 0,
        });
      }
      fetchCategories();
    }
  }, [isOpen, transaction]);

  useEffect(() => {
    if (formData.type) {
      fetchCategories();
    }
  }, [formData.type]);

  const fetchCategories = async () => {
    try {
      const cats = await categoryService.getCategoriesByType(formData.type);
      setCategories(cats);
      if (!formData.category_id && cats.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.category_id) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const dateWithTime = new Date(formData.date).toISOString();
      await onSubmit({ ...formData, date: dateWithTime });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex space-x-4">
              <label className="flex-1">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'expense' })
                  }
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg text-center cursor-pointer transition ${
                    formData.type === 'expense'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  💸 Expense
                </div>
              </label>
              <label className="flex-1">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'income' })
                  }
                  className="sr-only"
                />
                <div
                  className={`p-3 border-2 rounded-lg text-center cursor-pointer transition ${
                    formData.type === 'income'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  💰 Income
                </div>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              id="amount"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="0"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              id="description"
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Grocery shopping"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              required
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}