import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  ShoppingCart,
  Layers,
  BarChart3,
  Trash2,
  LogOut,
  Receipt,
  Users,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const navItems = [
    { id: 'pos', label: 'POS Billing', icon: ShoppingCart },
    { id: 'orders', label: 'Orders & Invoices', icon: Receipt },
    { id: 'batches', label: 'Batch Lots', icon: Layers },
    ...(isAdmin
      ? [
          { id: 'dashboard', label: 'Analytics & Risk', icon: BarChart3 },
          { id: 'disposals', label: 'Waste & Disposals', icon: Trash2 },
          { id: 'staff', label: 'Staff Management', icon: Users },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* ================================================================== */}
      {/* 1. Primary Top Header: Brand, Current User & Logout               */}
      {/* ================================================================== */}
      <div className="bg-slate-950 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Brand Logo */}
            <div
              className="flex items-center space-x-2.5 cursor-pointer group"
              onClick={() => setCurrentTab('pos')}
            >
              <div className="p-1.5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg text-slate-950 font-bold shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5 text-slate-950" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  ExpiryGuard
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
                  FEFO POS
                </span>
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2.5 bg-slate-900/90 py-1 px-3 rounded-lg border border-slate-800 text-xs">
                <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-100">{user?.fullName || 'Active Staff'}</span>
                  <span
                    className={`ml-2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isAdmin
                        ? 'bg-purple-950 text-purple-300 border border-purple-800/60'
                        : 'bg-blue-950 text-blue-300 border border-blue-800/60'
                    }`}
                  >
                    {isAdmin ? 'Store Manager' : 'Cashier'}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/50 rounded-lg text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. Secondary Workspace Navigation: Clean White Toolbar Ribbon     */}
      {/* ================================================================== */}
      <div className="bg-white border-b border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5 overflow-x-auto scrollbar-none items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`group flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/90 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
