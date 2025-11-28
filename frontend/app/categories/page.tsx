'use client';

import { useEffect, useState } from 'react';
import DashboardWrapper from '../dashboard/DashboardWrapper';
import CategoryModal from '@/components/CategoryModal';
import { categoryService, Category, CategoryInput } from '@/lib/category.service';
import {
  PlusIcon,
  FolderIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

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

  const filteredCategories = categories.filter((cat) => {
    if (filter === 'all') return true;
    return cat.type === filter;
  });

  const defaultCategories = filteredCategories.filter((cat) => !cat.user_id);
  const customCategories = filteredCategories.filter((cat) => cat.user_id);

  return (
    <DashboardWrapper>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-gray-600 mt-1">Manage your transaction categories</p>
          </div>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Add Category</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-2 inline-flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              filter === 'all'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              filter === 'income'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
              filter === 'expense'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Expense
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading categories...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Custom Categories */}
            {customCategories.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <FolderIcon className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Your Custom Categories
                  </h2>
                  <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {customCategories.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {customCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-5 hover:shadow-xl transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-md">
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {category.name}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                                category.type === 'income'
                                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                                  : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
                              }`}
                            >
                              {category.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-all font-medium"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-lg hover:from-red-100 hover:to-rose-100 transition-all font-medium"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Categories */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FolderIcon className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Default Categories
                </h2>
                <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {defaultCategories.length}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {defaultCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 hover:shadow-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm">
                        {category.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                            category.type === 'income'
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700'
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
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                  <FolderIcon className="w-10 h-10 text-green-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">No categories found</p>
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
    </DashboardWrapper>
  );
}