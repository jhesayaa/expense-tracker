'use client';

import { useEffect, useState } from 'react';
import DashboardWrapper from './DashboardWrapper';
import api from '@/lib/api';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_income: number;
  total_expense: number;
  balance: number;
  transaction_count: number;
  category_breakdown: CategoryBreakdown[];
  recent_transactions: Transaction[];
}

interface CategoryBreakdown {
  category_id: number;
  category_name: string;
  category_icon: string;
  total_amount: number;
  count: number;
  percentage: number;
}

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  type: string;
  category: {
    id: number;
    name: string;
    icon: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardWrapper>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </DashboardWrapper>
    );
  }

  const statCards = [
    {
      title: 'Total Income',
      value: stats?.total_income || 0,
      icon: ArrowTrendingUpIcon,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Expense',
      value: stats?.total_expense || 0,
      icon: ArrowTrendingDownIcon,
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      textColor: 'text-red-700',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      title: 'Balance',
      value: stats?.balance || 0,
      icon: ScaleIcon,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: (stats?.balance || 0) >= 0 ? 'text-blue-700' : 'text-red-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Transactions',
      value: stats?.transaction_count || 0,
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isCount: true,
    },
  ];

  return (
    <DashboardWrapper>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, index) => { 
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`relative overflow-hidden bg-gradient-to-br ${card.bgGradient} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1`}
              >
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500`}></div>
                
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        {card.title}
                      </p>
                      <p className={`text-3xl font-bold ${card.textColor}`}>
                        {card.isCount
                          ? card.value
                          : `Rp ${card.value.toLocaleString()}`}
                      </p>
                    </div>
                    <div className={`${card.iconBg} p-3 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-6 h-6 ${card.iconColor}`} />
                    </div>
                  </div>
                  
                  {/* Progress bar or indicator */}
                  <div className="mt-4 pt-4 border-t border-white/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">
                        {card.isCount ? 'Total count' : 'This period'}
                      </span>
                      <div className={`flex items-center space-x-1 ${card.textColor} font-semibold`}>
                        <ChartBarIcon className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Breakdown & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Top Categories</h2>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-green-700">
                  {(stats?.category_breakdown || []).length} categories
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              {(stats?.category_breakdown || []).slice(0, 5).map((category, index) => (
                <div key={category.category_id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {category.category_icon}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">
                          {category.category_name}
                        </span>
                        <p className="text-xs text-gray-500">
                          {category.count} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900">
                        Rp {category.total_amount.toLocaleString()}
                      </span>
                      <p className="text-xs text-green-600 font-semibold">
                        {category.percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="relative w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {(!stats?.category_breakdown || stats.category_breakdown.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No category data yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 rounded-full">
                <span className="text-xs font-semibold text-blue-700">Latest 5</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {(stats?.recent_transactions || []).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <span className="text-2xl">{transaction.category.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-bold ${
                        transaction.type === 'income'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      Rp {transaction.amount.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500 capitalize">
                      {transaction.type}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!stats?.recent_transactions || stats.recent_transactions.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No transactions yet</p>
                  <p className="text-xs mt-1">Start adding your first transaction!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}