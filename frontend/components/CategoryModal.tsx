'use client';

import { useState, useEffect } from 'react';
import {
  XMarkIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

interface CategoryInput {
  name: string;
  type: 'income' | 'expense';
  icon: string;
}

interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  user_id?: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryInput) => Promise<void>;
  category?: Category;
}

// Common emoji icons for categories (20 most common)
const EMOJI_SUGGESTIONS = [
  '💡', '🍽️', '🛒', '🚗', '💰', '💵', '🏠', '📱',
  '⚡', '🎬', '🎮', '📚', '💊', '✈️', '☕', '🎁',
  '💼', '🏋️', '🎵', '🖥️'
];

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    type: 'expense',
    icon: '📦',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      if (category) {
        setFormData({
          name: category.name,
          type: category.type,
          icon: category.icon,
        });
      } else {
        setFormData({
          name: '',
          type: 'expense',
          icon: '📦',
        });
      }
      setError('');
    } else {
      setIsAnimating(false);
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (!formData.icon.trim()) {
      setError('Please select an icon');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category');
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
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {category ? 'Edit Category' : 'Add Category'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Category Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 placeholder:text-gray-400"
              placeholder="e.g., Gaming, Freelance"
            />
          </div>

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

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Icon
            </label>
            <div className="mb-4 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <span className="text-6xl">{formData.icon}</span>
            </div>
            <div className="grid grid-cols-5 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`text-3xl p-3 rounded-lg hover:bg-green-100 hover:scale-110 transition-all ${
                    formData.icon === emoji ? 'bg-gradient-to-br from-green-100 to-emerald-100 ring-2 ring-green-500 scale-110' : 'bg-white'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-gray-600 font-medium">
              💡 Or type your own emoji below
            </p>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="mt-2 w-full px-3 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-center text-3xl transition"
              placeholder="🎮"
              maxLength={2}
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
              {loading ? 'Saving...' : category ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}