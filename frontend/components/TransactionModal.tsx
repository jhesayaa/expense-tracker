'use client';

import { useState, useEffect } from 'react';
import { TransactionInput, Transaction } from '@/lib/transaction.service';
import { Category, categoryService } from '@/lib/category.service';
import {
  XMarkIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
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
    } else {
      setIsAnimating(false);
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

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'expense' })
                  }
                  className="sr-only peer"
                />
                <div className="p-4 border-2 rounded-xl text-center transition-all duration-200 peer-checked:border-red-500 peer-checked:bg-gradient-to-br peer-checked:from-red-50 peer-checked:to-rose-50 peer-checked:shadow-lg peer-checked:scale-105 hover:border-red-300 border-gray-300">
                  <ArrowTrendingDownIcon className={`w-8 h-8 mx-auto mb-2 ${formData.type === 'expense' ? 'text-red-600' : 'text-gray-400'}`} />
                  <div className={`font-bold text-base ${formData.type === 'expense' ? 'text-red-700' : 'text-gray-700'}`}>
                    Expense
                  </div>
                </div>
              </label>
              <label className="relative cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as 'income' })
                  }
                  className="sr-only peer"
                />
                <div className="p-4 border-2 rounded-xl text-center transition-all duration-200 peer-checked:border-green-500 peer-checked:bg-gradient-to-br peer-checked:from-green-50 peer-checked:to-emerald-50 peer-checked:shadow-lg peer-checked:scale-105 hover:border-green-300 border-gray-300">
                  <ArrowTrendingUpIcon className={`w-8 h-8 mx-auto mb-2 ${formData.type === 'income' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div className={`font-bold text-base ${formData.type === 'income' ? 'text-green-700' : 'text-gray-700'}`}>
                    Income
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                Rp
              </span>
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
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-lg font-semibold text-gray-900 placeholder:text-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
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
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              placeholder="e.g., Grocery shopping"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              required
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900"
            >
              <option value="" className="text-gray-400">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="text-gray-900">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? 'Saving...' : transaction ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}