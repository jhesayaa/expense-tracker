'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '../dashboard/layout';
import CategoryModal from '@/components/CategoryModal';
import { categoryService, Category, CategoryInput } from '@/lib/category.service';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const cats = await categoryService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(undefined);
    setModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    // Only allow editing custom categories (user_id exists)
    if (category.user_id) {
      setEditingCategory(category);
      setModalOpen(true);
    }
  };

  const handleSubmitCategory = async (data: CategoryInput) => {
    if (editingCategory) {
      await categoryService.updateCategory(editingCategory.id, data);
    } else {
      await categoryService.createCategory(data);
    }
    fetchCategories();
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryService.deleteCategory(id);
        fetchCategories();
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to delete category');
      }
    }
  };

  // Filter categories
  const filteredCategories = categories.filter((cat) => {
    if (filter === 'all') return true;
    return cat.type === filter;
  });

  // Separate default and custom categories
  const defaultCategories = filteredCategories.filter((cat) => !cat.user_id);
  const customCategories = filteredCategories.filter((cat) => cat.user_id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">
              Manage your transaction categories
            </p>
          </div>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Add Category</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 inline-flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'income'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            💰 Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'expense'
                ? 'bg-red-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            💸 Expense
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading categories...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Custom Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {category.name}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                category.type === 'income'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {category.type}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Categories */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Default Categories
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {defaultCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {category.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            category.type === 'income'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty State */}
            {customCategories.length === 0 && defaultCategories.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <span className="text-4xl mb-4">📁</span>
                <p className="text-lg">No categories found</p>
                <p className="text-sm mt-2">
                  {filter !== 'all'
                    ? 'Try changing the filter'
                    : 'Add your first custom category!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitCategory}
        category={editingCategory}
      />
    </DashboardLayout>
  );
}