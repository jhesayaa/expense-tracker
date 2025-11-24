'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/lib/auth.service';
import {
  ChartBarIcon,
  CreditCardIcon,
  FolderIcon,
  DocumentChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Get user data
    const userData = authService.getStoredUser();
    setUser(userData);
  }, [router]);

  const handleLogout = () => {
    authService.logout();
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  const menuItems = [
    { path: '/dashboard', icon: ChartBarIcon, label: 'Dashboard' },
    { path: '/transactions', icon: CreditCardIcon, label: 'Transactions' },
    { path: '/categories', icon: FolderIcon, label: 'Categories' },
    { path: '/reports', icon: DocumentChartBarIcon, label: 'Reports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-green-600 via-emerald-600 to-teal-600 shadow-2xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-white/20">
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-white">
                <div className="text-xl font-bold">Expense</div>
                <div className="text-xs text-green-100">Tracker</div>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/10 p-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-white text-green-700 shadow-lg scale-105'
                      : 'text-white hover:bg-white/10 hover:translate-x-1'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'
                    } transition-transform`}
                  />
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-4 border-t border-white/20">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-3">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-green-100 truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {pathname === '/dashboard' && 'Dashboard'}
                {pathname === '/transactions' && 'Transactions'}
                {pathname === '/categories' && 'Categories'}
                {pathname === '/reports' && 'Reports'}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Welcome,</span>
                <span className="text-sm font-semibold text-green-700">{user.name}!</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}