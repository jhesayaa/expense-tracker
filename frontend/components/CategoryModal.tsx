'use client';

import { useState, useEffect } from 'react';

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

// Common emoji icons for categories
const EMOJI_SUGGESTIONS = [
  '🍔', '🚗', '🏠', '💡', '🎬', '🛒', '👕', '💊', '📚', '✈️',
  '💰', '📈', '🎁', '💼', '🎮', '🏋️', '🍕', '☕', '🎵', '📱',
  '🖥️', '⚡', '🌟', '🎨', '📦', '🔧', '💳', '🎯', '🌍', '🏆'
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

  useEffect(() => {
    if (isOpen) {
      if (category) {
        // Edit mode
        setFormData({
          name: category.name,
          type: category.type,
          icon: category.icon,
        });
      } else {
        // Add mode
        setFormData({
          name: '',
          type: 'expense',
          icon: '📦',
        });
      }
      setError('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {category ? 'Edit Category' : 'Add Custom Category'}
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

          {/* Category Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="e.g., Gaming, Freelance"
            />
          </div>

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

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="mb-3 flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
              <span className="text-5xl">{formData.icon}</span>
            </div>
            <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg">
              {EMOJI_SUGGESTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: emoji })}
                  className={`text-2xl p-2 rounded hover:bg-gray-200 transition ${
                    formData.icon === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Or type your own emoji in the field above
            </p>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl"
              placeholder="🎮"
              maxLength={2}
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
              {loading ? 'Saving...' : category ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}