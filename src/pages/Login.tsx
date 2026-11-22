import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, User as UserIcon, ArrowRight, AlertCircle, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials or contact your Store Administrator.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl shadow-xl shadow-emerald-950 mb-4">
          <ShieldAlert className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">ExpiryGuard</h2>
        <p className="mt-2 text-sm text-slate-400">
          Smart Batch & Perishable Inventory Management Monolith
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800 pb-3 mb-6">
            <LogIn className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm text-slate-200">Staff Portal Login</span>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-sm flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Username
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              New cashier or store staff accounts are provisioned by your Store Operations Manager.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
