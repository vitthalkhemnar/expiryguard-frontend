import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShoppingCart, Layers, BarChart3, Trash2, LogOut, Receipt } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('pos')}>
            <div className="p-2 bg-emerald-500 rounded-lg text-slate-950 font-bold">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                ExpiryGuard
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                FEFO POS
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1">
            <button
              onClick={() => setCurrentTab('pos')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'pos'
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>POS Billing</span>
            </button>

            <button
              onClick={() => setCurrentTab('orders')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'orders'
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Orders & Invoices</span>
            </button>

            <button
              onClick={() => setCurrentTab('batches')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'batches'
                  ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Batch Lots</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics & Risk</span>
                </button>

                <button
                  onClick={() => setCurrentTab('disposals')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'disposals'
                      ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Waste & Disposals</span>
                </button>
              </>
            )}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-100">{user?.fullName}</div>
              <span
                className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-purple-900 text-purple-300 border border-purple-700' : 'bg-blue-900 text-blue-300 border border-blue-700'
                }`}
              >
                {isAdmin ? 'Store Manager' : 'Cashier'}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
